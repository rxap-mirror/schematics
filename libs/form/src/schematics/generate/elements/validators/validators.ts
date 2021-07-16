import { MaxElement } from './max.element';
import { MinElement } from './min.element';
import { PatternElement } from './pattern.element';
import { ValidatorElement } from './validator.element';
import { AngularValidatorElement } from './angular-validator.element';
import { ParsedElement } from '@rxap/xml-parser';
import { Constructor } from '@rxap/utilities';
import { EmailElement } from './email.element';
import { MinLengthElement } from './min-length.element';
import { MaxLengthElement } from './max-length.element';
import { RequiredElement } from './required.element';
import { RequiredTrueElement } from './required-true.element';
import { IsNumberElement } from './is-number.element';
import { IsArrayElement } from './is-array.element';
import { IsBooleanElement } from './is-boolean.element';
import { IsComplexElement } from './is-complex.element';
import { IsDateElement } from './is-date.element';
import { IsEnumElement } from './is-enum.element';
import { IsIntElement } from './is-int.element';
import { IsObjectElement } from './is-object.element';
import { IsStringElement } from './is-string.element';
import { IsEmailElement } from './is-email.element';
import { IsPhoneNumberElement } from './is-phone-number.element';
import { IsUrlElement } from './is-url.element';

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
];
