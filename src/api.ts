import express from 'express';
import { checkProjectPw, getNewProject, getProjectInfo } from './db';
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
 * Example response: {projectId: 319bcee5-1d1f-4fc3-aaa0-5102b2ae3b2a, pw: b6e2d59a-dfb9-4610-a2a7-a0ece202c23f}
 */
apiRouter.get('/newProject', (req, res) => {
  const proj = getNewProject();
  fs.mkdirSync(path.join(dataStorage, proj.projectId), { recursive: true });
  res.send(proj);
});

apiRouter.get('/proj/:projectId/info', (req, res) => {
  getProjectInfo(req.params.projectId).then((projInfo) => {
    res.send(projInfo);
  });
});

apiRouter.get('/proj/:projectId/models', (req, res) => {
  // check user folder for model names
  // return list of model names (for google link)
  const projFolder = path.join(dataStorage, req.params.projectId);
  const modelList = fs.readdirSync(projFolder).map((folderName) => {
    let link = '';
    try {
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
        // Create folder for model (if it doesn't exist)
        // and clear it of any old files
        const modelName = getModelName(req.file.originalname);
        const modelFolder = path.join(
          dataStorage,
          req.params.project,
          modelName
        );
        fs.mkdirSync(modelFolder, { recursive: true });
        clearFolder(modelFolder);

        // add .usdz extension to file
        const newFilePath = `${req.file.path}.usdz`;
        fs.renameSync(req.file.path, newFilePath);

        // run python converter
        let pyExec;
        if (process.env.IS_DEV === 'true') {
          pyExec = exec(
            `conda activate usdz && python "python/usdz2gltf.py" "${newFilePath}" "${modelFolder}"`,
            {
              cwd: path.dirname(__dirname),
            }
          );
          if (pyExec.stdout)
            pyExec.stdout.on('data', (data) => {
              console.log(`stdout: ${data}`);
            });

          if (pyExec.stderr)
            pyExec.stderr.on('data', (data) => {
              console.error(`stderr: ${data}`);
            });
        } else {
          pyExec = exec(
            `python3 "python/usdz2gltf.py" "${newFilePath}" "${modelFolder}"`,
            {
              cwd: path.dirname(__dirname),
            }
          );
        }

        pyExec.on('close', (code) => {
          if (code === 0) {
            // conversion was successful
            res.send({ success: true });
            fs.unlinkSync(newFilePath);
          } else {
            res.status(500).send('Error converting file');
          }
        });
      } else {
        res.status(400).send("File isn't a uds(z) file");
        if (req.file) fs.unlinkSync(req.file.path);
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
