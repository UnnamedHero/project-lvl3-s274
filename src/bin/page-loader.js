#!/usr/bin/env node

import program from 'commander';
// import cwd from 'process';
import { version as pageLoaderVersion } from '../../package.json';
import pageLoader from '..';

const currentDir = process.cwd();
program
  .description('Downloads page from specified url and saves it to current or specified output folder.')
  .version(pageLoaderVersion)
  .option('-o, --output [directory]', 'Output folder', currentDir)
  .arguments('<targetUrl>')
  .action((targetUrl) => {
    console.log(pageLoader(targetUrl, program.output));
  })
  .parse(process.argv);

const programArgs = process.argv.slice(2);

if (programArgs.length === 0) {
  program.help();
}
