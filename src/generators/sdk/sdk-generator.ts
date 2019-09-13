import {BaseGenerator, readProjectModel} from "../../common/generation";
import {CommonGenerationOptions} from "../../common/cli-options";
import * as path from "path";
import {exportProjectModel, getOpenedCubaProjects, StudioProjectInfo} from "../../common/studio/studio-integration";
import {generateEntities} from "./model/entities-generation";
import {generateServices} from "./services/services-generation";
import {generateQueries} from "./services/queries-generation";
import {collectModelContext} from "./model/model-utils";

interface Answers {
  projectInfo: StudioProjectInfo;
}

/**
 * Yeoman generator for SDK.
 * Note, yeoman run all methods, declared in class - https://yeoman.io/authoring/#adding-your-own-functionality
 */
export class SdkGenerator extends BaseGenerator<Answers, {}, CommonGenerationOptions> {

  conflicter!: { force: boolean }; //missing in typings

  constructor(args: string | string[], options: CommonGenerationOptions) {
    super(args, options);
    this.sourceRoot(path.join(__dirname, 'template'));
  }

  async prompting() {
    if (this.options.model) {
      this.conflicter.force = true;
      this.log('Skipping prompts since model provided');
      this.cubaProjectModel = readProjectModel(this.options.model);
      return;
    }

    const openedCubaProjects = await getOpenedCubaProjects();
    if (openedCubaProjects.length < 1) {
      this.env.error(Error("Please open Cuba Studio Intellij and enable Old Studio integration"));
    }

    this.answers = await this.prompt([{
      name: 'projectInfo',
      type: 'list',
      message: 'Please select CUBA project you want use for generation',
      choices: openedCubaProjects.map(p => ({
        name: `${p.name} [${p.path}]`,
        value: p
      }))
    }]) as Answers;

  }

  // noinspection JSUnusedGlobalSymbols
  async prepareModel() {
    if (!this.cubaProjectModel && this.answers) {
      const modelFilePath = path.join(process.cwd(), 'projectModel.json');
      await exportProjectModel(this.answers.projectInfo.locationHash, modelFilePath);
      this.cubaProjectModel = readProjectModel(modelFilePath);
    }
  }

  writing() {
    if (this.cubaProjectModel) {

      const {restQueries, restServices} = this.cubaProjectModel;
      this.log(`Generating to ${this.destinationPath()}`);

      generateEntities(this.cubaProjectModel, path.join(this.destinationRoot()), this.fs);

      const ctx = collectModelContext(this.cubaProjectModel);

      const services = generateServices(restServices, ctx);
      this.fs.write(this.destinationPath('services.ts'), services);

      const queries = generateQueries(restQueries, ctx);
      this.fs.write(this.destinationPath('queries.ts'), queries);

    } else {
      this.env.error({name: 'No project model', message: 'Skip sdk generation - no project model provided'});
    }
  }

  end() {
    this.log(`SDK been successfully generated into ${this.destinationRoot()}`);
  }

}
