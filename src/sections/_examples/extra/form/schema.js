import * as Yup from 'yup';
import { tr } from '../../../../locales/translate';

// ----------------------------------------------------------------------

export const FormSchema = Yup.object().shape({
  fullName: Yup.string()
    .required(() => tr("Full name is required"))
    .min(6, () => tr("Mininum 6 characters"))
    .max(32, () => tr("Maximum 32 characters")),
  email: Yup.string().required(() => tr("Email is required")).email(() => tr("Email must be a valid email address")),
  age: Yup.number()
    .required(() => tr("Age is required"))
    .moreThan(18, 'Age must be between 18 and 100')
    .lessThan(100, 'Age must be between 18 and 100'),
  //
  startDate: Yup.date().nullable().required(() => tr("Start date is required")),
  endDate: Yup.date()
    .required(() => tr("End date is required"))
    .nullable()
    .min(Yup.ref('startDate'), () => tr("End date must be later than start date")),
  //
  password: Yup.string()
    .required(() => tr("Password is required"))
    .min(6, () => tr("Password should be of minimum 6 characters length")),
  confirmPassword: Yup.string()
    .required(() => tr("Confirm password is required"))
    .oneOf([Yup.ref('password')], () => tr("Password's not match")),
  //
  slider: Yup.number().required(() => tr("Slider is required")).min(10, () => tr("Mininum value is >= 10")),
  sliderRange: Yup.mixed()
    .required(() => tr("Slider range is is required"))
    .test('min', () => tr("Range must be between 20 and 80"), (value) => value[0] >= 20)
    .test('max', () => tr("Range must be between 20 and 80"), (value) => value[1] <= 80),
  //
  singleUpload: Yup.mixed().required(() => tr("Single upload is required")).nullable(true),
  multiUpload: Yup.array().min(2, () => tr("Must have at least 2 items")),
  //
  checkbox: Yup.boolean().oneOf([true], () => tr("Checkbox is required")),
  multiCheckbox: Yup.array().min(1, () => tr("Choose at least one option")),
  //
  singleSelect: Yup.string().required(() => tr("Single select is required")),
  multiSelect: Yup.array().min(2, () => tr("Must have at least 2 items")),
  //
  switch: Yup.boolean().oneOf([true], () => tr("Switch is required")),
  radioGroup: Yup.string().required(() => tr("Choose at least one option")),
  editor: Yup.string().required(() => tr("Editor is required")),
  autocomplete: Yup.mixed().required(() => tr("Autocomplete is required")).nullable(true),
});
