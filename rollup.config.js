import * as path from 'path';
import fse from 'fs-extra';
import resolve from '@rollup/plugin-node-resolve';
import inlineCode from 'rollup-plugin-inline-code';

// 清空目标目录
fse.emptyDirSync(path.join(process.cwd(), 'dist'))

export default {
  context: "this",
  input: "src/index.js",
  output: [
    {
      file: "dist/index.js",
      format: "esm",
    },
  ],
  plugins: [
    resolve(),
    inlineCode(),
  ]
}