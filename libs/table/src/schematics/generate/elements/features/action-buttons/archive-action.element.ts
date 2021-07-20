import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { MethodActionElement } from './method-action.element';
import { AbstractActionButtonElement } from './abstract-action-button.element';

@ElementExtends(AbstractActionButtonElement)
@ElementDef('archive-action')
export class ArchiveActionElement extends MethodActionElement {

  public type = 'archive';

}
