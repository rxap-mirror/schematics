import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { MethodActionElement } from './method-action.element';
import { AbstractActionButtonElement } from './abstract-action-button.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('delete-action')
export class DeleteActionElement extends MethodActionElement {

  public type = 'delete';

}
