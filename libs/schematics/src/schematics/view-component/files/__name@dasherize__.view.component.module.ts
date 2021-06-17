import { NgModule } from '@angular/core';
import { ViewDefinitionXmlParserModule } from '@rxap/view-system';
import { <%= classify(name) %>ViewComponent } from './<%= dasherize(name) %>.view.component';
import { <%= classify(name) %>ViewElement } from './<%= dasherize(name) %>.view.element';

@NgModule({
  imports:         [
    ViewDefinitionXmlParserModule.register([ <%= classify(name) %>ViewElement ])
  ],
  declarations:    [ <%= classify(name) %>ViewComponent ],
  exports:         [ <%= classify(name) %>ViewComponent ],
  entryComponents: [ <%= classify(name) %>ViewComponent ]
})
export class <%= classify(name) %>ViewComponentModule { }
