import fs from 'fs-extra';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoader from '../src';
import { makeNameFromUrl, makeResourceNameFromUrl } from '../src/helpers/name';

let tmpDir;
const testPath = __dirname;
const fixturesPath = path.join(testPath, '__fixtures__');

const pathTo = fileName => path.join(fixturesPath, fileName);

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader'));
});

afterAll(async () => {
  await fs.remove(tmpDir);
});

describe('helpers tests', () => {
  test('makeNameFromUrl', () => {
    const url = 'https://hexlet.io/courses';
    expect(makeNameFromUrl(url)).toBe('hexlet-io-courses');
  });

  test('makeResourceNameFromUrl', () => {
    const resourceName = '/var/www/pic/logo/hexlet.png';
    const expected = 'var-www-pic-logo-hexlet.png';
    expect(makeResourceNameFromUrl(resourceName)).toBe(expected);
  });
});

describe('directory access testing', () => {
  test('fake dir', async () => {
    await expect(pageLoader('foobar', 'c:\\windows\\system32'))
      .rejects.toBeInstanceOf(Error);
  });
});

describe('page download test', () => {
  const simpleHtml = 'simple.html';
  const simpleHtmlContent = fs.readFileSync(pathTo(simpleHtml), 'utf8');
  const targetUrl = 'http://www.example.com';
  const name = makeNameFromUrl(targetUrl);
  const filesPath = `${name}_files`;

  const expectedDownloadedFiles = [
    '/icons-logo.png',
    '/css-style1.css',
    '/js-bitcoin-miner.js',
    '/pictures-passport-1.png',
    '/scans-my-credit-card.jpg',
  ];

  test('download page', async () => {
    nock(targetUrl)
      .get('/')
      .reply(200, simpleHtmlContent, { 'Content-Type': 'text/html' })
      .get('/icons/logo.png')
      .replyWithFile(200, pathTo('logo.png'))
      .get('/css/style1.css')
      .delay(2000)
      .replyWithFile(200, pathTo('style1.css'))
      .get('/js/bitcoin-miner.js')
      .delay(2000)
      .replyWithFile(200, pathTo('bitcoin-miner.ts'))
      .get('/pictures/passport-1.png')
      .replyWithFile(200, pathTo('passport-1.png'))
      .get('/scans/my-credit-card.jpg')
      .replyWithFile(200, pathTo('my-credit-card.jpg'));

    await pageLoader(targetUrl, tmpDir);
    const htmlName = `${name}.html`;
    const resultHtmlFilePath = path.join(tmpDir, htmlName);
    await expect(fs.open(resultHtmlFilePath, 'r')).resolves.toBeDefined();
  });

  test.each(expectedDownloadedFiles)('check if \'%s\' downloaded', async (file) => {
    const filePath = path.join(tmpDir, filesPath, file);
    await expect(fs.open(filePath, 'r')).resolves.toBeDefined();
  });

  test('should fail if file exists', async () => {
    await expect(pageLoader(targetUrl, tmpDir))
      .rejects.toBeInstanceOf(Error);
  });
});
