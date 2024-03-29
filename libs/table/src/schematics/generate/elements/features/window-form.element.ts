import { strings } from '@angular-devkit/core';
import { chain, externalSchematic, Rule } from '@angular-devkit/schematics';
import { SubmitHandleMethod } from '@rxap/schematics-form';
import { AddComponentProvider, AddNgModuleProvider, ToValueContext } from '@rxap/schematics-ts-morph';
import { MethodElement, ModuleElement, TypeElement } from '@rxap/schematics-xml-parser';
import { ElementFactory, ParsedElement } from '@rxap/xml-parser';
import {
  ElementChild,
  ElementChildRawContent,
  ElementChildTextContent,
  ElementDef,
  ElementRequired,
} from '@rxap/xml-parser/decorators';
import { join } from 'path';
import { Writers } from 'ts-morph';
import { GenerateSchema } from '../../schema';
import type { ActionButtonElement } from './action-buttons/action-button.element';
import type { EditActionElement } from './action-buttons/edit-action.element';
import type { CreateButtonElement } from './create-button.element';

const { dasherize, classify } = strings;

@ElementDef('window-form')
export class WindowFormElement implements ParsedElement {
  public __parent!: CreateButtonElement | EditActionElement | ActionButtonElement;

  @ElementChildRawContent()
  public template?: string;

  @ElementChildTextContent()
  public name?: string;

  @ElementChildTextContent()
  public form?: string;

  @ElementChild(SubmitHandleMethod)
  @ElementRequired()
  public submit!: SubmitHandleMethod;

  @ElementChildTextContent()
  @ElementRequired()
  public title!: string;

  public get coerceName(): string {
    if (!this.name) {
      // dependent on the parent component an auto suffix is added
      let suffix: string = '';
      if (this.__parent.__tag === 'create-button') {
        suffix = '-create';
      }
      if (this.__parent.__tag === 'edit-action') {
        suffix = '-edit';
      }
      if (this.__parent.__tag === 'action') {
        suffix = '-' + (this.__parent as any).type
      }
      this.name = dasherize(this.__parent.__parent.id) + suffix;
    }
    return this.name;
  }

  public get openFormWindowMethodName() {
    return 'Open' + classify(this.coerceName) + 'FormWindowMethod';
  }

  public get openFormWindowMethodModuleSpecifier() {
    return 'open-' + dasherize(this.coerceName) + '-form-window.method';
  }

  public postParse() {
    this.__parent.module = ElementFactory<ModuleElement>(ModuleElement, {
      name: classify(this.coerceName) + 'FormComponentModule',
      form:
            './' +
              join(
                dasherize(this.coerceName) + '-form',
                dasherize(this.coerceName) + '-form.component.module',
              ),
    });
    this.__parent.method = ElementFactory<MethodElement>(MethodElement, {
      name: this.openFormWindowMethodName,
      from:
            './' +
              join(
                dasherize(this.coerceName) + '-form',
                this.openFormWindowMethodModuleSpecifier,
              ),
    });
    if (!this.template) {
      this.template = join(
        'views',
        'forms',
        dasherize(this.form ?? this.__parent.__parent.id) + '.xml'
      );
    }
    // if the submit method does not have a adapter the method
    // should have the form parameters
    if (!this.submit.adapter) {
      this.submit.method.parameterType = ElementFactory<TypeElement>(TypeElement, {
        name: 'I' + classify(this.coerceName) + 'Form',
        from: join('..', dasherize(this.coerceName) + '-form', dasherize(this.coerceName) + '.form')
      });
    }
  }

  public toValue({ options, project }: ToValueContext<GenerateSchema>): Rule {
    return chain([
      externalSchematic('@rxap/schematics-form', 'generate-view', {
        path:             options.path?.replace(/^\//, ''),
        template:         this.template,
        name:             this.name,
        project:          options.project,
        organizeImports:  false,
        fixImports:       false,
        format:           false,
        templateBasePath: options.templateBasePath,
        overwrite:        options.overwrite,
        openApiModule:    options.openApiModule,
        skipTsFiles:      options.skipTsFiles,
        tsMorphProject:   () => project,
      }),
      (tree) => {

        const formComponentModuleFilePath = join(
          dasherize(this.name!) + '-form',
          dasherize(this.name!) + '-form.component.module.ts'
        );

        if (!tree.exists(join(options.path!, formComponentModuleFilePath))) {
          console.log(
            'Table window form component module path: ' +
            join(options.path!, formComponentModuleFilePath)
          );
          throw new Error('The table window form component module is not generated');
        }

        const sourceFile =
                project.getSourceFile(formComponentModuleFilePath) ??
                project.createSourceFile(
                  formComponentModuleFilePath,
                  tree.read(join(options.path!, formComponentModuleFilePath))!.toString(),
                );

        AddNgModuleProvider(
          sourceFile,
          this.openFormWindowMethodName,
          [
            {
              moduleSpecifier: './' + this.openFormWindowMethodModuleSpecifier,
              namedImports: [ this.openFormWindowMethodName ]
            }
          ]
        )

      },
      (tree) => {
        const formComponentFilePath = join(
          dasherize(this.name!) + '-form',
          dasherize(this.name!) + '-form.component.ts'
        );

        if (!tree.exists(join(options.path!, formComponentFilePath))) {
          console.log(
            'Table window form component path: ' +
            join(options.path!, formComponentFilePath)
          );
          throw new Error('The table window form component is not generated');
        }

        const sourceFile =
                project.getSourceFile(formComponentFilePath) ??
                project.createSourceFile(
                  formComponentFilePath,
                  tree.read(join(options.path!, formComponentFilePath))!.toString(),
                );

        AddComponentProvider(
          sourceFile,
          {
            provide:  'RXAP_WINDOW_SETTINGS',
            useValue: Writers.object({
              title: `$localize\`${this.title}\``,
            }),
          },
          [
            {
              namedImports: ['RXAP_WINDOW_SETTINGS'],
              moduleSpecifier: '@rxap/window-system',
            },
          ],
          options.overwrite
        );

        this.submit.handleComponent({ project, sourceFile, options });
      },
    ]);
  }

  public validate(): boolean {
    return !!this.template;
  }
}
