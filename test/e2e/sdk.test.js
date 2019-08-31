const {promisify} = require('util');
const path = require('path');
const rimraf = promisify(require('rimraf'));
const fs = require('fs');
const {runGenerator, logOutput, assertContent} = require('./../e2e-common');
const exec = promisify(require('child_process').exec);

(async function () {

  await rimraf('.tmp/*');
  const sdkAppDir = 'test/e2e/generated/sdk';
  const fixturesDir = 'test/e2e/fixtures/sdk';

  //todo remove projectModel.json and rename projectModel2 => projectModel
  runGenerator('sdk:all', sdkAppDir, undefined, undefined, 'projectModel2.json')
    .then(() => {
      console.log('e2e:sdk: generation complete, start files comparison with expect gauges');
      assertContent('enums/enums.ts', sdkAppDir);
      assertContent('entities/mpg$Car.ts', sdkAppDir);
      assertContent('entities/mpg$SparePart.ts', sdkAppDir);
      assertContent('services.ts', sdkAppDir);
      assertContent('queries.ts', sdkAppDir);

      console.log('\ne2e:sdk: prepare to compile sdk - install packages');
      fs.copyFileSync(path.join(fixturesDir, 'tsconfig.json'), path.join(sdkAppDir, 'tsconfig.json'));
      return exec(`cd ${sdkAppDir} && npm init -y && npm install typescript @cuba-platform/rest`);
    })
    .then((onful, onreject) => {
      logOutput(onful, onreject, 'e2e:sdk: start compile sdk');
      return exec(`cd ${sdkAppDir} && npx tsc`);
    })
    .then((onful, onreject) => {
      logOutput(onful, onreject, 'e2e:sdk: test complete, status OK');
    })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });

})();

