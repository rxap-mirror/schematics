import { Rule } from '@angular-devkit/schematics';

export function AddFeaturesIndexTheme(): Rule {
  return tree => {

    const featureIndexThemeFilePath = 'libs/feature/_index.scss';

    if (!tree.exists(featureIndexThemeFilePath)) {
      tree.create(featureIndexThemeFilePath, `/* IMPORT */

@mixin feature-theme($theme) {

  /* THEME_INCLUDE */

}

@mixin feature-typography($config) {

  /* TYPOGRAPHY_INCLUDE */

}`);
    }

  }
}
