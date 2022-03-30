import {readdir} from 'fs/promises';
import path from 'path';

export const importAllConfigModulesFromDir = async(dirname: string) => {
    const modules = {};
    
    try {
      console.log('reading dir: ' + path.join(__dirname, dirname));
      const files = await readdir(path.join(__dirname, dirname));
      console.log('all files: ' + JSON.stringify(files));
      const modulePromise = [];
      files.filter((fileName) => fileName.endsWith(".ts"))
        .forEach((fileName) => {
          modulePromise.push(import(path.join('./', dirname, fileName))
            .then((imported) => {
              console.log('got: ' + fileName);
              modules[fileName.slice(0, -3)] = imported;
            }).catch((reson) => {}));
          });
      await Promise.all(modulePromise);
    }
    catch {
      console.log('caught an error.');
    }
    finally{
      console.log('will return:' + JSON.stringify(modules));
      return modules;
    }
}