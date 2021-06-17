import {
  ComponentElement,
  ParseComponentElement,
  RenderComponent,
  ViewDefinitionXmlParserService
} from '@rxap/view-system';
import { ElementParser, RxapElement } from '@rxap/xml-parser';
import { <%= classify(name) %>ViewComponent } from './<%= dasherize(name) %>.view.component';

export function Parse<%= classify(name) %>ViewElement(
  parser: ViewDefinitionXmlParserService,
  element: RxapElement,
  viewElement: <%= classify(name) %>ViewElement
): <%= classify(name) %>ViewElement {

  return viewElement;
}

@RenderComponent(<%= classify(name) %>ViewComponent)
@ElementParser('<%= dasherize(name) %>', Parse<%= classify(name) %>ViewElement, ParseComponentElement)
export class <%= classify(name) %>ViewElement extends ComponentElement {

  public validate(): boolean {
    return false;
  }

}

export interface I<%= classify(name) %>ViewElement extends <%= classify(name) %>ViewElement {}
