import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector:        '<%= prefix %>-root',
  templateUrl:     './app.component.html',
  styleUrls:       [ './app.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host:            { class: '<%= prefix %>' }
})
export class AppComponent {}
