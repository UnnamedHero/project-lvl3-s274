import fs from 'mz/fs';
import path from 'path';
import axios from 'axios';
import httpAdapter from 'axios/lib/adapters/http';
import makeNameFromUrl from './helpers/name';

axios.defaults.adapter = httpAdapter;

const pageLoader = (targetUrl, destinationDir) => {
  const name = makeNameFromUrl(targetUrl);
  const htmlName = `${name}.html`;
  const outputHtmlFile = path.join(destinationDir, htmlName);
  return fs.access(destinationDir, fs.constants.W_OK)
    .then(() => axios.get(targetUrl))
    .then(response => fs.writeFile(outputHtmlFile, response.data))
    .catch((err) => {
      console.log(`Error: ${err.message}`);
      return err;
    });
};

export default pageLoader;
