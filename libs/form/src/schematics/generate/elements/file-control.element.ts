import { ControlElement, ControlTypeElement } from './control.element';
import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';

@ElementExtends(ControlElement)
@ElementDef('file-control')
export class FileControlElement extends ControlElement {

  public postParse() {
    this.type = ElementFactory(ControlTypeElement, { name: 'File' });
  }

}
