import { ElementDef, ElementExtends } from '@rxap/xml-parser/decorators';
import { RouteElement } from '../route.element';
import {AddNgModuleImport, CoerceImports, ToValueContext} from '@rxap/schematics-ts-morph';
import { RoutingSchema } from '../../schema';
import { SourceFile, WriterFunction, WriterFunctionOrValue, Writers } from 'ts-morph';
import { chain, Rule, noop } from '@angular-devkit/schematics';

@ElementExtends(RouteElement)
@ElementDef('sso-route')
export class SsoRouteElement {

  public toValue({ project, options, sourceFile }: ToValueContext<RoutingSchema> & { sourceFile: SourceFile }): Rule {
    CoerceImports(sourceFile,{
      namedImports: [ 'RXAP_O_AUTH_ROUTES' ],
      moduleSpecifier: '@rxap/oauth'
    });
    AddNgModuleImport(sourceFile, 'OAuthRoutingModule', '@rxap/oauth');
    return noop();
  }

  public buildRouteObject({ options }: { options: RoutingSchema }): WriterFunction | string {
    return '...RXAP_O_AUTH_ROUTES';
  }

}
