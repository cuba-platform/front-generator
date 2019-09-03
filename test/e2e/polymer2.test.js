const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {runGenerator, init} = require('./e2e-common')('polymer2');
const answers = require('./answers');

const appDir = 'test/e2e/generated/polymer2-app';

describe('polymer2 generator integration test', () => {
  it('should generate polymer 2 app and modules', function () {

    init();

    const generationProcesses = [];
    generationProcesses.push(runGenerator('app', appDir));
    generationProcesses.push(runGenerator('blank-component', `${appDir}/src/component`, answers.blankComponent, '../'));
    generationProcesses.push(runGenerator('entity-management', `${appDir}/src/entity-management`, answers.entityManagement, '../'));
    generationProcesses.push(runGenerator('entity-cards', `${appDir}/src/entity-cards`, answers.entityCards, '../'));
    generationProcesses.push(runGenerator('entity-list', `${appDir}/src/entity-list`, answers.entityList, '../'));
    generationProcesses.push(runGenerator('entity-edit', `${appDir}/src/entity-edit`, answers.entityEdit, '../'));
    generationProcesses.push(runGenerator('query-results', `${appDir}/src/query-results`, answers.queryResults, '../'));
    generationProcesses.push(runGenerator('service-form', `${appDir}/src/service-form`, answers.serviceForm, '../'));
    generationProcesses.push(runGenerator('service-data', `${appDir}/src/service-data`, answers.serviceData, '../'));

    return rimraf(`${appDir}/*`)
      .then(() => Promise.all(generationProcesses))
      .then(() => console.log('e2e:polymer2: polymer2-app generation test - PASSED'))
  });
});