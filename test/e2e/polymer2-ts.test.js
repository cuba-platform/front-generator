const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {runGenerator} = require('./e2e-common');
const answers = require('./answers');

const appDir = 'test/e2e/generated/polymer2-ts-app';

(async function () {

  await rimraf('test/e2e/generated/polymer2-ts-app/*');

  const generationProcesses = [];

  generationProcesses.push(runGenerator('polymer2-typescript:app', appDir));
  generationProcesses.push(runGenerator('polymer2-typescript:blank-component', `${appDir}/src/component`, answers.blankComponent, '../'));
  generationProcesses.push(runGenerator('polymer2-typescript:entity-cards', `${appDir}/src/entity-cards`, answers.entityCards, '../'));
  generationProcesses.push(runGenerator('polymer2-typescript:entity-list', `${appDir}/src/entity-list`, answers.entityList, '../'));
  generationProcesses.push(runGenerator('polymer2-typescript:entity-edit', `${appDir}/src/entity-edit`, answers.entityEdit, '../'));
  generationProcesses.push(runGenerator('polymer2-typescript:entity-management', `${appDir}/src/entity-management`, answers.entityManagement, '../'));

  Promise.all(generationProcesses)
    .then(() => {
      console.log('e2e:polymer2-ts: generation complete test status - PASSED');
    })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });

})();