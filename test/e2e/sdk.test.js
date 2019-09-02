const {promisify} = require('util');
const path = require('path');
const rimraf = promisify(require('rimraf'));
const fs = require('fs');
const {runGenerator, cmd, assertContent} = require('./e2e-common');

(async function () {

  await rimraf('.tmp/*');
  const sdkAppDir = 'test/e2e/generated/sdk';
  const fixturesDir = 'test/e2e/fixtures/sdk';

  runGenerator('sdk:all', sdkAppDir)
    .then(() => {
      console.log('e2e:sdk: start files comparison with expect gauges');
      assertContent('enums/enums.ts', sdkAppDir);
      assertContent('entities/mpg$Car.ts', sdkAppDir);
      assertContent('entities/mpg$SparePart.ts', sdkAppDir);
      assertContent('services.ts', sdkAppDir);
      assertContent('queries.ts', sdkAppDir);

      console.log('\ne2e:sdk: prepare to compile sdk - copy tsconfig.json');
      fs.copyFileSync(path.join(fixturesDir, 'tsconfig.json'), path.join(sdkAppDir, 'tsconfig.json'));

      return cmd(`cd ${sdkAppDir} && npm init -y && npm install typescript @cuba-platform/rest`,
        'e2e:sdk: prepare to compile sdk - install packages',
        'e2e:sdk: compile packages - DONE');
    })
    .then(() =>  //todo `npm run node_modules/.bin/tsc`
      cmd(`cd ${sdkAppDir} && npx tsc`,
        'e2e:sdk: start compile sdk',
        'e2e:sdk: compile sdk - DONE')
    )
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });

})();

