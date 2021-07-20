import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { MethodActionElement } from './method-action.element';
import { AbstractActionButtonElement } from './abstract-action-button.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('view-action')
export class ViewActionElement extends MethodActionElement {

  public type = 'view';

}
