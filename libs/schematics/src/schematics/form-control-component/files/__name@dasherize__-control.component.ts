import { ChangeDetectionStrategy, Component, forwardRef } from '@angular/core';
import { BaseControlComponent, RXAP_CONTROL_COMPONENT } from '@rxap/form-system';

@Component({
  selector:        '<%= prefix %>-<%= dasherize(name) %>-control',
  templateUrl:     './<%= dasherize(name) %>-control.component.html',
  styleUrls:       [ './<%= dasherize(name) %>-control.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs:        '<%= prefix %><%= classify(name) %>Control',
  providers:       [
    {
      provide:     BaseControlComponent,
      useExisting: forwardRef(() => <%= classify(name) %>ControlComponent)
    },
    {
      provide:     RXAP_CONTROL_COMPONENT,
      useExisting: forwardRef(() => <%= classify(name) %>ControlComponent)
    }
  ]
})
export class <%= classify(name) %>ControlComponent extends BaseControlComponent<any, any> {}
