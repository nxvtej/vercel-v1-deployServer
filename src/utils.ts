import { exec } from "child_process";
import path from "path";


export function buildProject(id: string) {
    return new Promise((resolve, reject) => {
        exec(`cd ${path.join(__dirname, `output/${id}`)} && npm install && npm run build`, (err, stdout, stderr) => {
            if (err) {
                reject(err);
            } else {
                resolve(stdout);
            }
        });
    });
}