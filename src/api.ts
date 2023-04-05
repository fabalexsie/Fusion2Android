import express from 'express';
import { checkProjectPw, getNewProject } from './db';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { spawn } from 'child_process';

export const apiRouter = express.Router();

const upload = multer({ dest: 'data/uploads' });

const dataStorage = path.join(__dirname, 'data');
/*
 * File structure:
 * data
 *   - project1-uuid
 *     - model1-name
 *       - cover.png (#TODO)
 *       - model.udsz
 *       - model.png
 *       - model.bin
 *     - model2-name
 *       - model.udsz
 *       - model.png
 *       - model.bin
 *  - project2-uuid
 *    - ...
 */

apiRouter.get('/', (req, res) => {
  res.send('API is available');
});

apiRouter.get('/newProject', (req, res) => {
  const proj = getNewProject();
  res.send(proj);
});

apiRouter.get('/:project/models', (req, res) => {
  // check user folder for model names
  // return list of model names (for google link)
  const modelList = fs
    .readdirSync(path.join(dataStorage, req.params.project))
    .map((folderName) => {
      const starterFile = fs
        .readdirSync(folderName)
        .filter((file) => path.extname(file) === '.gltf')[0];
      return {
        name: folderName,
        cover: `/${req.params.project}/${folderName}/cover.png`,
        link: `/${req.params.project}/${folderName}/${starterFile}`,
      };
    });
  res.send(modelList);
});

apiRouter.post(
  '/:project/upload?pw=:pw',
  upload.single('model'),
  (req, res) => {
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
              console.log(err);
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
  }
);

function clearFolder(directory: string) {
  for (const file of fs.readdirSync(directory)) {
    fs.unlinkSync(path.join(directory, file));
  }
}

function getModelName(fileName: string): string {
  return path
    .basename(fileName, '.udsz')
    .replace(/v[0-9]+/g, '')
    .trim();
}
