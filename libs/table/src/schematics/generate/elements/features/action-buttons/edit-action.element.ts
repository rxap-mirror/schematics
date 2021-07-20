import { ElementChild, ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { MethodActionElement } from './method-action.element';
import { AddComponentProvider, ToValueContext } from '@rxap/schematics-ts-morph';
import { chain, noop, Rule } from '@angular-devkit/schematics';
import { SourceFile } from 'ts-morph';
import { strings } from '@angular-devkit/core';
import { GenerateSchema } from '../../../schema';
import { WindowFormElement } from '../window-form.element';
import { join } from 'path';
import { ModuleElement } from '@rxap/schematics-xml-parser';
import { AbstractActionButtonElement } from './abstract-action-button.element';
import { EditActionLoaderElement } from './edit-action-loader.element';

const { dasherize, classify, camelize } = strings;


@ElementExtends(AbstractActionButtonElement)
@ElementDef('edit-action')
export class EditActionElement extends MethodActionElement {

  public type = 'edit';

  @ElementChild(EditActionLoaderElement)
  public loader?: EditActionLoaderElement;

  @ElementChild(ModuleElement)
  public module?: ModuleElement;

  @ElementChild(WindowFormElement)
  public windowForm?: WindowFormElement;

  public handleComponent({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponent({ project, options, sourceFile });
    this.loader?.handleComponent({ project, options, sourceFile });
    // if a windowForm is used the corresponding FormProvider must be added
    if (this.windowForm) {

      const formProviderName = 'EditFormProviders';

      AddComponentProvider(
        sourceFile,
        formProviderName,
        [
          {
            moduleSpecifier: `./${join(dasherize(this.windowForm.name!) + '-form', 'form.providers')}`,
            namedImports:    [
              {
                name:  'FormProviders',
                alias: formProviderName
              }
            ]
          }
        ],
        options.overwrite
      );

    }
  }

  public handleComponentModule({ project, sourceFile, options }: ToValueContext & { sourceFile: SourceFile }) {
    super.handleComponentModule({ project, sourceFile, options });
    this.loader?.handleComponentModule({ project, options, sourceFile });
    this.module?.handleComponentModule({ project, sourceFile, options });
  }

  public toValue({ project, options }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      this.loader?.toValue({ project, options }) ?? (noop()),
      this.module?.toValue({ project, options }) ?? (noop()),
      this.windowForm?.toValue({ project, options }) ?? (noop())
    ]);
  }

}
