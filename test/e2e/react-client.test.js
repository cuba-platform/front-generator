const path = require('path');
const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {cmd, runGenerator, assertContent, init} = require('./e2e-common')('react-typescript');
const answers = require('./fixtures/answers.json');
const fs = require('fs');
const assert = require('assert');

const MPG_APP_DIR = 'test/e2e/generated/react-client-mpg';
const PRISTINE_APP_DIR = 'test/e2e/generated/react-client-pristine';
const EMPTY_APP_DIR = 'test/e2e/generated/react-client-empty';

describe('test:e2e:react', () => {

  before(() => init());

  it('should generate react app - mpg', async function () {

    await rimraf(`${MPG_APP_DIR}/*`);
    await runGenerator('app', MPG_APP_DIR);

    console.log('e2e:react: start files comparison with expect gauges');

    const srcCubaDir = path.join(MPG_APP_DIR, 'src/cuba');
    assertContent('enums/enums.ts', srcCubaDir);
    assertContent('entities/mpg$Car.ts', srcCubaDir);
    assertContent('entities/mpg$SparePart.ts', srcCubaDir);
    assertContent('services.ts', srcCubaDir);
    assertContent('queries.ts', srcCubaDir);

    await runGenerator('entity-cards', `${MPG_APP_DIR}/src/app/entity-cards`,
      JSON.stringify(answers.entityCards), '../../');

    await runGenerator('entity-management', `${MPG_APP_DIR}/src/app/entity-management`,
      JSON.stringify(answers.entityManagement), '../../');

    await installAndBuild('mpg-model', MPG_APP_DIR);
  });

  it('should generate react app from newborn cuba project - trusty-dragon', async function () {

    await rimraf(`${PRISTINE_APP_DIR}/*`);
    await runGenerator('app', PRISTINE_APP_DIR,
      undefined, undefined, 'projectModel-pristine.json');

    const srcCubaDir = path.join(PRISTINE_APP_DIR, 'src/cuba');
    assert.ok(!fs.existsSync(`${srcCubaDir}/enums/enums.ts`));

    await installAndBuild('pristine-model', PRISTINE_APP_DIR);
  });

  it('should generate app for empty project model', async function () {
    await rimraf(`${EMPTY_APP_DIR}/*`);
    await runGenerator('app', EMPTY_APP_DIR,
      undefined, undefined, 'projectModel-empty.json');

    const srcCubaDir = path.join(EMPTY_APP_DIR, 'src/cuba');
    assert.ok(!fs.existsSync(`${srcCubaDir}/enums/enums.ts`));
    assert.ok(!fs.existsSync(`${srcCubaDir}/entities`));

    assert.ok(fs.existsSync(`${srcCubaDir}/queries.ts`));
    assert.ok(fs.existsSync(`${srcCubaDir}/services.ts`));

    await installAndBuild('empty-model', EMPTY_APP_DIR);
  });
});

async function installAndBuild(suffix, appDir) {
  const logCaption = `e2e:react-client:${suffix}:`;
  console.log(`${logCaption} generation complete, start compilation`);

  await cmd(`cd ${appDir} && npm install`,
    `${logCaption} start compile react-client after generation  - npm install, path: ${fs.realpathSync(appDir)}`,
    `${logCaption} start compile react-client after generation - npm install - DONE`);

  await cmd(`cd ${appDir} && npm run build`,
    `${logCaption} start compile react-client after generation - npm run build, path: ${fs.realpathSync(appDir)}`,
    `${logCaption} start compile react-client after generation - npm run build - DONE\n-------------\n\n`);

  console.log(`${logCaption} react app generation test - PASSED`);
}
