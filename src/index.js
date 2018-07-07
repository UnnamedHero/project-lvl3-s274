import fs from 'fs-extra';
import path from 'path';
import url from 'url';
import axios from './lib/axios';
import { makeNameFromUrl } from './helpers/name';
import {
  makePageHelper, getLocalPageLinks, changeLocalResourcesSourceTo, getPageHtml,
} from './helpers/page';

const getLinks = data => new Promise((resolve) => {
  const { response } = data;
  const pageHelper = makePageHelper(response.data);
  const links = getLocalPageLinks(pageHelper);
  resolve({ ...data, links, pageHelper });
});

const modifyPageLinks = data => new Promise((resolve) => {
  const { pageName, pageHelper } = data;
  const localResourcesPath = `${pageName}_files`;
  changeLocalResourcesSourceTo(pageHelper, localResourcesPath);
  resolve({ ...data, pageHelper });
});

const writeHtml = data => new Promise((resolve, reject) => {
  const { pageHelper, outputHtmlFile } = data;
  const html = getPageHtml(pageHelper);
  fs.writeFile(outputHtmlFile, html)
    .then(() => resolve(data))
    .catch(e => reject(e));
});

const getResourceFileNames = data => new Promise((resolve) => {
  const { pageHelper } = data;
  const resourceFileNames = getLocalPageLinks(pageHelper);
  resolve({ ...data, resourceFileNames });
});

const createResourceDir = data => new Promise((resolve, reject) => {
  const { destinationDir, pageName } = data;
  const resourseDir = path.join(destinationDir, `${pageName}_files`);
  fs.mkdir(resourseDir)
    .then(() => resolve(data))
    .catch(e => reject(e));
});

const downloadRemoteResources = (data) => {
  const {
    links, targetUrl, resourceFileNames, destinationDir,
  } = data;
  const downloads = links.map((link, index) => new Promise((resolve, reject) => {
    const uri = url.resolve(targetUrl, link);
    const filePath = path.join(destinationDir, resourceFileNames[index]);
    return axios.get(uri, { responseType: 'stream' })
      .then(response => resolve({ response, uri, filePath }))
      .catch(e => reject(e));
  }));
  return Promise.all(downloads);
};

const saveDownloadedResources = downloads => Promise.all(downloads
  .map((download) => {
    const { response, uri, filePath } = download;
    return new Promise((resolve, reject) => {
      response.data.pipe(fs.createWriteStream(filePath)
        .on('finish', () => resolve({ uri, filePath }))
        .on('error', e => reject(e)));
    });
  }));

const notifyResourcesSaved = data => data
  .forEach(({ uri, filePath }) => {
    console.log(`'${uri}' was downloaded as ${filePath}`);
  });


const pageLoader = (targetUrl, destinationDir) => {
  const pageName = makeNameFromUrl(targetUrl);
  const htmlName = `${pageName}.html`;
  const outputHtmlFile = path.join(destinationDir, htmlName);
  return fs.access(destinationDir, fs.constants.W_OK)
    .then(() => fs.open(outputHtmlFile, 'wx'))
    .then(() => axios.get(targetUrl))
    .then(response => new Promise((resolve) => {
      resolve({
        response, pageName, destinationDir, targetUrl, outputHtmlFile,
      });
    }))
    .then(data => getLinks(data))
    .then(data => modifyPageLinks(data))
    .then(data => writeHtml(data))
    .then(data => getResourceFileNames(data))
    .then(data => createResourceDir(data))
    .then(data => downloadRemoteResources(data))
    .then(downloads => saveDownloadedResources(downloads))
    .then(data => notifyResourcesSaved(data))
    .then(() => {
      console.log(`Page was downloaded to ${outputHtmlFile}`);
    })
    .catch((err) => {
      throw new Error(err);
    });
};

export default pageLoader;
