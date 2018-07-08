import fs from 'fs-extra';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoader from '../src';
import { makeNameFromUrl } from '../src/helpers/name';

let tmpDir;
let htmlContent;

let innerTmpDir;
const existingFileName = 'foobar.html';

const testPath = __dirname;
const fixturesPath = path.join(testPath, '__fixtures__');
const pathTo = fileName => path.join(fixturesPath, fileName);

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader'));
  innerTmpDir = await fs.mkdtemp(path.join(tmpDir, 'page-loader'));
  await fs.open(path.join(innerTmpDir, existingFileName), 'wx');
  const simpleHtml = 'simple.html';
  htmlContent = await fs.readFile(pathTo(simpleHtml), 'utf8');
});

afterAll(async () => {
  await fs.remove(tmpDir);
});

describe('page loader test', () => {
  const targetUrl = 'http://www.example.com';
  const name = makeNameFromUrl(targetUrl);
  const htmlName = `${name}.html`;
  const filesPath = `${name}_files`;

  const expectedDownloadedFiles = [
    { downloaded: '/icons-logo.png', fixture: 'logo.png' },
    { downloaded: '/css-style1.css', fixture: 'style1.css' },
    { downloaded: '/js-bitcoin-miner.js', fixture: 'bitcoin-miner.ts' },
    { downloaded: '/pictures-passport-1.png', fixture: 'passport-1.png' },
    { downloaded: '/scans-my-credit-card.jpg', fixture: 'my-credit-card.jpg' },
  ];

  test('should fail on fake dir', async () => {
    await expect(pageLoader('foobar', 'c:\\windows\\system32')).rejects.toMatchSnapshot();
  });

  test('should fail on readonly dir', async () => {
    await expect(pageLoader('foobar', '/')).rejects.toMatchSnapshot();
  });

  test('download page', async () => {
    nock(targetUrl)
      .get('/')
      .reply(200, htmlContent, { 'Content-Type': 'text/html' })
      .get('/icons/logo.png')
      .replyWithFile(200, pathTo('logo.png'))
      .get('/css/style1.css')
      .delay(1000)
      .replyWithFile(200, pathTo('style1.css'))
      .get('/js/bitcoin-miner.js')
      .delay(2000)
      .replyWithFile(200, pathTo('bitcoin-miner.ts'))
      .get('/pictures/passport-1.png')
      .replyWithFile(200, pathTo('passport-1.png'))
      .get('/scans/my-credit-card.jpg')
      .replyWithFile(200, pathTo('my-credit-card.jpg'));

    await pageLoader(targetUrl, tmpDir);
    const resultHtmlFilePath = path.join(tmpDir, htmlName);
    await expect(fs.open(resultHtmlFilePath, 'r')).resolves.toBeDefined();
  });

  test.each(expectedDownloadedFiles)('check if \'%o\' downloaded', async ({ downloaded, fixture }) => {
    const filePath = path.join(tmpDir, filesPath, downloaded);
    const expectedContent = await fs.readFile(pathTo(fixture), 'utf8');
    const downloadedContent = await fs.readFile(filePath, 'utf8');
    expect(downloadedContent).toEqual(expectedContent);
  });

  test('should fail if html file exists', async () => {
    const matcher = new RegExp(`^(EEXIST: file already exists, open '(.+)?${existingFileName}')$`, 'g');
    await expect(pageLoader('foobar', innerTmpDir))
      .rejects.toHaveProperty('message', expect.stringMatching(matcher));
  });

  test('should fail on 404', async () => {
    const url = 'https://geekbrains.ru/';
    nock(url)
      .get('/')
      .replyWithError(404);
    await expect(pageLoader(url, tmpDir))
      .rejects.toMatchSnapshot();
  });
});
