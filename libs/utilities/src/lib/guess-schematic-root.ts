import { Tree } from '@angular-devkit/schematics';
import { GetProjectCollectionJson } from '@rxap/schematics-utilities';

/**
 * Tries to guess the schematic root of a project.
 *
 * 1. check if a collection.json exists - else default
 * 2. check if the collection.json contains schematics - else default
 * 3. resolve based on the first found schematic config the schematics root folder - else default
 *
 * default: src/schematics
 *
 * @param host
 * @param projectName
 * @constructor
 */
export function GuessSchematicRoot(host: Tree, projectName: string): string {

  const collectionJson = GetProjectCollectionJson(host, projectName);

  if (Object.keys(collectionJson.schematics).length) {
    const firstSchematic = collectionJson.schematics[Object.keys(collectionJson.schematics)[0]];
    const basePathSegmentList: string[] = [];
    for (const segment of firstSchematic.factory.split('/')) {
      basePathSegmentList.push(segment);
      if (segment === 'schematics' || segment === 'schematic') {
        break;
      }
    }
    return basePathSegmentList.join('/');
  }

  return 'src/schematics';

}
