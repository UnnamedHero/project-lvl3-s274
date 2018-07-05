import fs from 'fs-extra';
import os from 'os';
import nock from 'nock';
import path from 'path';
import pageLoader from '../src';
import makeNameFromUrl from '../src/helpers/name';

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

  test('download page', async () => {
    nock(targetUrl)
      .get('/')
      .reply(200, simpleHtmlContent, { 'Content-Type': 'text/html' });

    await pageLoader(targetUrl, tmpDir);

    const htmlName = `${makeNameFromUrl(targetUrl)}.html`;
    const resultFilePath = path.join(tmpDir, htmlName);
    const pageContent = await fs.readFile(resultFilePath, 'utf8');

    expect(pageContent).toBe(simpleHtmlContent);
  });

  test('should fail if file exists', async () => {
    await expect(pageLoader(targetUrl, tmpDir))
      .rejects.toBeInstanceOf(Error);
  });
});
