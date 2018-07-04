import fs from 'fs-extra';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoader from '../src';
import makeNameFromUrl from '../src/helpers/name';

const testPath = __dirname;

const fixturesPath = path.join(testPath, '__fixtures__');
const pathTo = fileName => path.join(fixturesPath, fileName);

const makeTmpDir = () => fs.mkdtemp(path.join(os.tmpdir(), 'page-loader'));

describe('helpers tests', () => {
  test('makeNameFromUrl', () => {
    const url = 'https://hexlet.io/courses';
    expect(makeNameFromUrl(url)).toBe('hexlet-io-courses');
  });
});

describe('directory access testing', () => {
  test('root dir', async () => {
    try {
      await (pageLoader('foobar', '/'));
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
    }
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
        fs.remove(tmpDirs.get(testName));
      })
      .catch(err => console.log(err));
  });
});
