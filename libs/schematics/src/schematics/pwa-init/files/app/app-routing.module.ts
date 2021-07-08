import { NgModule } from '@angular/core';
import { ExtraOptions, RouterModule, Routes } from '@angular/router';

export const APP_ROUTES: Routes = [];

export const APP_ROUTER_CONFIG: ExtraOptions = {};

@NgModule({
  exports: [ RouterModule ],
  imports: [
    RouterModule.forRoot(APP_ROUTES, APP_ROUTER_CONFIG)
  ]
})
export class AppRoutingModule {}
