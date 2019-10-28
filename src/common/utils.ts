import * as path from "path";
import {Entity} from "./model/cuba-model";
import {readdir} from 'fs';
import {promisify} from "util";


/**
 * @param {string} elementName my-app-custom
 * @returns {string} class name MyAppCustom
 */
export const elementNameToClass = (elementName: string): string => {
  if (elementName == null) {
    return elementName;
  }
  return elementName
    .split('-')
    .map(capitalizeFirst)
    .join('');
};

export const capitalizeFirst = (part: string) => part[0].toUpperCase() + part.slice(1);

export const unCapitalizeFirst = (part: string) => part[0].toLowerCase() + part.slice(1);

export function convertToUnixPath(input: string): string {
  const isExtendedLengthPath = /^\\\\\?\\/.test(input);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(input); // eslint-disable-line no-control-regex

  if (isExtendedLengthPath || hasNonAscii) {
    return input;
  }

  return input.replace(/\\/g, '/');
}

/**
 * Convert java class fully qualified name to compilable TS class name
 *
 * @param fqn java class fqn
 */
export function fqnToName(fqn: string): string {
  return fqn.replace(/\./g, '_');
}

export function getEntityModulePath(entity: Entity, prefix: string = ''): string {
  const modulePath = entity.name ? entity.name : entity.className;
  return path.posix.join(prefix, modulePath);
}

/**
 * Recursively walk through all files in dir and execute modifier on each
 *
 * @param dir - directory walk through
 * @param modifier - function to applied to each file
 */
export async function withAllFiles(dir: string, modifier: Function) {
  const entries = await promisify(readdir)(dir, { withFileTypes: true });
  entries.map((entry) => {
    const res = path.resolve(dir, entry.name);
    if (entry.isDirectory()) {
      return withAllFiles(res, modifier);
    } else {
      return modifier(res);
    }
  });
}

