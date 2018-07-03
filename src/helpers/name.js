import url from 'url';

export default (urlString) => {
  const { host, pathname } = url.parse(urlString);
  const validHost = host === null ? '' : host;
  const validPathName = pathname === '/' ? '' : pathname;
  const nonWordChars = new RegExp('\\W', 'g');
  const addrWithoutScheme = `${validHost}${validPathName}`;
  const replaceChar = '-';
  const name = addrWithoutScheme.replace(nonWordChars, replaceChar);
  return name;
};
