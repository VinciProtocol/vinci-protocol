const fs = require("fs/promises");
const path = require("path");
const { rawListeners } = require("process");

const ROOT = path.resolve(__dirname, "..");
const sourcePath = path.resolve(ROOT, "./hardhat.config.in.ts");
const targetPath = path.resolve(ROOT, "./hardhat.config.ts");

const importAllConfigModulesFromDir = async (dirname) => {
  try{
    const files = await fs.readdir(path.join(ROOT, dirname));
    const importList = [];
    const networks = [];
    files
      .filter((fileName) => fileName.endsWith(".ts"))
      .forEach((fileName) => {
        const n = fileName.slice(0, -3);
        const p = path.join("./", dirname, n);
        importList.push(`import ${n} from './${p}'`);
        networks.push(n);
      });
    return {
      importList,
      networks,
    };
  }
  catch (e){
    return {
      importList: [],
      networks: [],
    }
  }
};

const importAllConfigModulesFromMultipleDirs = (dirnames) => (
  dirnames
    .map((dirname) => (importAllConfigModulesFromDir(dirname)))
    .reduce(
      async (acc, value) => {
        const accumulator = await acc;
        const {importList, networks} = await value;
        accumulator.importList = accumulator.importList.concat(importList);
        accumulator.networks = accumulator.networks.concat(networks);
        return Promise.resolve(acc);
      },
      Promise.resolve({importList: [], networks: []})
    )
);

const main = async () => {
  const source = await fs.readFile(sourcePath, { encoding: "utf-8" });
  const { importList, networks } = await importAllConfigModulesFromMultipleDirs(
    ["networks/test",
    "networks/deployment",]
  );
  const target = `${importList.join("\n")}
${source}
export const networks = {${networks.join(",")}};`;
  fs.writeFile(targetPath, target, { encoding: "utf-8" });
};

main();
