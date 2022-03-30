const fs = require("fs/promises");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const sourcePath = path.resolve(ROOT, "./scripts/hardhat.config.ts");
const targetPath = path.resolve(ROOT, "./hardhat.config.ts");

const importAllConfigModulesFromDir = async (dirname) => {
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
};

const main = async () => {
  const source = await fs.readFile(sourcePath, { encoding: "utf-8" });
  const { importList, networks } = await importAllConfigModulesFromDir(
    "networks/test"
  );
  const target = `
  ${importList.join("\n")}
  ${source}
  export const networks = {${networks.join(",")}};
  `;
  fs.writeFile(targetPath, target, { encoding: "utf-8" });
};

main();
