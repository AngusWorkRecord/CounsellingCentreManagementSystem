import { Helmet } from 'react-helmet-async';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Stack, Card, CardHeader, CardContent } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// services
import { getCounsellingSessions } from '../../services/counsellingSessionService';
// _mock_
import { _bookings, _bookingNew, _bookingsOverview, _bookingReview, _ecommerceSalesOverview, _customMapData } from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
// sections
import {
  BookingDetails,
  BookingBookedRoom,
  BookingTotalIncomes,
  BookingRoomAvailable,
  BookingNewestBooking,
  BookingWidgetSummary,
  BookingCheckInWidgets,
  BookingCustomerReviews,
  BookingReservationStats,
} from '../../sections/@dashboard/general/booking';
import {
  AppAreaInstalled,
} from '../../sections/@dashboard/general/app';
import {
  EcommerceYearlySales,
  EcommerceSalesOverview,
} from '../../sections/@dashboard/general/e-commerce';
// assets
import {
  BookingIllustration,
  CheckInIllustration,
  CheckOutIllustration,
} from '../../assets/illustrations';
import CalendarPage from './CalendarPage';
import MainMap from '../../sections/@dashboard/general/booking/MainMap';
import ScoringDetailsDrawer from '../../sections/@dashboard/general/booking/ScoringDetailsDrawer';
import { SkeletonPostItem } from '../../components/skeleton';
import { SarawakMap } from '../../sections/@dashboard/general/booking/SarawakMap';
import upIcon from '../../sections/@dashboard/general/booking/images/up.png';
import upRightIcon from '../../sections/@dashboard/general/booking/images/upRight.png';
import rightIcon from '../../sections/@dashboard/general/booking/images/right.png';

// ----------------------------------------------------------------------

const CardDetails = [
  { title: "40.6%", desc: "Total Score", icon: "https://img.icons8.com/ios/100/null/test-failed.png", alt: "hotel" },
  { title: "#67", desc: "Overall Rank", icon: "https://img.icons8.com/external-xnimrodx-lineal-xnimrodx/64/null/external-rank-seo-xnimrodx-lineal-xnimrodx.png", alt: 'overall' },
  { title: "#21", desc: "Country Rank", icon: "https://img.icons8.com/external-xnimrodx-lineal-xnimrodx/64/null/external-rank-seo-xnimrodx-lineal-xnimrodx.png", alt: 'country' },
  { title: "#2", desc: "Region Rank", icon: "https://img.icons8.com/external-xnimrodx-lineal-xnimrodx/64/null/external-rank-seo-xnimrodx-lineal-xnimrodx.png", alt: 'region' },
];

const goalsView = [
  { id: 1, title: 'Destination Awareness', icon: "https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/null/external-brand-awareness-traditional-marketing-flaticons-lineal-color-flat-icons.png", symbol: upIcon, color: "#f57c00" },
  { id: 2, title: 'Government Commitment', icon: "https://img.icons8.com/external-fauzidea-detailed-outline-fauzidea/64/null/external-government-building-fauzidea-detailed-outline-fauzidea.png", symbol: rightIcon, color: "#d32f2f" },
  { id: 3, title: 'Sarawak Business Event(BE) Brand', icon: "https://img.icons8.com/external-vectorslab-outline-color-vectorslab/53/null/external-feedback-shopping-and-ecommerce-vectorslab-outline-color-vectorslab.png", symbol: upRightIcon, color: "#d32f2f" },
  { id: 4, title: 'Inter-organizational Collaboration', icon: "https://img.icons8.com/external-xnimrodx-lineal-gradient-xnimrodx/64/null/external-setting-advertising-xnimrodx-lineal-gradient-xnimrodx-2.png", symbol: upRightIcon, color: "#fcc30b" },
  { id: 5, title: 'Service Quality and Standards', icon: "https://img.icons8.com/external-filled-outline-geotatah/64/null/external-customer-customer-satisfaction-filled-outline-filled-outline-geotatah-2.png", symbol: upRightIcon, color: "#d32f2f" },
  { id: 6, title: 'Business Events(BE) Sector Advancement', icon: "https://img.icons8.com/external-icongeek26-outline-gradient-icongeek26/64/null/external-analytic-bitcoin-icongeek26-outline-gradient-icongeek26.png", symbol: rightIcon, color: "#f57c00" },
  { id: 7, title: 'Organization and HR Development', icon: "https://img.icons8.com/external-filled-outline-geotatah/64/null/external-champion-managerial-psychology-color-filled-outline-geotatah.png", symbol: upRightIcon, color: "#d32f2f" },
  { id: 8, title: 'Social Legacy', icon: "https://img.icons8.com/external-smashingstocks-detailed-outline-smashing-stocks/66/null/external-social-banking-and-finance-smashingstocks-detailed-outline-smashing-stocks.png", symbol: upIcon, color: "#f57c00" },
  { id: 9, title: 'Environment Conservation', icon: "https://img.icons8.com/external-bearicons-flat-bearicons/64/null/external-Lightbulb-happiness-bearicons-flat-bearicons.png", symbol: upRightIcon, color: "#fcc30b" },
  { id: 10, title: 'Community Buy-in', icon: "https://img.icons8.com/external-flat-geotatah/64/null/external-community-work-life-balance-flat-flat-geotatah.png", symbol: rightIcon, color: "#d32f2f" },
]

