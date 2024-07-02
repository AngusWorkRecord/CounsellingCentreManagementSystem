import _mock from '../_mock';
import { randomInArray } from '../utils';

// ----------------------------------------------------------------------

export const _bookings = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.name.fullName(index),
  avatar: _mock.image.avatar(index),
  checkIn: _mock.time(index),
  checkOut: _mock.time(index),
  phoneNumber: _mock.phoneNumber(index),
  status: randomInArray(['pending', 'un_paid', 'paid']),
  roomType: randomInArray(['double', 'king', 'single']),
}));

export const _bookingsOverview = [...Array(3)].map((_, index) => ({
  status: ['Kuching', 'Miri', 'Sibu'][index],
  quantity: _mock.number.percent(index) * 1000,
  value: _mock.number.percent(index),
}));

export const _bookingsOverview2022 = [...Array(3)].map((_, index) => ({
  status: ['Kuching', 'Miri', 'Sibu'][index],
  quantity: _mock.number.percent(index+3) * 1000,
  value: _mock.number.percent(index+3),
}));

export const _bookingsOverview2023 = [...Array(3)].map((_, index) => ({
  status: ['Kuching', 'Miri', 'Sibu'][index],
  quantity: _mock.number.percent(index) * 1000,
  value: _mock.number.percent(index),
}));

export const _bookingReview = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.name.fullName(index),
  subtitle: _mock.name.fullName(index),
  description: _mock.text.description(index),
  avatar: _mock.image.avatar(index),
  rating: _mock.number.rating(index),
  postedAt: _mock.time(index),
  tags: ['Great Sevice', 'Recommended', 'Best Price'],
}));

export const _bookingNew = [...Array(5)].map((_, index) => ({
  id: _mock.id(index),
  name: _mock.name.fullName(index),
  avatar: _mock.image.avatar(index),
  bookdAt: _mock.time(index),
  roomNumber: 'A-21',
  roomType: randomInArray(['double', 'king', 'single']),
  person: '3-5',
  cover: `/assets/images/rooms/room_${index + 1}.jpg`,
}));

export const _customMapData = [...Array(3)].map((_, index) => ({
  label: ['Sarawak Nursing Conference 2023', 'International Conference on Waqf and Endowment', 'Gardenscapes Sarawak 2023'][index],
  date: ['May 10 - May 11', 'May 16 - May 17', 'May 24 - May 26'][index],
  location: ['Kingwood Hotel Sibu', 'Detra Putra UNIMAS', 'Imperial Hotel Kuching'][index],
  capacity: ['400 capacity', '300 capacity', '500 capacity'][index],
  avatar: _mock.image.avatar(index),
  // description: _mock.text.description(index),
  // amount: _mock.number.price(index) * 100,
  // value: _mock.number.percent(index),
}));