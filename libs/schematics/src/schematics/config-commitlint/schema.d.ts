export interface ConfigCommitlintSchema {
  extend: 'conventional' | 'lerna' | 'angular';
  overwrite: boolean;
}
