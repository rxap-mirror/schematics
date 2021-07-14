import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AbstractActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('restore-action')
export class RestoreActionElement extends MethodActionElement {

  public type = 'restore';

}
