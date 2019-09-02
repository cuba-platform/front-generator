const path = require('path');
const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {runGenerator, assertContent} = require('./e2e-common');
const answers = require('./answers');
const {cmd} = require("./e2e-common");

(async function () {

  await rimraf('test/e2e/generated/*');
  const reactAppDir = 'test/e2e/generated/react-client';

  return runGenerator('react-typescript:app', reactAppDir)
    .then(() => {
      console.log('start files comparison with expect gauges');

      const srcCubaDir = path.join(reactAppDir, 'src/cuba');
      assertContent('enums/enums.ts', srcCubaDir);
      assertContent('entities/mpg$Car.ts', srcCubaDir);
      assertContent('entities/mpg$SparePart.ts', srcCubaDir);

      //todo

      // assertContent('services.ts', srcCubaDir);
      // assertContent('queries.ts', srcCubaDir);
    })
    .then(() => runGenerator('react-typescript:entity-cards', `${reactAppDir}/src/app/entity-cards`,
        answers.entityCards, '../../')
    )
    .then(() => runGenerator('react-typescript:entity-management', `${reactAppDir}/src/app/entity-management`,
        answers.entityManagement, '../../')
    )
    .then(() => cmd(`cd ${reactAppDir} && npm install`,
        'e2e:react-client: start compile react-client after generation  - npm install',
        'e2e:react-client: start compile react-client after generation - npm install - DONE')
    )
    .then(() => cmd('npm run build',
        'e2e:react-client: start compile react-client after generation - npm run build',
        'e2e:react-client: start compile react-client after generation - npm run build - DONE')
    ).catch((e) => {
      console.log(e);
      process.exit(1);
    });

})();