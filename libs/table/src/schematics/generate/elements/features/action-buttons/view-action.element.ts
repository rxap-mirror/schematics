import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AbstractActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('view-action')
export class ViewActionElement extends MethodActionElement {

  public type = 'view';

}
