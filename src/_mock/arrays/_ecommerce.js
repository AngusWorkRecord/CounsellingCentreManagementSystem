import _mock from '../_mock';

// ----------------------------------------------------------------------

const COUNTRY = ['de', 'en', 'fr', 'kr', 'us'];

const CATEGORY = ['CAP', 'Branded Shoes', 'Headphone', 'Cell Phone', 'Earings'];

const PRODUCT_NAME = [
  'Small Granite Computer',
  'Small Rubber Mouse',
  'Awesome Rubber Hat',
  'Sleek Cotton Sausages',
  'Rustic Wooden Chicken',
];

export const _ecommerceSalesOverview = [...Array(5)].map((_, index) => ({
  id:['1','2','3','4','5'][index],
  label: ['2nd ASEAN Quantity Surveyors Conference 2023', 'International Conference on Biotechnological Advancement in Food Security Smart Farming and Entrepreneurship 2023', 'Sarawak Medico-Legal Bootcamp (SMLB) 2023', 'ORBICOM 2023','Annual Conference of the International Association for Impact Assessment (IAIA) 2023'][index],
  date: ['June 15 - June 16', 'June 13 - June 15', 'June 9 - June 11','June 7 - June 9','May 18 - May 21'][index],
  location: ['Kingwood Hotel Sibu', 'Riverside Majestic Hotel', 'The Waterfront Hotel','Pullman Miri Waterfront Hotel','Borneo Convention Centre Kuching (BCCK)'][index],
  capacity: ['400 capacity', '300 capacity', '500 capacity', '500 capacity', '500 capacity'][index],
  // amount: _mock.number.price(index) * 100,
  value: _mock.number.percent(index),
}));

export const _ecommerceBestSalesman = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.name.fullName(index),
  email: _mock.email(index),
  avatar: _mock.image.avatar(index + 8),
  category: CATEGORY[index],
  flag: `/assets/icons/flags/ic_flag_${COUNTRY[index]}.svg`,
  total: _mock.number.price(index),
  rank: `Top ${index + 1}`,
}));

export const _ecommerceLatestProducts = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: PRODUCT_NAME[index],
  image: _mock.image.product(index),
  price: _mock.number.price(index),
  priceSale: index === 0 || index === 3 ? 0 : _mock.number.price(index),
  colors: (index === 0 && ['#2EC4B6', '#E71D36', '#FF9F1C', '#011627']) ||
    (index === 1 && ['#92140C', '#FFCF99']) ||
    (index === 2 && ['#0CECDD', '#FFF338', '#FF67E7', '#C400FF', '#52006A', '#046582']) ||
    (index === 3 && ['#845EC2', '#E4007C', '#2A1A5E']) || ['#090088'],
}));

export const _ecommerceNewProducts = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: [
    'Nike Air Max 97',
    'Nike Zoom Gravity',
    'Nike DBreak-Type',
    'Kyrie Flytrap 3 EP Basketball Shoe',
    'Nike Air Max Fusion Men',
  ][index],
  image: _mock.image.product(index),
}));
