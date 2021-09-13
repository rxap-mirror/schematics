import { Constructor } from '@rxap/utilities';
import { ParsedElement } from '@rxap/xml-parser';
import { AngularValidatorElement } from './angular-validator.element';
import { EmailElement } from './email.element';
import { IsArrayElement } from './is-array.element';
import { IsBooleanElement } from './is-boolean.element';
import { IsComplexElement } from './is-complex.element';
import { IsDateElement } from './is-date.element';
import { IsEmailElement } from './is-email.element';
import { IsEnumElement } from './is-enum.element';
import { IsIntElement } from './is-int.element';
import { IsIpElement } from './is-ip.element';
import { IsNumberElement } from './is-number.element';
import { IsObjectElement } from './is-object.element';
import { IsPhoneNumberElement } from './is-phone-number.element';
import { IsStringElement } from './is-string.element';
import { IsUrlElement } from './is-url.element';
import { MaxLengthElement } from './max-length.element';
import { MaxElement } from './max.element';
import { MinLengthElement } from './min-length.element';
import { MinElement } from './min.element';
import { PatternElement } from './pattern.element';
import { RequiredTrueElement } from './required-true.element';
import { RequiredElement } from './required.element';
import { ValidatorElement } from './validator.element';

export const ValidatorElements: Array<Constructor<ParsedElement>> = [
  MaxElement,
  MinElement,
  PatternElement,
  ValidatorElement,
  AngularValidatorElement,
  EmailElement,
  MaxLengthElement,
  MinLengthElement,
  RequiredElement,
  RequiredTrueElement,
  IsNumberElement,
  IsArrayElement,
  IsBooleanElement,
  IsComplexElement,
  IsDateElement,
  IsEnumElement,
  IsIntElement,
  IsObjectElement,
  IsStringElement,
  IsEmailElement,
  IsPhoneNumberElement,
  IsUrlElement,
  IsIpElement,
];
