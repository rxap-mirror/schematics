import {
  ElementAttribute,
  ElementChildTextContent,
  ElementDef,
  ElementExtends,
  ElementRequired
} from '@rxap/xml-parser/decorators';
import { ParsedElement } from '@rxap/xml-parser';
import { SourceFile } from 'ts-morph';

@ElementDef('type')
export class TypeElement implements ParsedElement {

  @ElementChildTextContent()
  @ElementRequired()
  public name!: string;

  @ElementChildTextContent()
  public from?: string;

  @ElementAttribute()
  public nullable?: boolean;

  public toValue({ sourceFile }: { sourceFile: SourceFile }): string {
    if (this.from) {
      sourceFile.addImportDeclaration({
        namedImports: [ this.name ],
        moduleSpecifier: this.from
      });
    }
    if (this.nullable) {
      return [ this.name, 'null' ].join(' | ');
    }
    return this.name;
  }

}

@ElementExtends(TypeElement)
@ElementDef('string-type')
export class StringTypeElement extends TypeElement implements ParsedElement {

  public name = 'string';

}
