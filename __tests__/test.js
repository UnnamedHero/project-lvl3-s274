// import os from 'os';
// import fs from 'mz/fs';
import pageLoader from '../src';

describe('directory access testing', () => {
  // const tmpDir = os.tmpdir();
  expect.assertions(1);
  test('root dir', async () => {
    const data = await (pageLoader('jopa', '/'));
    expect(data.message).toBe('EACCES: permission denied, access \'/\'');
  });
});
