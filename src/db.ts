import { randomUUID } from 'crypto';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('data/db.sqlite');

type ProjectInfo = {
  projectId: string;
  name: string;
};
// type Project combines type ProjectInfo with the password
type Project = ProjectInfo & {
  pw: string;
};

db.serialize(() => {
  db.run(
    'CREATE TABLE IF NOT EXISTS projects (projectId TEXT, name TEXT, pw TEXT)'
  );
});

export function getNewProject(): Project {
  const projectId = randomUUID();
  const name = projectId;
  const pw = randomUUID();

  const stmt = db.prepare('INSERT INTO projects VALUES (?, ?, ?)');
  stmt.run([projectId, name, pw]);
  stmt.finalize();

  return {
    projectId: projectId,
    name: name,
    pw: pw,
  };
}

export function getProjectInfo(projectId: string): Promise<ProjectInfo> {
  return new Promise((resolve) => {
    db.get(
      'SELECT * FROM projects WHERE projectId = ?',
      [projectId],
      (err: Error, row: Project) => {
        if (err || !row) {
          console.error(err);
          resolve({ projectId: '', name: '' });
          return;
        }
        resolve({ projectId: row.projectId, name: row.name });
      }
    );
  });
}

export function updateProjectInfo(projectInfo: ProjectInfo): Promise<boolean> {
  return new Promise((resolve) => {
    const stmt = db.prepare('UPDATE projects SET name = ? WHERE projectId = ?');
    stmt.run([projectInfo.name, projectInfo.projectId]);
    stmt.finalize();
    resolve(true);
  });
}

export function checkProjectPw(
  projectId: string,
  pw: string
): Promise<boolean> {
  return new Promise((resolve) => {
    db.all(
      'SELECT * FROM projects WHERE projectId = ?',
      [projectId],
      (err: Error, rows: Project[]) => {
        if (err) {
          console.error(err);
          resolve(false);
          return;
        }
        rows.forEach((row) => {
          if (row.pw === pw) {
            resolve(true);
            return;
          }
        });
        resolve(false);
        return;
      }
    );
  });
}
