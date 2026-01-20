import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import _ from 'lodash';
import csvToJson from 'csvtojson';

const dataDirectory = path.join(process.cwd(), 'src', 'statements');
const dbDirectory = path.join(process.cwd(), 'src', 'db');

const renames: Record<string, string> = {
  FRC: 'FRCB',
  FB: 'META',
};

async function getFile(fileName: string) {
  const fullPath = path.join(dataDirectory, fileName);
  return readFile(fullPath, 'utf8');
}

async function getFiles() {
  const fileNames = await readdir(dataDirectory);
  return Promise.all(fileNames.map(getFile));
}

function groupData(file: string) {
  const lines = file.replace(new RegExp('\\. Price', 'g'), '-Price').split('\n');
  const grouped = _.groupBy(lines, (line) => line.split(',')[0]);
  return _.mapValues(grouped, (val) => val.join('\n'));
}

async function getSectionJson(sectionCsv: string) {
  if (!sectionCsv) return [];
  const json = await csvToJson({ delimiter: ',' }).fromString(sectionCsv);
  return json
    .filter((i) => i.Header === 'Data')
    .map((i) => ({
      ...i,
      ...(i.Symbol && { Symbol: renames[i.Symbol] || i.Symbol }),
    }));
}

async function writeToDb(data: unknown, originalName: string) {
  const fileName = _.camelCase(originalName);
  const fullPath = path.join(dbDirectory, `${fileName}.json`);
  await writeFile(fullPath, JSON.stringify(data, null, 2));
}

async function main() {
  await mkdir(dbDirectory, { recursive: true });
  const files = await getFiles();
  const groupedFiles = files.map(groupData);

  // Collect all unique section names from all files
  const allSections = new Set<string>();
  groupedFiles.forEach((group) => {
    Object.keys(group).forEach((key) => allSections.add(key));
  });

  for (const sectionName of allSections) {
    const allDataForSection = [];
    for (const group of groupedFiles) {
      const sectionCsv = group[sectionName];
      if (sectionCsv) {
        const data = await getSectionJson(sectionCsv);
        allDataForSection.push(...data);
      }
    }

    if (allDataForSection.length > 0) {
      await writeToDb(allDataForSection, sectionName);
      console.log(`Pocessed ${sectionName} -> ${allDataForSection.length} items`);
    }
  }
}

main();
