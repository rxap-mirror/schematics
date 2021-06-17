import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import { ConfigService } from '@rxap/config';
import { UpdateEnvironment } from '@rxap/environment';

// import { registerLocaleData } from '@angular/common';
// import localeDe from '@angular/common/locales/de';
// import localeDeExtra from '@angular/common/locales/extra/de';
//
// registerLocaleData(localeDe, 'de-DE', localeDeExtra);

console.debug(`environment: '${environment.name}'`, environment);

if (environment.production) {
  enableProdMode();
}

Promise.all([
  UpdateEnvironment(environment),
  ConfigService.Load(),
]).then(() =>
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err))
);
