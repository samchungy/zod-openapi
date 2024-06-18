import { readFileSync, rmSync, writeFileSync } from 'node:fs';

import fg from 'fast-glob';

const run = async () => {
  const paths = await fg(['lib-esm/**/*.d.ts']);

  for (const esmPath of paths) {
    const esmContent = readFileSync(esmPath, { encoding: 'utf8' });

    // Fix file extensions
    const cjsPath = esmPath.replace('.d.ts', '.d.mts');

    // Fix import/export references
    const cjsContent = esmContent
      .replace(/(.+ from )'(\..+)'/g, "$1'$2.mjs'")
      .replace(/import '(\..+)'/g, "import '$1.mjs'");

    writeFileSync(cjsPath, cjsContent);
    rmSync(esmPath);
  }
};

// eslint-disable-next-line no-console
run().catch(console.error);
