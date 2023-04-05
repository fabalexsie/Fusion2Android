import { randomUUID } from 'crypto';
import { resolve } from 'path';
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database('data/db.sqlite');

type Project = {
  projectId: string;
  pw: string;
};

db.serialize(() => {
  db.run('CREATE TABLE projects IF NOT EXISTS (projectid TEXT, pw TEXT)');
});

export function getNewProject(): Project {
  const projectId = randomUUID();
  const pw = randomUUID();

  const stmt = db.prepare('INSERT INTO projects VALUES (?, ?)');
  stmt.run([projectId, pw]);
  stmt.finalize();

  return {
    projectId: projectId,
    pw: pw,
  };
}

export function checkProjectPw(
  projectId: string,
  pw: string
): Promise<boolean> {
  return new Promise((resolve) => {
    db.all(
      'SELECT * FROM projects WHERE projectid = ?',
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
