import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import { AddNgModuleImport, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementAttribute, ElementChildTextContent, ElementDef, ElementRequired } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';

@ElementDef('pipe')
export class PipeElement implements ParsedElement<Rule>, HandleComponentModule {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public from!: string;

  @ElementChildTextContent()
  @ElementRequired()
  public module!: string;

  @ElementAttribute()
  public async?: boolean;

  public handleComponentModule({ sourceFile, project }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, this.module, this.from);
    if (this.async) {
      AddNgModuleImport(sourceFile, 'CommonModule', '@angular/common');
    }
  }

  public toString() {
    return ` | ${this.name}${this.async ? ' | async' : ''}`
  }

  public validate(): boolean {
    return true;
  }

}
