import fs from 'mz/fs';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoader from '../src';
import makeNameFromUrl from '../src/helpers/name';

const testPath = __dirname;

const fixturesPath = path.join(testPath, '__fixtures__');
const pathTo = fileName => path.join(fixturesPath, fileName);

const makeTmpDir = async () => fs.mkdtemp(path.join(os.tmpdir(), 'page-loader'));

const removeDir = (dir) => {
  console.log(dir);
  const dirContent = fs.readdirSync(dir);
  dirContent.forEach((dirItem) => {
    const itemPath = path.resolve(dir, dirItem);
    const itemType = fs.statSync(itemPath);
    if (itemType.isDirectory()) {
      removeDir(itemPath);
    } else {
      fs.unlinkSync(itemPath);
    }
  });
  fs.rmdirSync(dir);
};

describe('helpers tests', () => {
  test('makeNameFromUrl', () => {
    const url = 'https://hexlet.io/courses';
    expect(makeNameFromUrl(url)).toBe('hexlet-io-courses');
  });
});

describe('directory access testing', () => {
  expect.assertions(1);
  test('root dir', async () => {
    const data = await (pageLoader('foobar', '/'));
    expect(data.message).toBe('EACCES: permission denied, access \'/\'');
  });
});

describe('page download test', () => {
  const tmpDirs = new Map();
  const simpleHtml = 'simple.html';
  const simpleHtmlContent = fs.readFileSync(pathTo(simpleHtml), 'utf8');

  const targetUrl = 'http://www.example.com';
  nock(targetUrl)
    .get('/')
    .reply(200, simpleHtmlContent, { 'Content-Type': 'text/html' });

  test('simple html', () => {
    const testName = 'simple html';
    makeTmpDir()
      .then((tmpDir) => {
        tmpDirs.set(testName, tmpDir);
        console.log(tmpDirs);
        return pageLoader(targetUrl, tmpDir);
      })
      .then(() => {
        const htmlName = `${makeNameFromUrl(targetUrl)}.html`;
        const resultFilePath = path.join(tmpDirs.get(testName), htmlName);
        return fs.readFile(resultFilePath, 'utf8');
      })
      .then((pageContent) => {
        expect(pageContent).toBe(simpleHtmlContent);
      })
      .then(() => {
        removeDir(tmpDirs.get(testName));
      })
      .catch(err => console.log(err));
  });
});
