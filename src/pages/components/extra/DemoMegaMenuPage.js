import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Card, Stack, Container, AppBar, Typography } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
import { NAV } from '../../../config-global';
// _mock
import _mock from '../../../_mock';
// components
import Image from '../../../components/image';
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
import {
  MegaMenuMobile,
  MegaMenuDesktopHorizon,
  MegaMenuDesktopVertical,
} from '../../../components/mega-menu';

// ----------------------------------------------------------------------

export default function DemoMegaMenuPage() {
  useUiLanguage();
  return (
    <>
      <Helmet>
        <title> {tr("Extra Components: Mega Menu | Counselling Centre Management System")}</title>
      </Helmet>

      <Box
        sx={{
          pt: 6,
          pb: 1,
          bgcolor: (theme) => (theme.palette.mode === 'light' ? 'grey.200' : 'grey.800'),
        }}
      >
        <Container>
          <CustomBreadcrumbs
            heading={tr("Mega Menu")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Mega Menu") },
            ]}
          />
        </Container>
      </Box>

      <AppBar
        position="static"
        color="transparent"
        sx={{
          boxShadow: (theme) => theme.customShadows.z8,
        }}
      >
        <Container sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>{tr("Menu Horizon")}</Typography>

          <MegaMenuDesktopHorizon data={data} />
        </Container>
      </AppBar>

      <Container sx={{ my: 10 }}>
        <MegaMenuMobile data={data} />

        <Stack direction="row" spacing={3} mt={5}>
          <Card sx={{ width: NAV.W_BASE, flexShrink: 0, overflow: 'unset', zIndex: 9 }}>
            <Typography variant="h6" sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
              <Iconify icon="eva:list-fill" width={24} sx={{ mr: 1 }} />{tr("Menu Vertical")}</Typography>

            <MegaMenuDesktopVertical data={data} />
          </Card>

          <Image
            alt={tr("any photo")}
            src={_mock.image.cover(18)}
            ratio="21/9"
            sx={{ borderRadius: 1 }}
          />
        </Stack>
      </Container>
    </>
  );
}

// MOCK DATA
// ----------------------------------------------------------------------

export const _products = [...Array(10)].map((_, index) => ({
  name: _mock.text.title(index),
  image: _mock.image.cover(index),
  path: '#',
}));

const ICON_SIZE = {
  width: '100%',
  height: '100%',
};

const TAGS = [
  { name: 'Paper Cup', path: '#' },
  { name: 'Lotion Pump', path: '#' },
  { name: 'Brush Cutter', path: '#' },
  { name: 'Display Rack', path: '#' },
  { name: 'Glass Bottle', path: '#' },
];

