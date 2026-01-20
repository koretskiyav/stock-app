import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import _ from 'lodash';

const dbDirectory = path.join(process.cwd(), 'src', 'db');
const dataDirectory = path.join(process.cwd(), 'src', 'data');

async function getJsonFiles() {
  const files = await readdir(dbDirectory);
  return files.filter((f) => f.endsWith('.json') && f !== 'README.md');
}

function getType(value: unknown): 'string' | 'number' | 'boolean' {
  if (value === null || value === undefined) return 'string'; // Default
  const num = Number(value);
  if (!isNaN(num) && value !== '') return 'number';
  return 'string';
}

function inferSchema(data: Record<string, unknown>[]) {
  const schema: Record<string, string> = {};
  // Scan first 100 items to check for non-empty values to infer type
  const sample = data.slice(0, 100);

  if (sample.length === 0) return {};

  const keys = Object.keys(sample[0]);

  for (const key of keys) {
    let type = 'string';
    for (const item of sample) {
      const t = getType(item[key]);
      if (t === 'number') {
        type = 'number';
        break;
      }
    }
    // Check if ALL are numbers or just some?
    // If any is NOT a number (and not empty), fall back to string.
    // But CSVs are strings. "1,000" might fail Number().
    // Let's be aggressive: if valid number, treat as number.
    schema[key] = type;
  }
  return schema;
}

function generateMeta(fileName: string, data: Record<string, unknown>[]) {
  const rawName = 'Raw' + _.upperFirst(_.camelCase(fileName.replace('.json', '')));
  const paramsName = _.upperFirst(_.camelCase(fileName.replace('.json', '')));
  const keys = Object.keys(data[0] || {});

  // Infer types
  const schema = inferSchema(data);

  // Raw Interface
  const rawInterface =
    `interface ${rawName} {\n` + keys.map((k) => `  "${k}": string;`).join('\n') + '\n}';

  // Clean Interface
  const cleanInterface =
    `export interface ${paramsName} {\n` +
    keys.map((k) => `  ${_.camelCase(k)}: ${schema[k]};`).join('\n') +
    '\n}';

  // Mapper
  const mapper =
    `export const ${_.camelCase(paramsName)}: ${paramsName}[] = (data as ${rawName}[]).map(item => ({\n` +
    keys
      .map((k) => {
        const cleanKey = _.camelCase(k);
        const isNum = schema[k] === 'number';
        const val = `item["${k}"]`;
        // Handle number conversion with 0 fallback for safety if empty
        const mappedVal = isNum ? `Number(${val} || 0)` : val;
        return `  ${cleanKey}: ${mappedVal},`;
      })
      .join('\n') +
    '\n}));';

  return {
    rawName,
    paramsName,
    content: `import data from "../db/${fileName}";\n\n${rawInterface}\n\n${cleanInterface}\n\n${mapper}\n`,
  };
}

async function main() {
  const files = await getJsonFiles();
  const indexExports: string[] = [];

  for (const file of files) {
    console.log(`Processing ${file}...`);
    const content = await readFile(path.join(dbDirectory, file), 'utf8');
    const data = JSON.parse(content);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`Skipping ${file} - empty or not array`);
      continue;
    }

    const meta = generateMeta(file, data);
    const outName = file.replace('.json', '.ts');
    await writeFile(path.join(dataDirectory, outName), meta.content);

    const moduleName = outName.replace('.ts', '');
    indexExports.push(`export * from "./${moduleName}";`);
  }

  await writeFile(path.join(dataDirectory, 'index.ts'), indexExports.join('\n'));
  console.log('Done.');
}

main();
