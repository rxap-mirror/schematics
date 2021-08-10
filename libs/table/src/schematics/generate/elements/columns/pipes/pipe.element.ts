import { ParsedElement } from '@rxap/xml-parser';
import { Rule } from '@angular-devkit/schematics';
import { AddNgModuleImport, HandleComponentModule, ToValueContext } from '@rxap/schematics-ts-morph';
import { ElementAttribute, ElementChildTextContent } from '@rxap/xml-parser/decorators';
import { SourceFile } from 'ts-morph';

export class PipeElement implements ParsedElement<Rule>, HandleComponentModule {

  @ElementChildTextContent()
  public name!: string;

  @ElementChildTextContent()
  public from!: string;

  @ElementChildTextContent()
  public module!: string;

  @ElementAttribute()
  public async?: boolean;

  public handleComponentModule({ sourceFile, project }: ToValueContext & { sourceFile: SourceFile }) {
    AddNgModuleImport(sourceFile, this.module, this.from);
    if (this.async) {
      AddNgModuleImport(sourceFile, 'CommonModule', '@angular/common');
    }
  }

  public validate(): boolean {
    return true;
  }

}
