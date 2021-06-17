import { Directive, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { StandaloneControlDirective } from '@rxap/form-system';

@Directive({
  selector:  '<%= prefix %>-<%= dasherize(name) %>-control',
  providers: [
    {
      provide:     NG_VALUE_ACCESSOR,
      multi:       true,
      useExisting: forwardRef(() => Standalone<%= classify(name) %>ControlDirective)
    }
  ]
})
export class Standalone<%= classify(name) %>ControlDirective extends StandaloneControlDirective<any, any, any> {}
