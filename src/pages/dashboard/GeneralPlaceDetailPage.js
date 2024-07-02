import orderBy from 'lodash/orderBy';
import { Helmet } from 'react-helmet-async';
import { Link as RouterLink, useNavigate, useParams } from 'react-router-dom';
import { useEffect, useCallback, useState } from 'react';
// @mui
import { Grid, Button, Container, Stack, Card, Typography, CardContent } from '@mui/material';
// utils
import axios from '../../utils/axios';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// components
import Iconify from '../../components/iconify';
import { SkeletonPostItem } from '../../components/skeleton';
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
// sections
import PerformanceChart from '../../sections/@dashboard/general/booking/PerformanceChart';
import upIcon from '../../sections/@dashboard/general/booking/images/up_black.png';
import upRightIcon from '../../sections/@dashboard/general/booking/images/upRight.png';
import rightIcon from '../../sections/@dashboard/general/booking/images/right.png';

// ----------------------------------------------------------------------

const chartData = [
  {
    placeID: 1, placeName: "Kuching",
    performanceIndicator: [
      { label: "Destination Awareness", value: 44, symbol: upIcon },
      { label: "Government Commitment", value: 41, symbol: upIcon },
      { label: "Sarawak Business Event(BE) Brand", value: 60, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Inter-organizational Collaboration", value: 55, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Service Quality and Standards", value: 57, symbol: upIcon },
      { label: "Business Events(BE) Sector Advancement", value: 83, symbol: upIcon },
      { label: "Organization and HR Development", value: 100, symbol: upIcon },
      { label: "Social Legacy", value: 77, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Environment Conservation", value: 90, symbol: upIcon },
      { label: "Community Buy-in", value: 61, symbol: upIcon },
    ],
    oldPerformanceIndicator: [
      { label: "Destination Awareness", value: 40 },
      { label: "Government Commitment", value: 40 },
      { label: "Sarawak Business Event(BE) Brand", value: 50 },
      { label: "Inter-organizational Collaboration", value: 65},
      { label: "Service Quality and Standards", value: 55 },
      { label: "Business Events(BE) Sector Advancement", value: 80},
      { label: "Organization and HR Development", value: 95 },
      { label: "Social Legacy", value: 80 },
      { label: "Environment Conservation", value: 87 },
      { label: "Community Buy-in", value: 55},
    ]
  },
  {
    placeID: 2, placeName: "Sibu",
    performanceIndicator: [
      { label: "Destination Awareness", value: 66, symbol: upIcon },
      { label: "Government Commitment", value: 44, symbol: upIcon },
      { label: "Sarawak Business Event(BE) Brand", value: 75, symbol: upIcon },
      { label: "Inter-organizational Collaboration", value: 90, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Service Quality and Standards", value: 64, symbol: upIcon },
      { label: "Business Events(BE) Sector Advancement", value: 88, symbol: upIcon },
      { label: "Organization and HR Development", value: 56, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Social Legacy", value: 86, symbol: upIcon },
      { label: "Environment Conservation", value: 43, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Community Buy-in", value: 95, symbol: upIcon },
    ],
    oldPerformanceIndicator: [
      { label: "Destination Awareness", value: 58 },
      { label: "Government Commitment", value: 42 },
      { label: "Sarawak Business Event(BE) Brand", value: 50 },
      { label: "Inter-organizational Collaboration", value: 93},
      { label: "Service Quality and Standards", value: 60 },
      { label: "Business Events(BE) Sector Advancement", value: 80},
      { label: "Organization and HR Development", value: 68 },
      { label: "Social Legacy", value: 80 },
      { label: "Environment Conservation", value: 87 },
      { label: "Community Buy-in", value: 87},
    ]
  },
  {
    placeID: 3, placeName: "Miri",
    performanceIndicator: [
      { label: "Destination Awareness", value: 64, symbol: upIcon },
      { label: "Government Commitment", value: 87, symbol: upIcon },
      { label: "Sarawak Business Event(BE) Brand", value: 69, symbol: upIcon },
      { label: "Inter-organizational Collaboration", value: 64, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Service Quality and Standards", value: 97, symbol: upIcon },
      { label: "Business Events(BE) Sector Advancement", value: 88, symbol: upIcon },
      { label: "Organization and HR Development", value: 86, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
      { label: "Social Legacy", value: 65, symbol: upIcon },
      { label: "Environment Conservation", value: 87, symbol: upIcon },
      { label: "Community Buy-in", value: 55, symbol: 'https://img.icons8.com/ios-glyphs/30/null/down--v1.png' },
    ],
    oldPerformanceIndicator: [
      { label: "Destination Awareness", value: 60 },
      { label: "Government Commitment", value: 80 },
      { label: "Sarawak Business Event(BE) Brand", value: 50 },
      { label: "Inter-organizational Collaboration", value: 80},
      { label: "Service Quality and Standards", value: 85 },
      { label: "Business Events(BE) Sector Advancement", value: 80},
      { label: "Organization and HR Development", value: 95 },
      { label: "Social Legacy", value: 60 },
      { label: "Environment Conservation", value: 87 },
      { label: "Community Buy-in", value: 60},
    ]
  },
]

export default function GeneralPlaceDetailPage() {
  const { themeStretch } = useSettingsContext();

  const { selectedPlaceID } = useParams();

  const currentPlaceID = chartData.find((place) => place.placeID === Number(selectedPlaceID));

  const navigate = useNavigate();

  const [series, setSeries] = useState([]);

  return (
    <>
      <Helmet>
        <title> Performance </title>
      </Helmet>

      <Container maxWidth={themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Performance"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: `Performance - ${currentPlaceID?.placeName}`,
            },
          ]}
        />

        <Grid >
          <PerformanceChart
            title="Performance based on Area"
            chart={{
              series: currentPlaceID?.performanceIndicator,
              oldSeries: currentPlaceID?.oldPerformanceIndicator,
              categories: ['Destination Awareness', 'Government Commitment', 'Sarawak Business Event(BE) Brand', 'Inter-organizational Collaboration', 'Service Quality and Standards',
                'Business Events(BE) Sector Advancement', 'Organization and HR Development', 'Social Legacy', 'Environment Conservation', 'Community Buy-in'
              ],
            }}
          />
        </Grid>
      </Container>
    </>
  );
}
