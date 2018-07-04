import fs from 'fs-extra';
import os from 'os';
import nock from 'nock';
import path from 'path';
import assert from 'assert';
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
  const tests = [
    'simple html',
  ];
  const simpleHtml = 'simple.html';
  const simpleHtmlContent = fs.readFileSync(pathTo(simpleHtml), 'utf8');
  const targetUrl = 'http://www.example.com';

  beforeAll(async () => {
    try {
      const makeAllTmpDirs = testsList => Promise.all(testsList.map(makeTmpDir));
      const allTmpDirs = await makeAllTmpDirs(tests);
      allTmpDirs.forEach((dir, index) => {
        tmpDirs.set(tests[index], dir);
      });
    } catch (e) {
      throw new Error(`cannot create temp directories: ${e}`);
    }
  });

  test(tests[0], async () => {
    nock(targetUrl)
      .get('/')
      .reply(200, simpleHtmlContent, { 'Content-Type': 'text/html' });
    const testName = tests[0];
    const tmpDirName = tmpDirs.get(testName);
    try {
      await pageLoader(targetUrl, tmpDirName);
    } catch (e) {
      assert(false, `pageLoader failed to complete ${e}`);
    }

    const htmlName = `${makeNameFromUrl(targetUrl)}.html`;
    const resultFilePath = path.join(tmpDirName, htmlName);
    try {
      const pageContent = await fs.readFile(resultFilePath, 'utf8');
      expect(pageContent).toBe(simpleHtmlContent);
    } catch (e) {
      assert(false, `cannot read downloaded page ${e}`);
    }

    try {
      fs.remove(tmpDirName);
    } catch (e) {
      assert(false, `cannot delete temp directory ${e}`);
    }
  });
});
