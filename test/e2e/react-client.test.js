const path = require('path');
const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {runGenerator, logOutput, assertContent} = require('./../e2e-common');
const exec = promisify(require('child_process').exec);

(async function () {

  await rimraf('test/e2e/generated/*');
  const reactAppDir = 'test/e2e/generated/react-client';

  runGenerator('react-typescript:app', reactAppDir, undefined, undefined, 'projectModel2.json')
    .then(() => {
      console.log('e2e:react: generation complete, start files comparison with expect gauges');

      const srcCubaDir = path.join(reactAppDir, 'src/cuba');
      assertContent('enums/enums.ts', srcCubaDir);
      assertContent('entities/mpg$Car.ts', srcCubaDir);
      assertContent('entities/mpg$SparePart.ts', srcCubaDir);

      //todo

      // assertContent('services.ts', srcCubaDir);
      // assertContent('queries.ts', srcCubaDir);
    })
    .then(() => {
      console.log('\ne2e:react-client: start compile react-client after generation - npm install');
      return exec(`cd ${reactAppDir} && npm install`)
    })
    .then((onful, onreject) => {
      logOutput(onful, onreject, 'e2e:react-client: start compile react-client after generation - npm run build');
      return exec(`npm run build`)
    })
    .then((onful, onreject) => {
      logOutput(onful, onreject, 'e2e:react-client: test complete, status OK');
    }).catch((e) => {
    console.log(e);
    process.exit(1);
  });

})();