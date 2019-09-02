const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {runGenerator} = require('./e2e-common');
const answers = require('./answers');

const appDir = 'test/e2e/generated/polymer2-app';

(async function () {

  await rimraf('test/e2e/generated/polymer2-app/*');

  const generationProcesses = [];

  generationProcesses.push(runGenerator('polymer2:app', appDir));
  generationProcesses.push(runGenerator('polymer2:blank-component', `${appDir}/src/component`, answers.blankComponent, '../'));
  generationProcesses.push(runGenerator('polymer2:entity-management', `${appDir}/src/entity-management`, answers.entityManagement, '../'));
  generationProcesses.push(runGenerator('polymer2:entity-cards', `${appDir}/src/entity-cards`, answers.entityCards, '../'));
  generationProcesses.push(runGenerator('polymer2:entity-list', `${appDir}/src/entity-list`, answers.entityList, '../'));
  generationProcesses.push(runGenerator('polymer2:entity-edit', `${appDir}/src/entity-edit`, answers.entityEdit, '../'));
  generationProcesses.push(runGenerator('polymer2:query-results', `${appDir}/src/query-results`, answers.queryResults, '../'));
  generationProcesses.push(runGenerator('polymer2:service-form', `${appDir}/src/service-form`, answers.serviceForm, '../'));
  generationProcesses.push(runGenerator('polymer2:service-data', `${appDir}/src/service-data`, answers.serviceData, '../'));

  Promise.all(generationProcesses)
    .then(() => {
      console.log('e2e:polymer2: generation complete test status - PASSED');
    })
    .catch((e) => {
      console.log(e);
      process.exit(1);
    });

})();