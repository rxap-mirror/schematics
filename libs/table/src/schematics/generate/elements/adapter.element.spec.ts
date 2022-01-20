import { ElementFactory } from '@rxap/xml-parser';
import { AdapterElement } from './adapter.element';
import {
  Project,
  SourceFile
} from 'ts-morph';
import { GetComponentOptionsObject } from '@rxap/schematics-ts-morph';

describe('AdapterElement', () => {

  let project: Project;
  let sourceFile: SourceFile;

  beforeEach(() => {

    sourceFile = project.createSourceFile('test.component.ts');
    sourceFile.addClass({
      name: 'TestComponent',
      decorators: [
        {
          name: 'Component',
          arguments: ['{}']
        }
      ]
    });

  });

  it('should handle component without custom options', () => {

    const adapterElement = ElementFactory(AdapterElement, {
      factoryName: 'TableAdapterFactory',
      importFrom: '@digitaix/eurogard-table-system'
    });

    adapterElement.handleComponent({ sourceFile, project, options: { overwrite: true } as any });

    const componentOptions = GetComponentOptionsObject(sourceFile);

    let providers = componentOptions.getProperty('providers')!;

    expect(providers).toBeDefined();
    expect(providers.getChildCount()).toBe(1);
    expect(providers.getChildAtIndex(0))

  });

});
