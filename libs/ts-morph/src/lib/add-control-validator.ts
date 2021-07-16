import { ArrayLiteralExpression, ObjectLiteralExpression, PropertyAssignment } from 'ts-morph';

export function AddControlValidator(
  validator: string,
  controlOptions: ObjectLiteralExpression
) {

  let validatorPropertyAssignment = controlOptions.getProperty('validators');

  if (!validatorPropertyAssignment) {
    validatorPropertyAssignment = controlOptions.addPropertyAssignment({
      name: 'validators',
      initializer: '[]'
    });
  }

  if (!(validatorPropertyAssignment instanceof PropertyAssignment)) {
    throw new Error('The validator property is not a assignment type!');
  }

  const validatorProperty = validatorPropertyAssignment.getInitializer();

  if (validatorProperty instanceof ArrayLiteralExpression) {
    const index = validatorProperty
      .getElements()
      .findIndex(element => element.getFullText().trim().replace(/[\r\n\t]/g, '') === validator.trim().replace(/[\r\n\t]/g, ''));
    if (index === -1) {
      validatorProperty.addElement(validator);
    } else {
      validatorProperty.removeElement(index);
      validatorProperty.insertElement(index, validator);
    }
  }

}
