import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

// import { registerLocaleData } from '@angular/common';
// import localeDe from '@angular/common/locales/de';
// import localeDeExtra from '@angular/common/locales/extra/de';
//
// registerLocaleData(localeDe, 'de-DE', localeDeExtra);

console.debug(`environment: '${environment.name}'`, environment);

if (environment.production) {
  enableProdMode();
}

const setup: Promise<any>[] = [ Promise.resolve() ];
const perBootstrap: Promise<any>[] = [ Promise.resolve() ];

Promise
  .all(setup)
  .catch(error => {
    console.error(`application setup failed: ${error?.message ? error.message : ''}`);
    throw error;
  })
  .then(() => Promise
    .all(perBootstrap)
    .catch(error => {
      console.error(`application pre bootstrap failed: ${error?.message ? error.message : ''}`);
      throw error;
    })
  )
  .then(() => platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch(error => {
      console.error(`application bootstrap failed: ${error?.message ? error.message : ''}`);
      throw error;
    })
  );
