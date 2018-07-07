#!/usr/bin/env node


import program from 'commander';
import debug from 'debug';
import { version as pageLoaderVersion } from '../../package.json';
import pageLoader from '..';

const log = debug('page-loader:cli');
const currentDir = process.cwd();
program
  .description('Downloads page from specified url and saves it to current or specified output folder.')
  .version(pageLoaderVersion)
  .option('-o, --output [directory]', 'Output folder', currentDir)
  .arguments('<targetUrl>')
  .action(async (targetUrl) => {
    log(`Command line launch with:\n\tUrl: ${targetUrl}\n\tOutput dir: ${program.output}`);
    try {
      await pageLoader(targetUrl, program.output);
    } catch (e) {
      console.log(e.message);
    }
  })
  .parse(process.argv);

const programArgs = process.argv.slice(2);

if (programArgs.length === 0) {
  program.help();
}
