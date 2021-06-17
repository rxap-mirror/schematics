import { ModuleWithProviders, NgModule } from '@angular/core';
import {

< %= classify(name) % > ControlComponent;
}
from;
'./<%= dasherize(name) %>-control.component';
import { Standalone

< %= classify(name) % > ControlDirectiveModule;
}
from;
'./standalone-<%= dasherize(name) %>-control.directive.module';

@NgModule({
  imports:         [],
  declarations:    [ < %= classify(name) % > ControlComponent ],
  exports:         [ < %= classify(name) % > ControlComponent ],
  entryComponents: [ < %= classify(name) % > ControlComponent ]
})
export class
< %= classify(name) % > ControlComponentModule;
{

  public static standalone(): ModuleWithProviders {
    return {
      ngModule: Standalone<%= camelize(name) %>ControlModule
    };
  }

}

@NgModule({
  exports: [
    <%= classify(name) %>ControlComponentModule,
    Standalone<%= classify(name) %>ControlDirectiveModule
  ]
})
export class Standalone<%= camelize(name) %>ControlModule {}
