import path from 'path';
import fs from 'fs-extra';
import {
  makePageHelper, getPageLinks, getLocalPageLinks, changeLocalResourcesSourceTo,
} from '../src/helpers/page';

const testPath = __dirname;
const fixturesPath = path.join(testPath, '__fixtures__');

const pathTo = fileName => path.join(fixturesPath, fileName);

const simpleHtml = 'simple.html';
const simpleHtmlContent = fs.readFileSync(pathTo(simpleHtml), 'utf8');

let pageHelper;
beforeEach(() => {
  pageHelper = makePageHelper(simpleHtmlContent);
});

test('get page links', () => {
  const expectedLinks = [
    '/icons/logo.png',
    '/css/style1.css',
    'http://example.com/css/style2.css',
    '/js/bitcoin-miner.js',
    'http://example.com/js/data-uploader.js',
    '/pictures/passport-1.png',
    'http://example.com/facebook-avatar.bmp',
    '/scans/my-credit-card.jpg',
  ];
  expect(getPageLinks(pageHelper)).toEqual(expectedLinks);
});

test('get local page links', () => {
  const expectedLinks = [
    '/icons/logo.png',
    '/css/style1.css',
    '/js/bitcoin-miner.js',
    '/pictures/passport-1.png',
    '/scans/my-credit-card.jpg',
  ];
  expect(getLocalPageLinks(pageHelper)).toEqual(expectedLinks);
});

test('change local link source to given path', () => {
  const localPath = '/tmp/page-loader/testpage';
  const expectedLinks = [
    '/tmp/page-loader/testpage/icons-logo.png',
    '/tmp/page-loader/testpage/css-style1.css',
    '/tmp/page-loader/testpage/js-bitcoin-miner.js',
    '/tmp/page-loader/testpage/pictures-passport-1.png',
    '/tmp/page-loader/testpage/scans-my-credit-card.jpg',
  ];
  changeLocalResourcesSourceTo(pageHelper, localPath);
  expect(getLocalPageLinks(pageHelper)).toEqual(expectedLinks);
});
