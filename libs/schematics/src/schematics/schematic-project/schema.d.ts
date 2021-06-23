import { Schema as NodePackageGeneratorSchema } from '@nrwl/node/src/generators/library/schema';

export interface SchematicProjectSchema extends Omit<Omit<NodePackageGeneratorSchema, 'buildable'>, 'publishable'> {
  project?: string;
  builders?: boolean;
  overwrite?: boolean;
}
