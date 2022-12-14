import { ControlElement } from './control.element';
import { ElementAttribute, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { ElementFactory } from '@rxap/xml-parser';
import { TypeElement } from '@rxap/schematics-xml-parser';

@ElementExtends(ControlElement)
@ElementDef('file-control')
export class FileControlElement extends ControlElement {

  @ElementAttribute()
  public nullable: boolean = true;

  public postParse() {
    this.type = ElementFactory<TypeElement>(TypeElement, { name: 'File', nullable: this.nullable });
  }

}
