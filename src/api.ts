import express from 'express';
import { checkProjectPw, getNewProject } from './db';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { spawn } from 'child_process';

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
 *         - model.udsz
 *         - model.png
 *         - model.bin
 *       - model2-name
 *         - model.udsz
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
  const modelList = fs
    .readdirSync(path.join(dataStorage, req.params.projectId))
    .map((folderName) => {
      const starterFile = fs
        .readdirSync(folderName)
        .filter((file) => path.extname(file) === '.gltf')[0];
      return {
        name: folderName,
        cover: `/${req.params.projectId}/${folderName}/cover.png`,
        link: `/${req.params.projectId}/${folderName}/${starterFile}`,
      };
    });
  res.send(modelList);
});

/** needs ?pw=:pw parameter */
apiRouter.post('/proj/:project/upload', upload.single('model'), (req, res) => {
  // check user pw in db
  // put model udsz file in user folder inside model name folder
  // run python converter
  // ~ https://stackoverflow.com/a/44424950
  // return success or fail
  checkProjectPw(req.params.project, req.params.pw).then((success) => {
    if (success) {
      if (
        req.file &&
        (path.basename(req.file.originalname).endsWith('.udsz') ||
          path.basename(req.file.originalname).endsWith('.uds'))
      ) {
        const modelName = getModelName(req.file.originalname);
        const modelFolder = path.join(
          dataStorage,
          req.params.project,
          modelName
        );
        fs.mkdirSync(modelFolder, { recursive: true });
        clearFolder(modelFolder);

        fs.writeFile(modelFolder, req.file.buffer, (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error writing file');
          }

          const pyExec = spawn('python', ['python/convert.py', modelFolder], {
            cwd: path.dirname(__dirname),
          });

          pyExec.on('close', (code) => {
            if (code === 0) {
              res.send('Success');
            } else {
              res.status(500).send('Error converting file');
            }
          });
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
    .basename(fileName, '.udsz')
    .replace(/\sv[0-9]+/g, '')
    .trim();
}
