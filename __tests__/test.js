// import os from 'os';
import fs from 'mz/fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
// import httpAdapter from 'axios/lib/adapters/http';
import pageLoader from '../src';
import makeNameFromUrl from '../src/helpers/name';

const testPath = __dirname;
const tmpDirs = new Set();
const fixturesPath = path.join(testPath, '__fixtures__');
const pathTo = fileName => path.join(fixturesPath, fileName);
const getFileContent = filePath => fs.readFileSync(filePath, 'utf8');

const makeTmpDir = async () => fs.mkdtemp(path.join(os.tmpdir(), 'page-loader'));
const removeDir = async (dirPath) => {
  const dirContent = await fs.readdir(dirPath);
  await dirContent.forEach(async (item) => {
    const itemPath = path.join(dirPath, item);
    const itemType = await fs.stat(itemPath);
    if (itemType.isDirectory()) {
      await removeDir(itemPath);
    }
    await fs.unlink(itemPath);
  });
  await fs.rmdir(dirPath);
};

describe('helpers tests', () => {
  test('makeNameFromUrl', () => {
    const url = 'https://hexlet.io/courses';
    expect(makeNameFromUrl(url)).toBe('hexlet-io-courses');
  });
});

// describe('directory access testing', () => {
//   expect.assertions(1);
//   test('root dir', async () => {
//     const data = await (pageLoader('foobar', '/'));
//     expect(data.message).toBe('EACCES: permission denied, access \'/\'');
//   });
// });

describe('page download test', () => {
  beforeEach(async () => {
    const tmpDir = await makeTmpDir();
    tmpDirs.add(tmpDir);
    process.chdir(tmpDir);
  });
  afterEach(() => {
    process.chdir(testPath);
  });

  afterAll(async () => {
    // tmpDirs.forEach(dir => removeDir(dir));
  });

  const simpleHtml = 'simple.html';
  const simpleHtmlContent = getFileContent(pathTo(simpleHtml));
  const targetUrl = 'http://www.example.com';
  nock(targetUrl)
    .get('/')
    .reply(200, simpleHtmlContent, { 'Content-Type': 'text/html' });
  test('simple html', async () => {
    expect.assertions(1);
    const cwd = process.cwd();
    await pageLoader(targetUrl, cwd);
    const htmlName = `${makeNameFromUrl(targetUrl)}.html`;
    const resultFilePath = path.join(cwd, htmlName);
    const resultData = getFileContent(resultFilePath);
    expect(resultData).toBe(simpleHtmlContent);
  });
});
