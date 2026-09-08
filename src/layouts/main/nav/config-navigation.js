import { tr } from '../../../locales/translate';
// routes
import { PATH_AUTH, PATH_DOCS, PATH_PAGE } from '../../../routes/paths';
// config
import { PATH_AFTER_LOGIN } from '../../../config-global';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const navConfig = [
  {
    get title() { return tr("Home"); },
    icon: <Iconify icon="eva:home-fill" />,
    path: '/',
  },
  {
    get title() { return tr("Components"); },
    icon: <Iconify icon="ic:round-grain" />,
    path: PATH_PAGE.components,
  },
  {
    get title() { return tr("Pages"); },
    path: '/pages',
    icon: <Iconify icon="eva:file-fill" />,
    children: [
      {
        get subheader() { return tr("Other"); },
        items: [
          { get title() { return tr("About us"); }, path: PATH_PAGE.about },
          { get title() { return tr("Contact us"); }, path: PATH_PAGE.contact },
          { get title() { return tr("FAQs"); }, path: PATH_PAGE.faqs },
          { get title() { return tr("Pricing"); }, path: PATH_PAGE.pricing },
          { get title() { return tr("Payment"); }, path: PATH_PAGE.payment },
          { get title() { return tr("Maintenance"); }, path: PATH_PAGE.maintenance },
          { get title() { return tr("Coming Soon"); }, path: PATH_PAGE.comingSoon },
        ],
      },
      {
        get subheader() { return tr("Authentication"); },
        items: [
          { get title() { return tr("Login"); }, path: PATH_AUTH.loginUnprotected },
          { get title() { return tr("Register"); }, path: PATH_AUTH.registerUnprotected },
          { get title() { return tr("Reset password"); }, path: PATH_AUTH.resetPassword },
          { get title() { return tr("Verify code"); }, path: PATH_AUTH.verify },
        ],
      },
      {
        get subheader() { return tr("Error"); },
        items: [
          { get title() { return tr("Page 403"); }, path: PATH_PAGE.page403 },
          { get title() { return tr("Page 404"); }, path: PATH_PAGE.page404 },
          { get title() { return tr("Page 500"); }, path: PATH_PAGE.page500 },
        ],
      },
      {
        get subheader() { return tr("Dashboard"); },
        items: [{ get title() { return tr("Dashboard"); }, path: PATH_AFTER_LOGIN }],
      },
    ],
  },
  {
    get title() { return tr("Documentation"); },
    icon: <Iconify icon="eva:book-open-fill" />,
    path: PATH_DOCS.root,
  },
];

export default navConfig;
