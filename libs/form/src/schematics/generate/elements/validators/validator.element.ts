import { ParsedElement } from '@rxap/xml-parser';
import { ObjectLiteralExpression, SourceFile } from 'ts-morph';
import { ElementDef, ElementTextContent } from '@rxap/xml-parser/decorators';
import { AddControlValidator, ToValueContext } from '@rxap/schematics-ts-morph';

export interface ValidatorToValueContext extends ToValueContext {
  controlOptions: ObjectLiteralExpression;
  sourceFile: SourceFile;
}

@ElementDef('validator')
export class ValidatorElement implements ParsedElement {

  @ElementTextContent()
  public validator!: string;

  public validate(): boolean {
    return !!this.validator;
  }

  public toValue({ controlOptions }: ValidatorToValueContext): any {
    AddControlValidator(this.validator, controlOptions);
  }

}
