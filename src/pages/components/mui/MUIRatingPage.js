import PropTypes from 'prop-types';
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
// @mui
import { Box, Rating, Container } from '@mui/material';
import { Masonry } from '@mui/lab';
import { tr, useUiLanguage } from '../../../locales/translate';
// routes
import { PATH_PAGE } from '../../../routes/paths';
// components
import Iconify from '../../../components/iconify';
import CustomBreadcrumbs from '../../../components/custom-breadcrumbs';
// sections
import { Block } from '../../../sections/_examples/Block';

// ----------------------------------------------------------------------

const labels = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

const customIcons = {
  1: {
    icon: <Iconify icon="ic:round-sentiment-very-dissatisfied" />,
    get label() { return tr("Very Dissatisfied"); },
  },
  2: {
    icon: <Iconify icon="ic:round-sentiment-dissatisfied" />,
    get label() { return tr("Dissatisfied"); },
  },
  3: {
    icon: <Iconify icon="ic:round-sentiment-neutral" />,
    get label() { return tr("Neutral"); },
  },
  4: {
    icon: <Iconify icon="ic:round-sentiment-satisfied" />,
    get label() { return tr("Satisfied"); },
  },
  5: {
    icon: <Iconify icon="ic:round-sentiment-very-satisfied" />,
    get label() { return tr("Very Satisfied"); },
  },
};

const style = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { mx: '8px !important' },
};

// ----------------------------------------------------------------------

export default function MUIRatingPage() {
  useUiLanguage();
  const [value, setValue] = useState(2);

  const [hover, setHover] = useState(-1);

  return (
    <>
      <Helmet>
        <title> {tr("MUI Components: Rating | Counselling Centre Management System")}</title>
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
            heading={tr("Rating")}
            links={[
              {
                name: tr("Components"),
                href: PATH_PAGE.components,
              },
              { name: tr("Rating") },
            ]}
            moreLink={['https://mui.com/components/rating']}
          />
        </Container>
      </Box>

      <Container sx={{ my: 10 }}>
        <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={3}>
          <Block title={tr("Controlled")} sx={style}>
            <Rating
              name="simple-controlled"
              value={value}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
            />
          </Block>

          <Block title={tr("Read only")} sx={style}>
            <Rating name="read-only" value={value} readOnly />
          </Block>

          <Block title={tr("Disabled")} sx={style}>
            <Rating name="disabled" value={value} disabled />
          </Block>

          <Block title={tr("Pristine")} sx={style}>
            <Rating name="pristine" value={null} />
          </Block>

          <Block title={tr("Custom empty icon")} sx={style}>
            <Rating name="customized-empty" defaultValue={2} precision={0.5} />
          </Block>

          <Block title={tr("Custom icon and color")} sx={style}>
            <Rating
              name="customized-color"
              defaultValue={2}
              getLabelText={(ratingValue) => `${ratingValue} Heart${ratingValue !== 1 ? 's' : ''}`}
              precision={0.5}
              icon={<Iconify icon="eva:heart-fill" />}
              emptyIcon={<Iconify icon="eva:heart-fill" />}
              sx={{
                color: 'info.main',
                '&:hover': { color: 'info.dark' },
              }}
            />
          </Block>

          <Block title={tr("10 stars")} sx={style}>
            <Rating name="customized-10" defaultValue={2} max={10} />
          </Block>
          <Block title={tr("Custom icon set")} sx={style}>
            <Rating
              name="customized-icons"
              defaultValue={2}
              getLabelText={(ratingValue) => customIcons[ratingValue].label}
              IconContainerComponent={IconContainer}
            />
          </Block>
          <Block title={tr("Hover feedback")} sx={style}>
            <Rating
              name="hover-feedback"
              value={value}
              precision={0.5}
              onChange={(event, newValue) => {
                setValue(newValue);
              }}
              onChangeActive={(event, newHover) => {
                setHover(newHover);
              }}
            />
            {value !== null && <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>}
          </Block>

          <Block title={tr("Half ratings")} sx={style}>
            <Rating name="half-rating" defaultValue={2.5} precision={0.5} />
            <br />
            <Rating name="half-rating-read" defaultValue={2.5} precision={0.5} readOnly />
          </Block>

          <Block title={tr("Sizes")} sx={style}>
            <Rating name="size-small" defaultValue={2} size="small" />
            <br />
            <Rating name="size-medium" defaultValue={2} />
            <br />
            <Rating name="size-large" defaultValue={2} size="large" />
          </Block>
        </Masonry>
      </Container>
    </>
  );
}

// ----------------------------------------------------------------------

IconContainer.propTypes = {
  value: PropTypes.number,
};

function IconContainer(props) {
  useUiLanguage();
  const { value, ...other } = props;

  return <span {...other}>{customIcons[value].icon}</span>;
}
