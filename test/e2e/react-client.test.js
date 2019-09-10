const path = require('path');
const {promisify} = require('util');
const rimraf = promisify(require('rimraf'));
const {cmd, runGenerator, assertContent, init} = require('./e2e-common')('react-typescript');
const answers = require('./answers');

const appDir = 'test/e2e/generated/react-client';

describe('react typescript generator integration test', () => {
  it('should generate react app', function () {

    //todo react-client test with empty projectModel
    init();

    return  rimraf(`${appDir}/*`)
      .then(() => runGenerator('app', appDir))
      .then(() => {
        console.log('e2e:react: start files comparison with expect gauges');

        const srcCubaDir = path.join(appDir, 'src/cuba');
        assertContent('enums/enums.ts', srcCubaDir);
        assertContent('entities/mpg$Car.ts', srcCubaDir);
        assertContent('entities/mpg$SparePart.ts', srcCubaDir);

        //todo

        // assertContent('services.ts', srcCubaDir);
        // assertContent('queries.ts', srcCubaDir);
      })
      .then(() => runGenerator('entity-cards', `${appDir}/src/app/entity-cards`,
        answers.entityCards, '../../')
      )
      .then(() => runGenerator('entity-management', `${appDir}/src/app/entity-management`,
        answers.entityManagement, '../../')
      )
      .then(() => console.log('e2e:react: generation complete, start compilation'))
      .then(() => cmd(`cd ${appDir} && npm install`,
        'e2e:react-client: start compile react-client after generation  - npm install',
        'e2e:react-client: start compile react-client after generation - npm install - DONE')
      )
      .then(() => cmd('npm run build',
        'e2e:react-client: start compile react-client after generation - npm run build',
        'e2e:react-client: start compile react-client after generation - npm run build - DONE')
      )
      .then(() => console.log('e2e:react: react app generation test - PASSED'));

  });
});
