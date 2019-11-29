const path = require('path');
const fs = require('fs');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const rimraf = promisify(require('rimraf'));

const GENERATED_DIR = path.join('test', 'puppeteer', 'generated');
const FIXTURES_DIR = path.join('test', 'puppeteer', 'fixtures');

function init() {
  //check 'generated' dir - create if need
  !fs.existsSync(GENERATED_DIR) && fs.mkdirSync(GENERATED_DIR);
}

async function generateReactApp(dest, modelFile = 'projectModel-scr.json') {
  const pathToModel = path.join(process.cwd(), FIXTURES_DIR, modelFile);
  let command = `node bin/gen-cuba-front react-typescript:app --dest ${appPath(dest)} --model ${pathToModel}`;
  await exec(command);
}

async function generateAppComponents(
  dest, answers,
  moduleName = 'entity-management',
  modelFile = 'projectModel-scr.json') {

  const pathToModel = path.join(process.cwd(), FIXTURES_DIR, modelFile);
  const destFolder = path.join(process.cwd(), GENERATED_DIR, dest);
  const encodedAnswers = Buffer.from(JSON.stringify(answers)).toString('base64');
  const dirShift = `../../`;

  let command = `node bin/gen-cuba-front react-typescript:${moduleName} --dest ${destFolder} --model ${pathToModel} ` +
    ` --dirShift ${dirShift} --answers ${encodedAnswers}`;

  await exec(command);
}

async function installAppPackages(appDir) {
  const destFolder = path.join(process.cwd(), GENERATED_DIR, appDir);
  await exec(`cd ${destFolder} && npm install`);
}

// git clone git@github.com:cuba-labs/sample-car-rent.git
// cd sample-car-rent
// ./gradlew setupTomcat assemble
// ./gradlew startDb createDb updateDb deploy start
async function prepareBackEnd(appDir) {

  const destFolder = path.join(process.cwd(), GENERATED_DIR, appDir);
  const backDir = `${destFolder}/sample-car-rent`;

  await rimraf(backDir);

  await exec(`cd ${destFolder} && git clone https://github.com/cuba-labs/sample-car-rent.git`);
  await exec(`cd ${backDir} && ./gradlew setupTomcat assemble`);
  await exec(`cd ${backDir} && ./gradlew stop stopDb`);
  await exec(`cd ${backDir} && ./gradlew startDb createDb updateDb deploy start`);

  // todo gradle task waitAppStarted works fine on local env but failed on Travis, so just wait for a minute
  await new Promise(resolve => setTimeout(resolve, 60000));
  // await cmd(`cd ${backDir} && ./gradlew waitAppStarted`);
}

async function stopBackEnd(appFolder) {
  const backDir = `${appPath(appFolder)}/sample-car-rent`;
  await exec(`cd ${backDir} && ./gradlew stop stopDb`);
}

function appPath(appDir) {
  return path.join(process.cwd(), GENERATED_DIR, appDir);
}

function fixturesPath(appDir) {
  return path.join(process.cwd(), FIXTURES_DIR, appDir);
}

module.exports = {
  init: init,
  appPath: appPath,
  fixturesPath: fixturesPath,
  generateReactApp: generateReactApp,
  generateAppComponents: generateAppComponents,
  installAppPackages: installAppPackages,
  prepareBackEnd: prepareBackEnd,
  stopBackEnd: stopBackEnd
};
