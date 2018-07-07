import url from 'url';

export const makeNameFromUrl = (urlString) => {
  const { host, pathname } = url.parse(urlString);
  const validHost = host === null ? '' : host;
  const validPathName = pathname === '/' ? '' : pathname;
  const nonWordChars = new RegExp('\\W', 'g');
  const addrWithoutScheme = `${validHost}${validPathName}`;
  const replaceChar = '-';
  const name = addrWithoutScheme.replace(nonWordChars, replaceChar);
  return name;
};

export const makeResourceNameFromUrl = (urlString) => {
  const dirtyName = makeNameFromUrl(urlString);
  const trailingDashes = new RegExp('(^-*|-*$)', 'g');
  const emptyChar = '';
  const nameWithBadExt = dirtyName.replace(trailingDashes, emptyChar);
  const lastDash = new RegExp('(-)(?!.*-)', 'g');
  const dotChar = '.';
  const name = nameWithBadExt.replace(lastDash, dotChar);
  return name;
};
