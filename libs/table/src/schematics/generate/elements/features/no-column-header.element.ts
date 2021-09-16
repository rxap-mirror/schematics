import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { FeatureElement } from './feature.element';

@ElementExtends(FeatureElement)
@ElementDef('no-column-header')
export class NoColumnHeaderElement extends FeatureElement {
}
