export interface AddPluginConfigSchematicSchema {
  /**
   * The name of the new schematic
   */
  name: string;
  /**
   * The absolute path to the schematic folder or the relative path from the project root
   */
  path?: string;
  /**
   * The project where the schematic should be added
   */
  project?: string;
  /**
   * The description of the new schematic
   */
  description?: string;
  defaultTarget: string;
  defaultBuilder: string;
}