export default function GeneralBookingPage() {
  const theme = useTheme();

  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();

  const [openDetails, setOpenDetails] = useState(false);
  const [selectedDetails, setselectedDetails] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCounsellingSessions() {
      try {
        const sessions = await getCounsellingSessions({ signal: controller.signal });
        console.log('Counselling Sessions:', sessions);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to load counselling sessions:', error);
        }
      }
    }

    loadCounsellingSessions();

    return () => controller.abort();
  }, []);

  const handleOpenDetails = (detailsID) => {
    setOpenDetails(true);
    setselectedDetails(detailsID);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleGoalsClick = (selectedID) => {
    console.log(selectedID)
    navigate(PATH_DASHBOARD.general.list(selectedID));
  }

  return (
    <>
      <Helmet>
        <title> Counselling | Dashboard </title>
      </Helmet>

      <Container maxWidth={false}>
        <Grid container spacing={3}>
          {/* <Grid item xs={12} md={3}>
            <BookingWidgetSummary
              title="3020 Hotels"
              desc="Total Assets"
              icon={<img src="https://img.icons8.com/fluency/96/null/5-star-hotel.png" alt='hotel' width="95%" height="95%" />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <BookingWidgetSummary
              title="Sarawak Nursing Conferences 2023 (Active)"
              desc="March 10 - March 11 (Kingwood Hotels)"
              icon={<img src="https://img.icons8.com/ios/100/null/conference-call--v1.png" alt='participants' width="95%" height="95%" />} />
          </Grid>

          <Grid item xs={12} md={3}>
            <BookingWidgetSummary
              title="311 @ 1k"
              desc="Total Transport @ Total Capacity"
              icon={<img src="https://img.icons8.com/ios/100/null/ground-transportation.png" alt='transport' width="95%" height="95%" />}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <BookingWidgetSummary
              title="58"
              desc="Total Conference Room"
              icon={<img src="https://img.icons8.com/ios/100/null/zoom.png" alt='conferences' width="95%" height="95%" />}
            />
          </Grid> */}

          {/* {
            CardDetails && CardDetails.map((x) =>
              <Grid item xs={12} md={3} >
                <BookingWidgetSummary
                  desc={x.desc}
                  title={x.title}
                  icon={<img src={x.icon} alt={x.alt} width="95%" height="95%" />}
                />
              </Grid>
            )
          } */}

          <Grid item xs={12} md={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={5}>
                <BookingTotalIncomes
                  total={89}
                  percent={2.6}
                  chart={{
                    series: [111, 136, 76, 108, 74, 54, 57, 84],
                  }}
                />
              </Grid>

              <Grid item xs={12} md={2}>
                <BookingBookedRoom title="Legacy Impact Performance" subheader={2023} data={_bookingsOverview} />
              </Grid>

              <Grid item xs={12} md={2}>
                <BookingCheckInWidgets
                  chart={{
                    colors: [theme.palette.warning.main],
                    series: [
                      { label: 'Foreign delegates', percent: 64.20, total: 38566 },
                      { label: 'Local delegates', percent: 35.80, total: 21509 },
                    ],
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <BookingRoomAvailable
                  title="Overall Legacy Impact Score"
                  chart={{
                    series: [
                      { label: 'Archieved Score', value: 120 },
                      { label: ' ', value: 66 },
                    ],
                  }}
                />
              </Grid>
            </Grid>
          </Grid>



          {/* <Grid item xs={12} md={6}>
            <BookingReservationStats
              title="Total Events per Category"
              // subheader="(+43% Check In | +12% Check Out) than last year"
              chart={{
                categories: ['Entertainement', 'Gallery', 'Tourism', 'Social'],
                series: [
                  {
                    type: 'Week',
                    data: [
                      { name: 'Total Events', data: [62, 69, 91, 48] },
                      // { name: 'Check Out', data: [10, 34, 13, 56, 77, 88, 99, 77, 45] },
                    ],
                  },
                  {
                    type: 'Month',
                    data: [
                      { name: 'Total Events', data: [51, 35, 41, 10] },
                      // { name: 'Check Out', data: [45, 77, 99, 88, 77, 56, 13, 34, 10] },
                    ],
                  },
                  {
                    type: 'Year',
                    data: [
                      { name: 'Total Events', data: [76, 42, 29, 41,] },
                      // { name: 'Check Out', data: [80, 55, 34, 114, 80, 130, 15, 28, 55] },
                    ],
                  },
                ],
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <AppAreaInstalled
              title="Rank Movement by Category"
              // subheader="(+43%) than last year"
              chart={{
                categories: ['Entertainment', 'Gallery', 'Tourism', 'Social'],
                series: [
                  {
                    year: '2019',
                    data: [
                      { name: 'Kuching', data: [60, 60, 44, 70,] },
                      { name: 'Miri', data: [56, 77, 88, 99,] },
                      { name: 'Bintulu', data: [45, 77, 99, 88,] },
                    ],
                  },
                  {
                    year: '2020',
                    data: [
                      { name: 'Kuching', data: [148, 91, 69, 62,] },
                      { name: 'Miri', data: [45, 77, 99, 88,] },
                      { name: 'Bintulu', data: [49, 62, 69, 91,] },
                    ],
                  },
                  {
                    year: '2021',
                    data: [
                      { name: 'Kuching', data: [49, 62, 69, 91,] },
                      { name: 'Miri', data: [56, 77, 88, 99,] },
                      { name: 'Bintulu', data: [56, 13, 34, 10] },
                    ],
                  },
                  {
                    year: '2022',
                    data: [
                      { name: 'Kuching', data: [51, 35, 41, 10] },
                      { name: 'Miri', data: [56, 13, 34, 10] },
                      { name: 'Bintulu', data: [76, 42, 29, 41,] },
                    ],
                  },
                  {
                    year: '2023',
                    data: [
                      { name: 'Kuching', data: [76, 42, 29, 41,] },
                      { name: 'Miri', data: [80, 55, 34, 114,] },
                      { name: 'Bintulu', data: [51, 35, 41, 10] },
                    ],
                  },
                ],
              }}
            />
          </Grid> */}

          <Grid item xs={12} md={7}>
            <EcommerceYearlySales
              title="Evolution by Year"
              // subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                series: [
                  {
                    year: '2019',
                    data: [
                      { name: 'Economic', data: [10, 41, 35, 151, 49, 62, 69, 91, 48, 51, 55, 60] },
                      { name: 'Political', data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 44, 11, 6] },
                      { name: 'Environment', data: [23, 11, 22, 27, 13, 22, 37, 21, 44, 36, 69, 78], },
                      { name: 'Sectoral', data: [25, 36, 30, 45, 35, 64, 52, 59, 36, 40, 77, 55] },
                      { name: 'Social', data: [15, 5, 55, 22, 44, 55, 71, 32, 36, 77, 56, 47] },
                    ],
                  },
                  {
                    year: '2020',
                    data: [
                      { name: 'Economic', data: [148, 69, 62, 49, 51, 35, 41, 10, 27, 13, 22, 37] },
                      { name: 'Political', data: [10, 13, 56, 77, 88, 99, 77, 45, 13, 13, 22] },
                      { name: 'Environment', data: [23, 11, 27, 13, 22, 37, 21, 44, 23, 11, 13], },
                      { name: 'Sectoral', data: [25, 36, 30, 45, 35, 64, 52, 59, 36, 22, 55, 71] },
                      { name: 'Social', data: [15, 11, 22, 27, 36, 77, 55, 71, 32, 36, 45, 36] },
                    ],
                  },
                  {
                    year: '2021',
                    data: [
                      { name: 'Economic', data: [148, 91, 69, 62, 49, 51, 35, 41, 10, 45, 35, 64,] },
                      { name: 'Political', data: [25, 36, 30, 45, 35, 64, 52, 59, 36, 77, 13, 13,] },
                      { name: 'Environment', data: [45, 99, 88, 77, 56, 13, 34, 10, 10, 27, 13, 22] },
                      { name: 'Sectoral', data: [10, 41, 35, 151, 49, 62, 69, 91, 48, 10, 30, 35] },
                      { name: 'Social', data: [15, 36, 5, 88, 77, 56, 36, 77, 32, 13, 34, 10] },
                    ],
                  },
                  {
                    year: '2022',
                    data: [
                      { name: 'Economic', data: [10, 41, 35, 151, 49, 62, 69, 91, 36, 77, 45] },
                      { name: 'Political', data: [10, 13, 56, 77, 88, 99, 77, 45, 45, 35, 64] },
                      { name: 'Environment', data: [23, 11, 22, 27, 13, 22, 37, 44, 45, 35, 32], },
                      { name: 'Sectoral', data: [25, 36, 30, 45, 35, 64, 52, 59, 36, 45, 30, 45] },
                      { name: 'Social', data: [15, 11, 45, 35, 22, 44, 55, 71, 32, 37, 21, 44] },
                    ],
                  },
                  {
                    year: '2023',
                    data: [
                      { name: 'Economic', data: [148, 91, 69, 62, 49, 51, 35, 41, 10, 52, 59, 36] },
                      { name: 'Political', data: [25, 36, 30, 45, 35, 64, 52, 59, 36, 77, 88, 99,] },
                      { name: 'Environment', data: [45, 77, 99, 88, 77, 56, 13, 34, 10, 37, 21, 44] },
                      { name: 'Sectoral', data: [10, 41, 35, 151, 49, 62, 69, 91, 48, 32, 37, 21] },
                      { name: 'Social', data: [15, 36, 5, 55, 22, 44, 55, 71, 32, 11, 22, 27] },
                    ],
                  },
                ],
              }}
            />

            {/* <Grid item xs={12} md={6}>
                <BookingReservationStats
                  title="Participants from others cities"
                  // subheader="(+43% Check In | +12% Check Out) than last year"
                  chart={{
                    categories: ['Kuala Lumpur', 'Penang', 'Pahang', 'Sabah', 'Langkawi'],
                    series: [
                      {
                        type: 'Year',
                        data: [
                          { name: 'Kuala Lumpur', data: [76, 42, 29, 41, 27,] },
                          { name: 'Penang', data: [138, 117, 86, 63] },
                          { name: 'Pahang', data: [80, 130, 15, 28, 55] },
                          { name: 'Sabah', data: [114, 80, 130, 15, 28] },
                          { name: 'Langkawi', data: [55, 34, 114, 80, 15,] },
                        ],
                      },
                    ],
                  }}
                />
            </Grid> */}

            <Card>
              <CardHeader title="SARAWAK BE CITIES" />

              <CardContent>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <SarawakMap />
                </Stack>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Grid item xs={12} md={4}>
                    <Typography variant='h6' sx={{ pb: 1 }}>Overall Performance</Typography>
                  </Grid>
                  <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "row", justifyContent: "end" }}>
                    <Typography variant='caption' >Trends:</Typography>
                    <img src={upIcon} alt="" width={20} height={20} />
                    <Typography variant='caption' >On track or maintaining SDG achievement</Typography>
                    <img src={upRightIcon} alt="" width={20} height={20} />
                    <Typography variant='caption' >Moderately improving</Typography>
                    <img src={rightIcon} alt="" width={20} height={20} />
                    <Typography variant='caption' >Stagnating</Typography>
                  </Grid>
                </Stack>
                <Grid container spacing={3}>
                  {
                    goalsView.length !== 0 && goalsView.map((details, index) =>
                      goalsView ?
                        <Grid item xs={4} md={3}>
                          <Card key={details.id} sx={{ cursor: "pointer", p: 1 }} onClick={() => handleOpenDetails(details.id)}>
                            {/* onClick={() => handleGoalsClick(details.id)} */}
                            <Stack direction="row">
                              <Grid item xs={8} md={9} sx={{ display: "flex", justifyContent: "center", flexDirection: "column" }}>
                                <img src={details.icon} alt={details.title} width={50} />
                                <Typography variant='caption' >{details.title}</Typography>
                              </Grid>
                              <Grid item xs={4} md={3} display="flex" alignItems="center" justifyContent="space-around">
                                <img src={details.symbol} alt={details.title} width={20} />
                              </Grid>
                            </Stack>
                          </Card>
                        </Grid>
                        :
                        <SkeletonPostItem key={index} />
                    )
                  }
                  <ScoringDetailsDrawer
                    open={openDetails}
                    onClose={handleCloseDetails}
                    details={selectedDetails}
                  />
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={5}>
            <Stack spacing={2}>
              <CalendarPage />
              <EcommerceSalesOverview title="Upcoming Events" data={_ecommerceSalesOverview} />
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
