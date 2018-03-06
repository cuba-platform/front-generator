import {QuestionType} from "../../../common/inquirer";
import {Questions} from "yeoman-generator";

export const polymer2AppQuestions: Questions = [{
  name: 'name',
  message: 'Project Name',
  type: QuestionType.input
}, {
  name: 'modulePrefix',
  message: 'Module Prefix',
  type: QuestionType.input,
  'default': 'app'
}, {
  name: 'namespace',
  message: 'Project Namespace',
  type: QuestionType.input
}, {
  name: 'locales',
  message: 'Locales',
  type: QuestionType.checkbox,
  choices: [{
    name: 'English',
    value: 'en',
    checked: true
  }, {
    name: 'Russian',
    value: 'ru'
  }]
}];