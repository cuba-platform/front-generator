import * as assert from "assert";
import {generate} from "../../../init";
import * as fs from "fs";
import {promisify} from "util";
import * as path from "path";

const modelPath = require.resolve('../../fixtures/mpg-projectModel.json');
const rimraf = promisify(require('rimraf'));

const SDK_DIR = path.join(process.cwd(), `src/test/generated/sdk`);

describe('sdk generator test', () => {
  it('should generate sdk:all', function () {
    return rimraf(`${SDK_DIR}/*`)
      .then(() => generate('sdk', 'all', {
          model: modelPath,
          dest: SDK_DIR,
          debug: true
        })
      )
      .then(() => {
        assert.ok(fs.existsSync(`services.ts`));
        assert.ok(fs.existsSync(`queries.ts`));
        assert.ok(fs.existsSync(`enums/enums.ts`));
        assert.ok(fs.existsSync(`entities/base`));
      });
  });

  it('should generates sdk for empty model', function () {
    //TODO
  });
});


