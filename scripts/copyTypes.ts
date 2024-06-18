import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { join, relative } from 'path';
import util from 'util';

import { Git } from 'skuba';

async function copyDTs(src: string, dest: string): Promise<void> {
  const files = await fs.readdir(src);
  for (const file of files) {
    const filePath = join(src, file);
    const destPath = join(dest, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await copyDTs(filePath, destPath);
      continue;
    }
    if (filePath.endsWith('.d.ts')) {
      const dirPath = join(
        dest,
        relative(src, filePath).split('/').slice(0, -1).join('/'),
      );
      await fs.mkdir(dirPath, { recursive: true });
      const destination = `${destPath.slice(0, destPath.length - 5)}.ts`;
      await fs.copyFile(filePath, destination);

      const contents = (await fs.readFile(destination)).toString('utf-8');
      if (contents.includes('export { Server, ServerVariable }')) {
        const patched = contents.replaceAll(
          'export { Server, ServerVariable }',
          'export type { Server, ServerVariable }',
        );
        await fs.writeFile(destination, Buffer.from(patched));
      }
    }
  }
}

async function deleteFolderRecursive(folderPath: string) {
  const files = await fs.readdir(folderPath);

  for (const file of files) {
    const filePath = join(folderPath, file);
    const stats = await fs.stat(filePath);

    if (stats.isDirectory()) {
      await deleteFolderRecursive(filePath);
    } else {
      await fs.unlink(filePath);
    }
  }

  await fs.rmdir(folderPath);
}

async function main() {
  const dir = process.cwd();

  const src = join(dir, './node_modules/openapi3-ts');
  const dest = join(dir, 'src/openapi3-ts');
  await deleteFolderRecursive(dest);
  await copyDTs(src, dest);
  await util.promisify(exec)('pnpm skuba format');

  if (process.env.GITHUB_ACTIONS) {
    const files = await Git.getChangedFiles({ dir });
    if (files.some(({ path }) => path.startsWith('src/openapi3-ts'))) {
      throw new Error('openapi3-ts types need updating');
    }
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  throw error;
});
