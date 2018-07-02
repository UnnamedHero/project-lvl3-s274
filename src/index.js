import fs from 'mz/fs';
import url from 'url';

const makeNameFromUrl = (urlString) => {
  const { host, pathname } = url.parse(urlString);
  const validHost = host === null ? '' : host;
  const validPathName = pathname === '/' ? '' : pathname;
  const nonWordChars = new RegExp('\\W', 'g');
  const addrWithoutScheme = `${validHost}${validPathName}`;
  const replaceChar = '-';
  const name = addrWithoutScheme.replace(nonWordChars, replaceChar);
  return `${name}.html`;
};

const pageLoader = (targetUrl, destinationDir) => fs.access(destinationDir, fs.constants.W_OK)
  .then(() => {
    const name = makeNameFromUrl(targetUrl);
    console.log(name, destinationDir);
  })
  .catch((err) => {
    console.log(`Error: ${err.message}`);
    return err;
  });

export default pageLoader;
