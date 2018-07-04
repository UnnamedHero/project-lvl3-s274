import fs from 'fs-extra';
import path from 'path';
import axios from './lib/axios';

import makeNameFromUrl from './helpers/name';

const pageLoader = (targetUrl, destinationDir) => {
  const name = makeNameFromUrl(targetUrl);
  const htmlName = `${name}.html`;
  const outputHtmlFile = path.join(destinationDir, htmlName);
  return fs.access(destinationDir, fs.constants.W_OK)
    .then(() => axios.get(targetUrl))
    .then(response => fs.writeFile(outputHtmlFile, response.data))
    .then(() => {
      console.log(`Page was downloaded to ${outputHtmlFile}`);
    })
    .catch((err) => {
      // console.log(`Error! ${err.message}`);
      throw new Error(err);
    });
};

export default pageLoader;
