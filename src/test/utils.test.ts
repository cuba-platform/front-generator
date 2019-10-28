import {convertToUnixPath, elementNameToClass, fqnToName, withAllFiles} from "../common/utils";
import * as assert from "assert";
import {expect} from "chai";
import * as path from "path";


describe('utils', function () {
  it("elementNameToClass", function () {
    assert.strictEqual(elementNameToClass('my-custom-el'), 'MyCustomEl');
    assert.strictEqual(elementNameToClass('x-f'), 'XF');
  });

  it(convertToUnixPath.name, function () {
    assert.strictEqual(convertToUnixPath('.\\some\\path'), './some/path');
  });

  it('should convert fqn name to valid TS class name ', function () {
    assert.strictEqual(fqnToName('com.company.mpg.entity.CarType'), 'com_company_mpg_entity_CarType');
    assert.strictEqual(fqnToName(''), '');
  });

  it('should apply modifier for all files in path recursively', async function () {

    const expectedFiles = [
      'common/base-generator.test.ts', 'common/cli-options.test.ts', 'common/model/cuba-model-utils.test.ts'
    ];
    const res: string[] = [];

    await withAllFiles(path.join(__dirname, 'common'), (file: string) => {
      res.push(file);
    });

    res.forEach(file => expect(expectedFiles.some(f => file.endsWith(f))).to.be.true);
  });

});

