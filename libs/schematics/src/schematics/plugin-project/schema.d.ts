import { SchematicProjectSchema } from '../schematic-project/schema';

export interface PluginProjectSchema extends Omit<SchematicProjectSchema, 'builders'> {
  defaultBuilder?: string;
  defaultTarget?: string;
}
