import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { MethodActionElement } from './method-action.element';
import { AbstractActionButtonElement } from './abstract-action-button.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('restore-action')
export class RestoreActionElement extends MethodActionElement {

  public type = 'restore';

}
