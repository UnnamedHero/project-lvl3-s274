import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import axios from './lib/axios';
import { makeNameFromUrl } from './helpers/name';
import {
  makePageHelper, getLocalPageLinks, changeLocalResourcesSourceTo, getPageHtml,
} from './helpers/page';

const getPageHelper = response => new Promise((resolve) => {
  resolve(makePageHelper(response.data));
});

const getLinks = pageHelper => new Promise((resolve) => {
  const links = getLocalPageLinks(pageHelper);
  resolve({ links, pageHelper });
});

const modifyPageLinks = (pageHelperAndLinks, targetUrl, destinationDir) => {
  const pageHelperAndLinksObject = new Promise((resolve) => {
    const { pageHelper, links } = pageHelperAndLinks;
    const pageName = makeNameFromUrl(targetUrl);
    const localResourcesPath = `${pageName}_files`;
    changeLocalResourcesSourceTo(pageHelper, localResourcesPath);
    const linkslocalPaths = getLocalPageLinks(pageHelper);
    const linksObject = links.map((link, index) => {
      const linkUrl = url.resolve(targetUrl, link);
      const linklocalPath = path.join(destinationDir, linkslocalPaths[index]);
      return ({ linkUrl, linklocalPath });
    });
    resolve({ pageHelper, linksObject });
  });
  return pageHelperAndLinksObject;
};

const writeHtml = (pageHelperAndLinksObject, outputHtmlFile) => {
  const { pageHelper, linksObject } = pageHelperAndLinksObject;
  const html = getPageHtml(pageHelper);
  return fs.writeFile(outputHtmlFile, html)
    .then(() => linksObject)
    .catch((e) => {
      throw new Error(e);
    });
};

const createResourceDir = (linksObject, destinationDir) => fs.mkdir(destinationDir)
  .then(() => linksObject)
  .catch((e) => {
    throw new Error(e);
  });

const downloadRemoteResources = linksObject => Promise.all(linksObject
  .map((link) => {
    const { linkUrl } = link;
    // missing resource should not fail all mission
    return new Promise(resolve => resolve(axios.get(linkUrl, { responseType: 'stream' })
      .then(response => ({ response, ...link }))
      .catch((e) => {
        const errorMessage = `${e.message} for '${linkUrl}'`;
        return ({ error: errorMessage, ...link });
      })));
  }));

const saveDownloadedResources = downloads => Promise.all(downloads
  .map(download => new Promise((resolve, reject) => {
    const {
      response, linkUrl, linklocalPath,
    } = download;
    if (!download.error) {
      response.data.pipe(fs.createWriteStream(linklocalPath)
        .on('finish', () => resolve(`'${linkUrl}' was saved to '${linklocalPath}'`))
        .on('error', e => reject(new Error(`'${e} Unable to save ${linkUrl}' to '${linklocalPath}'`))));
    } else {
      resolve(download.error);
    }
  })));

const notifyResourcesSaved = downloadResults => downloadResults
  .forEach((result) => {
    console.log(result);
  });

const pageLoader = (targetUrl, destinationDir) => {
  const pageName = makeNameFromUrl(targetUrl);
  const htmlName = `${pageName}.html`;
  const htmlFilePath = path.join(destinationDir, htmlName);
  const resourceDirPath = path.join(destinationDir, `${pageName}_files`);
  return fs.access(destinationDir, fs.constants.W_OK)
    .then(() => fs.open(htmlFilePath, 'wx'))
    .then(() => axios.get(targetUrl))
    .then(response => getPageHelper(response))
    .then(pageHelper => getLinks(pageHelper))
    .then(pageHelperAndLinks => modifyPageLinks(pageHelperAndLinks, targetUrl, destinationDir))
    .then(pageHelperAndLinksObject => writeHtml(pageHelperAndLinksObject, htmlFilePath))
    .then(linksObject => createResourceDir(linksObject, resourceDirPath))
    .then(linksObject => downloadRemoteResources(linksObject))
    .then(downloads => saveDownloadedResources(downloads))
    .then(downloadResults => notifyResourcesSaved(downloadResults))
    .then(() => {
      console.log(`Page was downloaded to ${htmlFilePath}`);
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export default pageLoader;
