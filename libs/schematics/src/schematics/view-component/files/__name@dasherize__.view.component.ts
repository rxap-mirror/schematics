import { ChangeDetectionStrategy, Component, Input, } from '@angular/core';
import { IRenderComponent } from '@rxap/view-system';
import { Required } from '@rxap/utilities';
import { BaseDefinitionMetaData } from '@rxap/loader';
import { I<%= classify(name) %>ViewElement } from './<%= dasherize(name) %>.view.element';

@Component({
  templateUrl:     './<%= dasherize(name) %>.view.component.html',
  styleUrls:       [ './<%= dasherize(name) %>.view.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class <%= classify(name) %>ViewComponent implements IRenderComponent<I<%= classify(name) %>ViewElement> {
  @Input() @Required public element!: I<%= classify(name) %>ViewElement;
  @Input() @Required metadata!: Partial<BaseDefinitionMetaData>;
}
