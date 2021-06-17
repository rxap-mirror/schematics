import { sandboxOf } from 'angular-playground';
import { RxapControlViewComponentModule } from '@rxap/form-system-dev';
import { FlexLayoutModule } from '@angular/flex-layout';
import {

< %= classify(name) % > ControlComponent;
}
from;
'./<%= dasherize(name) %>-control.component';
import {

< %= classify(name) % > ControlComponentModule;
}
from;
'./<%= dasherize(name) %>-control.component.module';

export default sandboxOf(< %= classify(name) % > ControlComponent, {
  imports:          [
    < %= classify(name) % > ControlComponentModule.standalone(),
    RxapControlViewComponentModule,
    FlexLayoutModule
  ],
  declareComponent: false
}).add('default', {
  template: `
  <div fxLayout="column" fxLayoutGap="32px">
  <<%= prefix %>-<%= dasherize(name) %>-control fxFlex="nogrow" #control="<%= prefix %><%= classify(name) %>Control"></<%= prefix %>-<%= dasherize(name) %>-control>
  <rxap-control-view [control]="control.control" fxFlex="nogrow"></rxap-control-view>
</div>
  `
});
