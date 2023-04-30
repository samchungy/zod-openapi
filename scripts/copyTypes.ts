import { promises as fs } from 'fs';
import { join, relative } from 'path';
const cwd = process.cwd();

async function copyDTs(src: string, dest: string): Promise<void> {
  const files = await fs.readdir(src);
  for (const file of files) {
    const filePath = join(src, file);
    const destPath = join(dest, file);
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) {
      await copyDTs(filePath, destPath);
    } else if (filePath.endsWith('.d.ts')) {
      const dirPath = join(
        dest,
        relative(src, filePath).split('/').slice(0, -1).join('/'),
      );
      await fs.mkdir(dirPath, { recursive: true });
      await fs.copyFile(
        filePath,
        `${destPath.slice(0, destPath.length - 5)}.ts`,
      );
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
  const src = join(cwd, './node_modules/openapi3-ts');
  const dest = join(cwd, 'src/openapi3-ts');
  await deleteFolderRecursive(dest);
  await copyDTs(src, dest);
}

// eslint-disable-next-line no-console
main().catch(console.error);
