export interface SharedModuleSchema {
  name: string;
  component: boolean;
  selector: string;
  input: string[];
  output: string[];
  import: string[];
  template?: string;
  inputOutput: string[];
  hostListener: string[];
  hostBinding: string[];
  zeplinName: string[];
  storybook: boolean;
}