const data = [
  {
    get title() { return tr("Parent 1"); },
    path: '#',
    icon: <Iconify icon="eva:file-fill" {...ICON_SIZE} />,
    more: { get title() { return tr("More Categories"); }, path: '#' },
    products: _products,
    tags: TAGS,
    children: [
      {
        get subheader() { return tr("Agriculture Machinery"); },
        items: [
          { get title() { return tr("Agriculture Machinery"); }, path: '#' },
          { get title() { return tr("Livestock MachineryFeed"); }, path: '#' },
          { get title() { return tr("Feed Processing Machinery"); }, path: '#' },
          { get title() { return tr("Tiller"); }, path: '#' },
          { get title() { return tr("Harvesting Machine"); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Machine Tools"); },
        items: [
          { get title() { return tr("CNC Machine Tools"); }, path: '#' },
          { get title() { return tr("Lathe"); }, path: '#' },
          { get title() { return tr("Grinding Machine "); }, path: '#' },
          { get title() { return tr("Drilling Machine "); }, path: '#' },
          { get title() { return tr("Milling Machine "); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Other Machinery & Parts"); },
        items: [
          { get title() { return tr("Metallic Processing Machinery"); }, path: '#' },
          { get title() { return tr("Machinery for Food, Beverage & Cereal"); }, path: '#' },
          { get title() { return tr("Laser Equipment"); }, path: '#' },
          { get title() { return tr("Mould"); }, path: '#' },
          { get title() { return tr("Textile Machinery & Parts"); }, path: '#' },
          { get title() { return tr("Cutting & Fold-bend Machine"); }, path: '#' },
          { get title() { return tr("Paper Machinery"); }, path: '#' },
          { get title() { return tr("Rubber Machinery"); }, path: '#' },
          { get title() { return tr("Chemical Equipment & Machinery"); }, path: '#' },
          { get title() { return tr("Mixing Equipment"); }, path: '#' },
          { get title() { return tr("Machinery for Garment, Shoes & Accessories"); }, path: '#' },
          { get title() { return tr("Crushing & Culling Machine"); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Plastic & Woodworking Machinery"); },
        items: [
          { get title() { return tr("Plastic Machinery"); }, path: '#' },
          { get title() { return tr("Woodworking Machinery"); }, path: '#' },
          { get title() { return tr("Blow Molding Machine"); }, path: '#' },
          { get title() { return tr("Plastic Recycling Machine"); }, path: '#' },
          { get title() { return tr("Injection Molding Machine"); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Construction Machinery"); },
        items: [
          { get title() { return tr("Building Material Making Machinery"); }, path: '#' },
          { get title() { return tr("Lifting Equipment"); }, path: '#' },
          { get title() { return tr("Excavator"); }, path: '#' },
          { get title() { return tr("Concrete Machinery"); }, path: '#' },
          { get title() { return tr("Stone Processing Machinery"); }, path: '#' },
        ],
      },
    ],
  },
  {
    get title() { return tr("Parent 2"); },
    path: '#',
    icon: <Iconify icon="eva:file-fill" {...ICON_SIZE} />,
    more: { get title() { return tr("More Categories"); }, path: '#' },
    products: _products,
    tags: TAGS,
    children: [
      {
        get subheader() { return tr("Cellphone & Accessories"); },
        items: [
          { get title() { return tr("Mobile Phone Charger"); }, path: '#' },
          { get title() { return tr("Power Bank"); }, path: '#' },
          { get title() { return tr("Mobile Phone LCD"); }, path: '#' },
          { get title() { return tr("Bluetooth Headset"); }, path: '#' },
          { get title() { return tr("Mobile Phone"); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Audio & Video"); },
        items: [
          { get title() { return tr("Display & Accessories"); }, path: '#' },
          { get title() { return tr("Audio & Sets"); }, path: '#' },
          { get title() { return tr("Professional Audio"); }, path: '#' },
          { get title() { return tr("LCD Display"); }, path: '#' },
          { get title() { return tr("LCD Module"); }, path: '#' },
          { get title() { return tr("Video"); }, path: '#' },
          { get title() { return tr("TV & Parts"); }, path: '#' },
          { get title() { return tr("Amplifier"); }, path: '#' },
          { get title() { return tr("Portable Audio Appliance"); }, path: '#' },
          { get title() { return tr("Home Theatre System"); }, path: '#' },
          { get title() { return tr("HDMI Cable"); }, path: '#' },
          { get title() { return tr("Radio"); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Household Appliances"); },
        items: [
          { get title() { return tr("Air Conditioner, Purifier & Humidifier"); }, path: '#' },
          { get title() { return tr("Refrigerator, Freezer & Parts"); }, path: '#' },
          { get title() { return tr("Water Heater & Components"); }, path: '#' },
          { get title() { return tr("Electrical Fan & Exhaust Fan"); }, path: '#' },
          { get title() { return tr("Household Water Treatment Equipment"); }, path: '#' },
          { get title() { return tr("Solar Water Heater"); }, path: '#' },
          { get title() { return tr("Photographic Apparatus"); }, path: '#' },
          { get title() { return tr("Gas Burner & Gas Stove"); }, path: '#' },
          { get title() { return tr("Entertainment Electronics"); }, path: '#' },
          { get title() { return tr("Electrical Kettle"); }, path: '#' },
          { get title() { return tr("Food Blender"); }, path: '#' },
          { get title() { return tr("Dehumidifier"); }, path: '#' },
        ],
      },
      {
        get subheader() { return tr("Digital Devices"); },
        items: [
          { get title() { return tr("Battery & Charger"); }, path: '#' },
          { get title() { return tr("Wearable Devices"); }, path: '#' },
          { get title() { return tr("Digital Photo Frame"); }, path: '#' },
          { get title() { return tr("Digital Camera"); }, path: '#' },
          { get title() { return tr("Smart Glasses"); }, path: '#' },
        ],
      },
    ],
  },
  {
    get title() { return tr("Parent 3"); },
    path: '#',
    icon: <Iconify icon="eva:file-fill" {...ICON_SIZE} />,
  },
  {
    get title() { return tr("Parent 4"); },
    path: '#',
    icon: <Iconify icon="eva:file-fill" {...ICON_SIZE} />,
  },
];
