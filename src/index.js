import debug from 'debug';
import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import Listr from 'listr';
import axios from './lib/axios';
import { makeNameFromUrl } from './helpers/name';
import {
  makePage, getPagaeLocalLinks, changePageLocalLinksTo, getPageHtml,
} from './helpers/page';

const log = debug('page-loader:core');

const prepareDownloadTasks = (linksAndFiles) => {
  const tasks = linksAndFiles
    .map(({ linkUrl, linklocalPath }, index) => ({
      title: linkUrl,
      task: (ctx) => {
        log(`start downloading [${linkUrl}]`);
        return axios.get(linkUrl, { responseType: 'stream' })
          .then((response) => {
            ctx[index] = { response, linkUrl, linklocalPath };
          });
      },
    }));
  return new Listr(tasks, { concurrent: true });
};

const saveDownloadedResources = (downloads) => {
  const responses = Object.values(downloads);
  return Promise.all(responses
    .map(download => new Promise((resolve, reject) => {
      const { response, linkUrl, linklocalPath } = download;
      log(`resource [${linkUrl}] downloaded`);
      response.data.pipe(fs.createWriteStream(linklocalPath)
        .on('finish', () => resolve(`resource [${linkUrl}] was saved to [${linklocalPath}]`))
        .on('error', e => reject(new Error(`[${e}] Unable to save [${linkUrl}]`))));
    })));
};

const showResultsInDebugMode = resourceFiles => resourceFiles
  .forEach((result) => {
    log(result);
  });

const pageLoader = (targetUrl, destinationDir) => {
  log(`BEGIN with\n\turl: ${targetUrl}\n\tdirectory: ${destinationDir}`);
  const pageName = makeNameFromUrl(targetUrl);
  const htmlName = `${pageName}.html`;
  const htmlFilePath = path.join(destinationDir, htmlName);
  const resourceDirPath = path.join(destinationDir, `${pageName}_files`);
  log(`check dir [${destinationDir}] exists and writable`);
  return fs.access(destinationDir, fs.constants.W_OK)
    .then(() => {
      log(`check if destination file [${htmlFilePath}] already exists`);
      return fs.open(htmlFilePath, 'wx');
    })
    .then(() => fs.remove(htmlFilePath))
    .then(() => {
      log(`downloading [${targetUrl}]`);
      return axios.get(targetUrl);
    })
    .then((response) => {
      log('page downloaded');
      const page = makePage(response.data);
      const links = getPagaeLocalLinks(page);
      const localResourcesPath = `${pageName}_files`;
      changePageLocalLinksTo(page, localResourcesPath);
      const linkslocalPaths = getPagaeLocalLinks(page);
      const linksAndFiles = links.map((link, index) => {
        const linkUrl = url.resolve(targetUrl, link);
        const linklocalPath = path.join(destinationDir, linkslocalPaths[index]);
        return ({ linkUrl, linklocalPath });
      });
      const html = getPageHtml(page);
      log(`saving page to [${htmlFilePath}]`);
      return fs.writeFile(htmlFilePath, html)
        .then(() => {
          log(`make resource dir [${resourceDirPath}]`);
          return fs.mkdir(resourceDirPath);
        })
        .then(() => prepareDownloadTasks(linksAndFiles))
        .then(downloadTasks => downloadTasks.run())
        .then(saveDownloadedResources)
        .then(showResultsInDebugMode)
        .then(() => {
          log('END');
          console.log(`Page was downloaded to ${htmlFilePath}`);
        });
    });
};

export default pageLoader;
