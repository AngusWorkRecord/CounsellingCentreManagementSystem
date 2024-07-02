import PropTypes from 'prop-types';
import { useState, useRef } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Card, Chip, Stack, Avatar, Rating, Button, CardHeader, Typography } from '@mui/material';
// utils
import { fDateTime } from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import Carousel, { CarouselArrows } from '../../../../components/carousel';
// sections
import {
  AppWidget,
} from '../app';

// ----------------------------------------------------------------------

const performanceCat = [
  { id: 1, title: 'Engagement Rates', data: 48 },
  { id: 2, title: 'Customer Satisfaction', data: 70 },
  { id: 3, title: 'Conversion Rates', data: 80 },
  { id: 4, title: 'Customer Behavior', data: 30 },
];

BookingCustomerReviews.propTypes = {
  list: PropTypes.array,
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function BookingCustomerReviews({ title, subheader, list, ...other }) {
  const theme = useTheme();

  const carouselRef = useRef(null);

  const [selectCustomer, setSelectCustomer] = useState(0);

  const customerInfo = list.find((_, index) => index === selectCustomer);

  const carouselSettings = {
    dots: false,
    arrows: false,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    rtl: Boolean(theme.direction === 'rtl'),
    beforeChange: (current, next) => setSelectCustomer(next),
  };

  const handlePrev = () => {
    carouselRef.current?.slickPrev();
  };

  const handleNext = () => {
    carouselRef.current?.slickNext();
  };

  return (
    <Card {...other} sx={{boxShadow:"none"}}>
      <CardHeader
        title={title}
        subheader={subheader}
        action={<CarouselArrows onNext={handleNext} onPrevious={handlePrev} />}
        sx={{
          '& .MuiCardHeader-action': { alignSelf: 'center' },
        }}
      />

      <Carousel ref={carouselRef} {...carouselSettings}>
        {list.map((item) => (
          <ReviewItem key={item.id} item={item} />
        ))}
      </Carousel>

      {/* <Stack
        spacing={2}
        direction="row"
        alignItems="flex-end"
        sx={{
          p: theme.spacing(0, 3, 3, 3),
        }}
      >
        <Button
          fullWidth
          color="success"
          variant="contained"
          startIcon={<Iconify icon="eva:checkmark-circle-2-fill" />}
          onClick={() => console.log('ACCEPT', customerInfo?.id)}
        >
          Accept
        </Button>

        <Button
          fullWidth
          color="error"
          variant="contained"
          startIcon={<Iconify icon="eva:close-circle-fill" />}
          onClick={() => console.log('REJECT', customerInfo?.id)}
        >
          Reject
        </Button>
      </Stack> */}
    </Card>
  );
}

// ----------------------------------------------------------------------

ReviewItem.propTypes = {
  item: PropTypes.shape({
    tags: PropTypes.array,
    label: PropTypes.string,
    date: PropTypes.string,
    avatar: PropTypes.string,
    rating: PropTypes.number,
    description: PropTypes.string,
    performanceCat: PropTypes.string,
    location: PropTypes.string,
    postedAt: PropTypes.instanceOf(Date),
  }),
};

function ReviewItem({ item }) {
  const { avatar, label, description, rating, postedAt, tags, date, location } = item;

  return (
    <Stack
      spacing={2}
      sx={{
        position: 'relative',
        p: (theme) => theme.spacing(3, 3, 2, 3),
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Avatar alt={label} src={avatar} />

        <div>
          <Typography variant="h5">{label}</Typography>
          <Typography variant="subtitle2">{date}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
            {location}
          </Typography>
        </div>

      </Stack>

      {/* <Rating value={rating} size="small" readOnly precision={0.5} /> */}

      <Typography variant="h5" style={{ display: "flex", justifyContent: "center" }}>Performance</Typography>

      <Typography variant="body2">{description}</Typography>

      <Stack direction="row" alignItems="center" spacing={10}>
        {
          performanceCat && performanceCat.map((x) =>
            (<Typography variant="body2">{x.title}</Typography>)
          )
        }
      </Stack>

      <Stack direction="row" alignItems="center" spacing={16}>
        {
          performanceCat && performanceCat.map((x) =>
            <AppWidget
              // title="Conversion"
              // total={38566}
              icon="eva:person-fill"
              chart={{
                series: x.data,
              }}
            />
          )
        }
      </Stack>

      {/* <Stack direction="row" flexWrap="wrap">
        {tags.map((tag) => (
          <Chip size="small" key={tag} label={tag} sx={{ mr: 1, mb: 1, color: 'text.secondary' }} />
        ))}
      </Stack> */}
    </Stack>
  );
}
