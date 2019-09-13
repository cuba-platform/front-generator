import {ProjectEntityInfo} from "./entities-generation";
import {EnumDeclaration} from "typescript";
import {Entity, EntityAttribute, getEntitiesArray, ProjectModel} from "../../../common/model/cuba-model";
import {createEnums} from "./enums-generation";

export type ModelContext = {
  entitiesMap: Map<string, ProjectEntityInfo>
  enumsMap: Map<string, EnumDeclaration>
}

export function collectModelContext(projectModel: ProjectModel) {
  const entities: Entity[] = getEntitiesArray(projectModel.entities);
  const baseProjectEntities: Entity[] = getEntitiesArray(projectModel.baseProjectEntities);

  const entitiesMap = new Map<string, ProjectEntityInfo>();
  const enumsMap = new Map<string, EnumDeclaration>();
  createEnums(projectModel.enums).forEach(en => enumsMap.set(en.fqn, en.node));

  const addEntityToMap = (map: Map<string, ProjectEntityInfo>, isBaseProjectEntity = false) => (e: Entity) => {
    map.set(e.fqn, {
      isBaseProjectEntity,
      entity: e
    })
  };

  entities.forEach(addEntityToMap(entitiesMap));
  baseProjectEntities.forEach(addEntityToMap(entitiesMap, true));
  return {entitiesMap, enumsMap}
}

//todo add assert in integration test with inheritor attrs (sec$User)
export function collectAttributesFromHierarchy(entity: Entity, projectModel: ProjectModel): EntityAttribute[] {
  let attrs: EntityAttribute[] = entity.attributes;

  const allEntities: Partial<Entity>[] = ([] as Partial<Entity>[])
    .concat(projectModel.entities)
    .concat(projectModel.baseProjectEntities ? projectModel.baseProjectEntities : []);

  let {parentClassName, parentPackage} = entity;

  while (parentClassName && parentPackage && parentClassName.length > 0 && parentPackage.length > 0) {
    const parentFqn = `${parentPackage}.${parentClassName}`;
    const parent = allEntities.find(e => e.fqn === parentFqn);
    if (parent) {
      attrs = parent.attributes ? attrs.concat(parent.attributes) : attrs;
      parentPackage = parent.parentPackage ? parent.parentPackage : '';
      parentClassName = parent.parentClassName ? parent.parentClassName : '';
    } else {
      parentPackage = '';
      parentClassName = '';
    }
  }

  return attrs;
}