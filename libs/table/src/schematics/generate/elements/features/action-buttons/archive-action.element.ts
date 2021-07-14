import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { AbstractActionButtonElement } from './action-button.element';
import { MethodActionElement } from './method-action.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('archive-action')
export class ArchiveActionElement extends MethodActionElement {

  public type = 'archive';

}
