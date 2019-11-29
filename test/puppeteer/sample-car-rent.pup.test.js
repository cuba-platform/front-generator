const answers = require('./fixtures/answers.json');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const rimraf = promisify(require('rimraf'));
const fs = require('fs');
const path = require('path');


const {
  init, appPath, fixturesPath, generateReactApp, generateAppComponents, installAppPackages, prepareBackEnd,
  stopBackEnd
} = require('./puppeteer-common');

const APP_DIR = 'react-app-scr';
const APP_PATH = appPath(APP_DIR);
const FIXTURES_PATH = fixturesPath(APP_DIR);


describe('test:pup:scr', function () {

  before(() => init());

  it('should login after app started', async function() {

    log(`clean up app dir`);
    await rimraf(appPath(APP_DIR));

    log(`generate react app`);
    await generateReactApp(APP_DIR);

    log('generate app components');
    await generateAppComponents('react-app-scr/src/app/entity-management', answers.entityManagement);
    await generateAppComponents('react-app-scr/src/app/entity-management2', answers.entityManagement2);
    await generateAppComponents('react-app-scr/src/app/entity-management3', answers.entityManagement3);
    await generateAppComponents('react-app-scr/src/app/entity-cards', answers.entityCards, 'entity-cards');

    log(`install app packages`);
    await installAppPackages(APP_DIR);

    log('prepare to puppeteer tests, install dependencies and copy files');
    await exec(`cd ${appPath(APP_DIR)} && npm install --save-dev puppeteer jest-puppeteer`);

    fs.copyFileSync(path.join(FIXTURES_PATH, 'jest.config.js'), path.join(APP_PATH, 'jest.config.js'));
    fs.mkdirSync(path.join(APP_PATH, 'test'));
    fs.copyFileSync(path.join(FIXTURES_PATH, 'test/app-start.test.js'), path.join(APP_PATH, 'test/app-start.test.js'));

    log(`prepare back end`);
    await prepareBackEnd(APP_DIR);

    try {
      log(`going to start app`);
      // do not await - process nor finished until app running
      exec(`cd ${APP_PATH} && BROWSER=none npm start &`);

      log(`wait for app start - sleep 2 minutes`);
      await new Promise(resolve => setTimeout(resolve, 120000));

      log(`start test node_modules/.bin/jest -f test/app-start`);
      await exec(`cd ${APP_PATH} && node_modules/.bin/jest -f test/app-start`);

    } catch (e) {
      log('test failed with exception, stopping backend');
      console.log(e);
      await stopBackEnd(APP_DIR);
      throw e;
    }

    log('stopping backend');
    await stopBackEnd(APP_DIR);

    log('wait for process termination');

    // terminate this process after pup tests was run
    setTimeout(() => {

      // todo stop react app

      log('terminate main process');
      process.exit(0)
    }, 5000);

  });
});

function log(message) {
  console.log(`test:pup:scr ` + message);
}
