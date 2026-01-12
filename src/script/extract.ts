import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import _ from "lodash";
import csvToJson from "csvtojson";

const dataDirectory = path.join(process.cwd(), "src", "statements");
const dbDirectory = path.join(process.cwd(), "src", "db");

const tables = { trades: "Trades", dividends: "Dividends" };

const renames: Record<string, string> = {
  FRC: "FRCB",
  FB: "META",
};

type Table = keyof typeof tables;

const keys = Object.keys(tables) as Table[];

async function getFile(fileName: string) {
  const fullPath = path.join(dataDirectory, fileName);
  return readFile(fullPath, "utf8");
}

async function getFiles() {
  const fileNames = await readdir(dataDirectory);
  return Promise.all(fileNames.map(getFile));
}

function groupData(file: string) {
  const lines = file.replace(new RegExp(". Price", "g"), "-Price").split("\n");
  const grouped = _.groupBy(lines, (line) => line.split(",")[0]);
  return _.mapValues(grouped, (val) => val.join("\n"));
}

async function getJson(group: Record<string, string>, key: Table) {
  const text = group[tables[key]];
  if (!text) return [];
  const json = await csvToJson({ delimiter: "," }).fromString(text);
  return json
    .filter((i) => i.Header === "Data")
    .map((i) => ({
      ...i,
      ...(i.Symbol && { Symbol: renames[i.Symbol] || i.Symbol }),
    }));
}

async function writeToDb(data: any, name: string) {
  const fullPath = path.join(dbDirectory, `${name}.json`);
  await writeFile(fullPath, JSON.stringify(data, null, 2));
}

async function main() {
  await mkdir(dbDirectory, { recursive: true });
  const files = await getFiles();
  const grouped = files.map(groupData);

  for await (const key of keys) {
    const data = [];
    for await (const group of grouped) {
      const json = await getJson(group, key);
      data.push(...json);
    }
    await writeToDb(data, key);
  }
}

main();
