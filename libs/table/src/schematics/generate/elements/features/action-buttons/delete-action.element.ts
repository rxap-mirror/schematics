import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AbstractActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('delete-action')
export class DeleteActionElement extends MethodActionElement {

  public type = 'delete';

}
