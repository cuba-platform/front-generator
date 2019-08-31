const path = require('path');
const assert = require('assert');
const {promisify} = require('util');
const exec = promisify(require('child_process').exec);
const fs = require('fs');

const EXPECT_DIR = 'test/e2e/expect';


function runGenerator(name, dest, answersJSONString, dirShift, modelFile = 'projectModel2.json') {
  const pathToModel = path.join(process.cwd(), 'test', modelFile);

  let command = `node bin/gen-cuba-front ${name} --model ${pathToModel}`;
  if (dest) {
    command += ` --dest ${dest}`;
  }
  if (answersJSONString) {
    const encodedAnswers = Buffer.from(answersJSONString).toString('base64');
    command += ` --answers ${encodedAnswers}`;
  }
  if (dirShift) {
    command += ` --dirShift ${dirShift}`
  }
  console.log(command);
  return exec(command);
}

function logOutput(onful, onreject, comment) {
  if (onful && onful.stdout) console.log(onful.stdout);
  if (onful && onful.stderr) console.log(onful.stderr);
  if (onreject && onreject.stdout) console.log(onreject.stdout);
  if (onreject && onreject.stderr) console.log(onreject.stderr);

  console.log(comment);
}

function assertContent(filePath, moduleDir, multiline = true) {

  const expectFilePath = path.join(EXPECT_DIR, filePath);
  const actualFilePath = path.join(moduleDir, filePath);

  const content = fs.readFileSync(actualFilePath, 'utf8');
  const expect = fs.readFileSync(expectFilePath, 'utf8');

  assert.strictEqual(drain(content, multiline), drain(expect, multiline));
  console.log(`e2e: assert file ${actualFilePath} with expect gauge ${expectFilePath} - PASSED`);
}

function drain(content, multiline = true) {
  const result = multiline
    ? content
      .replace(/^\s+/gm, '') //spaces at the line start, and empty lines
    : content
      .replace(/\n/g, ' ');  //multiline false - join in one line

  return result
    .replace(/\s{2,}/g, ' ') //two or more spaces with one space
    .trim();
}

module.exports = {
  runGenerator: runGenerator,
  logOutput: logOutput,
  assertContent: assertContent
};