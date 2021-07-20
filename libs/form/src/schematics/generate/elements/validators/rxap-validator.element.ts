import { ValidatorElement, ValidatorToValueContext } from './validator.element';
import { ElementChildTextContent, ElementRecord } from '@rxap/xml-parser/decorators';
import { CodeBlockWriter, WriterFunctionOrValue, Writers } from 'ts-morph';

function ToJavascriptObject(obj: any): string {
  const codeWriter = new CodeBlockWriter();

  function toObjectWriterObject(obj: Record<string, any>) {
    const input: Record<string, WriterFunctionOrValue | undefined> = {};

    for (const [ key, value ] of Object.entries(obj)) {

      switch (typeof value) {
        case 'object':
          input[key] = Writers.object(toObjectWriterObject(value));
          break;
        case 'bigint':
        case 'boolean':
        case 'number':
          input[key] = value + '';
          break;
        case 'string':
          input[key] = w => w.quote(value);
          break;
        case 'undefined':
        case 'function':
        case 'symbol':
        default:
          break;
      }

    }

    return input;
  }

  Writers.object(toObjectWriterObject(obj))(codeWriter);
  return codeWriter.toString();
}

export abstract class RxapValidatorElement extends ValidatorElement {

  public abstract name: string;

  @ElementRecord()
  public options?: Record<string, any>;

  @ElementChildTextContent()
  public message?: string;

  public postParse() {
    const params: any = {};
    if (this.message) {
      params.message = this.message;
    }
    if (this.options) {
      params.options = this.options;
    }
    this.validator = `RxapValidators.${this.name}(${Object.keys(params).length ? ToJavascriptObject(params) : ''})`;
  }

  public toValue({ controlOptions, project, options, sourceFile }: ValidatorToValueContext): any {
    sourceFile.addImportDeclaration({
      moduleSpecifier: '@rxap/forms',
      namedImports: [ 'RxapValidators' ]
    });
    return super.toValue({ controlOptions, project, options, sourceFile });
  }

  protected compareValidator(a: string, b: string): boolean {
    return !!a.match(new RegExp(`RxapValidators\\.${this.name}\\(`));
  }

}
