import {addParameters} from '@storybook/angular';
import {INITIAL_VIEWPORTS} from '@storybook/addon-viewport';
import {withA11y} from '@storybook/addon-a11y';

addParameters({
  withA11y,
  viewport: {
    viewports: INITIAL_VIEWPORTS,
  },
  backgrounds: [
    { name: 'light', value: '#fafafa', default: true },
    { name: 'dark', value: '#303030' }
  ]
});
