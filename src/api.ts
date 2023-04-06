import express from 'express';
import { checkProjectPw, getNewProject } from './db';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { exec } from 'child_process';

export const apiRouter = express.Router();

const upload = multer({ dest: 'data/uploads' });

const dataStorage = path.join(path.dirname(__dirname), 'data', 'userFiles');
/*
 * File structure:
 * data
 *   - userFiles
 *     - project1-uuid
 *       - model1-name
 *         - cover.png (#TODO)
 *         - model.usdz
 *         - model.png
 *         - model.bin
 *       - model2-name
 *         - model.usdz
 *         - model.png
 *         - model.bin
 *    - project2-uuid
 *      - ...
 *
 * Supported endpoints:
 * GET /api
 *  - returns 'API is available'
 * GET /api/newProject
 *  - returns new project uuid and password
 * GET /api/:project/models
 *  - returns list of models in project with cover and link
 * POST /api/:project/upload?pw=:pw
 *  - uploads model file to model folder inside project folder and converts it to gltf
 */

apiRouter.get('/', (req, res) => {
  res.send('API is available');
});

/**
 * Example response: {projectId: 2b4c5076-10c2-4598-9be6-85ffae68c7fe, pw: 590b2801-cc47-4c2d-9233-433891fb86db}
 */
apiRouter.get('/newProject', (req, res) => {
  const proj = getNewProject();
  fs.mkdirSync(path.join(dataStorage, proj.projectId), { recursive: true });
  res.send(proj);
});

apiRouter.get('/proj/:projectId/models', (req, res) => {
  // check user folder for model names
  // return list of model names (for google link)
  const projFolder = path.join(dataStorage, req.params.projectId);
  const modelList = fs.readdirSync(projFolder).map((folderName) => {
    let link = '';
    try {
      console.log(`try to read inside ${folderName}`);
      const starterFile = fs
        .readdirSync(path.join(projFolder, folderName))
        .filter((file) => path.extname(file) === '.gltf')[0];
      link = `/models/${req.params.projectId}/${folderName}/${starterFile}`;
    } catch (e) {
      console.error(`starter file doesn't exist for ${folderName}`);
    }
    return {
      name: folderName,
      cover: `/models/${req.params.projectId}/${folderName}/cover.png`,
      link: link,
    };
  });
  res.send(modelList);
});

apiRouter.get('/proj/:projectId/checkPw', (req, res) => {
  // check user pw in db
  // return success or fail
  const pw: string = req.query.pw as string;
  checkProjectPw(req.params.projectId, pw).then((success) => {
    res.send({ success: success });
  });
});

/** needs ?pw=:pw parameter */
apiRouter.post('/proj/:project/upload', upload.single('model'), (req, res) => {
  // check user pw in db
  // locate file in upload folder
  // run python converter
  // ~ https://stackoverflow.com/a/44424950
  // return success or fail
  const pw: string = req.query.pw as string;
  checkProjectPw(req.params.project, pw).then((success) => {
    if (success) {
      if (
        req.file &&
        (path.basename(req.file.originalname).endsWith('.usdz') ||
          path.basename(req.file.originalname).endsWith('.usd'))
      ) {
        const modelName = getModelName(req.file.originalname);
        const modelFolder = path.join(
          dataStorage,
          req.params.project,
          modelName
        );
        fs.mkdirSync(modelFolder, { recursive: true });
        clearFolder(modelFolder);

        const newFilePath = `${req.file.path}.usdz`;
        fs.renameSync(req.file.path, newFilePath);

        // TODO: check if we are in docker container, then no need to activate conda env
        const pyExec = exec(
          `conda activate usdz && python "python/usdz2gltf.py" "${newFilePath}" "${modelFolder}"`,
          {
            cwd: path.dirname(__dirname),
          }
        );

        /*
        if (pyExec.stdout)
          pyExec.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
          });

        if (pyExec.stderr)
          pyExec.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
          });
        */

        pyExec.on('close', (code) => {
          if (code === 0) {
            res.send({ success: true });
          } else {
            res.status(500).send('Error converting file');
          }
        });
      } else {
        res.status(400).send("File isn't a uds(z) file");
      }
    } else {
      res.status(403).send("Password doesn't match");
    }
  });
});

function clearFolder(directory: string) {
  for (const file of fs.readdirSync(directory)) {
    fs.unlinkSync(path.join(directory, file));
  }
}

function getModelName(fileName: string): string {
  return path
    .basename(fileName, '.usdz')
    .replace(/\sv[0-9]+/g, '')
    .trim();
}
