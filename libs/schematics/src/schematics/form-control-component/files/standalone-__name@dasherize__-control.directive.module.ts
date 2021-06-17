import { NgModule } from '@angular/core';
import { Standalone

< %= classify(name) % > ControlDirective;
}
from;
'./standalone-<%= dasherize(name) %>-control.directive';

@NgModule({
  declarations: [ Standalone < %= classify(name) % > ControlDirective ],
  exports:      [ Standalone < %= classify(name) % > ControlDirective ]
})
export class Standalone<%=

classify(name) % > ControlDirectiveModule;
{}
