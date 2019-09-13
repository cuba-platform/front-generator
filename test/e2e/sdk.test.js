const {promisify} = require('util');
const path = require('path');
const rimraf = promisify(require('rimraf'));
const fs = require('fs');
const {runGenerator, cmd, assertContent, init} = require('./e2e-common')('sdk');

const appDir = 'test/e2e/generated/sdk';
const fixturesDir = 'test/e2e/fixtures/sdk';


describe('test:e2e:sdk', () => {
  it('should generate sdk app', function () {

    init();

    return rimraf(`${appDir}/*`)
      .then(() => runGenerator('all', appDir))
      .then(() => {
        console.log('e2e:sdk: start files comparison with expect gauges');
        assertContent('enums/enums.ts', appDir);
        assertContent('entities/mpg$Car.ts', appDir);
        assertContent('entities/mpg$SparePart.ts', appDir);
        // assertContent('services.ts', appDir);
        // assertContent('queries.ts', appDir);

        console.log('\ne2e:sdk: prepare to compile sdk');
        fs.copyFileSync(path.join(fixturesDir, 'tsconfig.json'), path.join(appDir, 'tsconfig.json'));

        return cmd(`cd ${appDir} && npm init -y && npm install typescript @cuba-platform/rest`,
          'e2e:sdk: prepare to compile sdk - install packages',
          'e2e:sdk: compile packages - DONE');
      })
      .then(() =>
        cmd(`cd ${appDir} && ./node_modules/.bin/tsc`,
          'e2e:sdk: start compile sdk',
          'e2e:sdk: compile sdk - DONE'))
      //todo add lib/** files assert
      .then(() => console.log('e2e:sdk: sdk generation test - PASSED'));
  });
});
