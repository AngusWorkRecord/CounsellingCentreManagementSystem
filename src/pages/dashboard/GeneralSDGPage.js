import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import { Grid, Container, Typography, Stack, Card, CardHeader, CardContent, Badge } from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// _mock_
import { _bookings, _bookingNew, _bookingsOverview2023, _bookingsOverview2022, _bookingReview, _ecommerceSalesOverview, _customMapData } from '../../_mock/arrays';
// components
import { useSettingsContext } from '../../components/settings';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
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

const TrackRecord = [
  {
      "no": 1,
      "event": "2nd ASEAN Quantity Surveyors Conference 2023",
      "type": "Upcoming National Convention",
      "delegrate": 500,
      "delegrate2": "500 Estimated Delegates",
      "status": "Upcoming Event"
  },
  {
      "no": 2,
      "event": "International Conference on Biotechnological Advancement in Food Security Smart Farming and Entrepreneurship 2023",
      "type": "Upcoming International Convention",
      "delegrate": 200,
      "delegrate2": "200 Estimated Delegates",
      "status": "Upcoming Event"
  },
  {
      "no": 3,
      "event": "Sarawak Medico-Legal Bootcamp (SMLB) 2023",
      "type": "Upcoming National Convention",
      "delegrate": 550,
      "delegrate2": "550 Estimated Delegates",
      "status": "Upcoming Event"
  },
  {
      "no": 4,
      "event": "ORBICOM 2023",
      "type": "Upcoming International Convention",
      "delegrate": 235,
      "delegrate2": "235 Estimated Delegates",
      "status": "Upcoming Event"
  },
  {
      "no": 5,
      "event": "Annual Conference of the International Association for Impact Assessment (IAIA) 2023",
      "type": "Upcoming International Convention",
      "delegrate": 400,
      "delegrate2": "400 Estimated Delegates",
      "status": "Upcoming Event"
  },
  {
      "no": 6,
      "event": "Childhood Cancer International (CCI) Asia Conference 2023",
      "type": "Upcoming International Convention",
      "delegrate": 350,
      "delegrate2": "350 Estimated Delegates",
      "status": "Upcoming Event"
  },
  {
      "no": 7,
      "event": "Borneo International Water and Wastewater Exhibition and Conference 2022 (BIWWEC 2022)",
      "type": "National Convention",
      "delegrate": 870,
      "delegrate2": "870 Delegates",
      "status": "Track Record"
  },
  {
      "no": 8,
      "event": "9th Asian South Pacific Association of Sport Psychology (ASPASP) International Congress of Sport Psychology 2022",
      "type": "International Convention",
      "delegrate": 550,
      "delegrate2": "550 Delegates",
      "status": "Track Record"
  },
  {
      "no": 9,
      "event": "International Counselling Convention (ICC2022) 2022",
      "type": "International Convention",
      "delegrate": 640,
      "delegrate2": "640 Delegates",
      "status": "Track Record"
  },
  {
      "no": 10,
      "event": "33rd Annual Architectural Student Workshop 2022",
      "type": "National Convention",
      "delegrate": 580,
      "delegrate2": "580 Delegates",
      "status": "Track Record"
  },
  {
      "no": 11,
      "event": "Travel Agency Federation India (TAFI) Annual Convention 2022",
      "type": "International Convention",
      "delegrate": 620,
      "delegrate2": "620 Delegates",
      "status": "Track Record"
  },
  {
      "no": 12,
      "event": "World Engineering, Science and Technology Congress (ESTCON) 2022",
      "type": "International Convention",
      "delegrate": 840,
      "delegrate2": "840 Delegates",
      "status": "Track Record"
  },
  {
      "no": 13,
      "event": "National Early Childhood Intervention Conference 2022",
      "type": "Regional Convention",
      "delegrate": 450,
      "delegrate2": "450 Delegates",
      "status": "Track Record"
  },
  {
      "no": 14,
      "event": "AFSM Tripartite Conference 2022",
      "type": "International Convention",
      "delegrate": 420,
      "delegrate2": "420 Delegates",
      "status": "Track Record"
  },
  {
      "no": 15,
      "event": "Breakthrough Boundaries Conference 2020",
      "type": "Regional Convention",
      "delegrate": 990,
      "delegrate2": "990 Delegates",
      "status": "Track Record"
  },
  {
      "no": 16,
      "event": "Conference on Inclusive Early Childhood Education 2019",
      "type": "Regional Convention",
      "delegrate": 810,
      "delegrate2": "810 Delegates",
      "status": "Track Record"
  },
  {
      "no": 17,
      "event": "1st World Chinese Medicine Forum 2019",
      "type": "International Convention",
      "delegrate": 1190,
      "delegrate2": "1190 Delegates",
      "status": "Track Record"
  },
  {
      "no": 18,
      "event": "16th PRULIA Quality Leader Conference 2018",
      "type": "Regional Convention",
      "delegrate": 720,
      "delegrate2": "720 Delegates",
      "status": "Track Record"
  },
  {
      "no": 19,
      "event": "18th Asian-Australasian Animal Production Congress 2018",
      "type": "International Convention",
      "delegrate": 645,
      "delegrate2": "645 Delegates",
      "status": "Track Record"
  },
  {
      "no": 20,
      "event": "17th CPD Series: 10th Diabetes Complications Conference, Grand Rounds (DCOM 2018), Diabetes Asia 2018 (DAC 2018)",
      "type": "Regional Convention",
      "delegrate": 690,
      "delegrate2": "690 Delegates",
      "status": "Track Record"
  },
  {
      "no": 21,
      "event": "5th International Marine Conservation Congress 2018",
      "type": "International Convention",
      "delegrate": 630,
      "delegrate2": "630 Delegates",
      "status": "Track Record"
  },
  {
      "no": 22,
      "event": "2nd International Traditional Medical Physician Conference 2018",
      "type": "International Convention",
      "delegrate": 1370,
      "delegrate2": "1370 Delegates",
      "status": "Track Record"
  },
  {
      "no": 23,
      "event": "8th Alliance for Healthy Cities (AFHC) Global Conference and General Assembly 2018",
      "type": "International Convention",
      "delegrate": 645,
      "delegrate2": "645 Delegates",
      "status": "Track Record"
  },
  {
      "no": 24,
      "event": "Better Air Quality Conference 2018",
      "type": "International Convention",
      "delegrate": 700,
      "delegrate2": "700 Delegates",
      "status": "Track Record"
  },
  {
      "no": 25,
      "event": "55th Annual Meeting of the Association for Tropical Biology and Conservation (ATBC2018)",
      "type": "International Convention",
      "delegrate": 970,
      "delegrate2": "970 Delegates",
      "status": "Track Record"
  },
  {
      "no": 26,
      "event": "International Energy Week 2018",
      "type": "International Convention",
      "delegrate": 1120,
      "delegrate2": "1120 Delegates",
      "status": "Track Record"
  },
  {
      "no": 27,
      "event": "International Summit on PEACE 2017",
      "type": "International Convention",
      "delegrate": 640,
      "delegrate2": "640 Delegates",
      "status": "Track Record"
  },
  {
      "no": 28,
      "event": "2nd International Conference on Special Education 2017",
      "type": "International Convention",
      "delegrate": 800,
      "delegrate2": "800 Delegates",
      "status": "Track Record"
  },
  {
      "no": 29,
      "event": "2017 42nd JCI Malaysia Annual National Convention",
      "type": "Regional Convention",
      "delegrate": 840,
      "delegrate2": "840 Delegates",
      "status": "Track Record"
  },
  {
      "no": 30,
      "event": "29th Annual Scientific Conference of the Malaysian Oncological Society 2017 (29th ASCOMOS 2017)",
      "type": "Regional Convention",
      "delegrate": 660,
      "delegrate2": "660 Delegates",
      "status": "Track Record"
  },
  {
      "no": 31,
      "event": "International Biomass Conference Malaysia 2017 (IBCM2017)",
      "type": "International Convention",
      "delegrate": 1100,
      "delegrate2": "1100 Delegates",
      "status": "Track Record"
  },
  {
      "no": 32,
      "event": "55th ICCA Congress 2016",
      "type": "International Convention",
      "delegrate": 830,
      "delegrate2": "830 Delegates",
      "status": "Track Record"
  },
  {
      "no": 33,
      "event": "The International Environmental Health Conference 2015",
      "type": "International Convention",
      "delegrate": 570,
      "delegrate2": "570 Delegates",
      "status": "Track Record"
  },
  {
      "no": 34,
      "event": "International Traditional Natural Medical Physician Conference 2015",
      "type": "International Convention",
      "delegrate": 580,
      "delegrate2": "580 Delegates",
      "status": "Track Record"
  },
  {
      "no": 35,
      "event": "World TVET Conference 2015",
      "type": "International Convention",
      "delegrate": 650,
      "delegrate2": "650 Delegates",
      "status": "Track Record"
  },
  {
      "no": 36,
      "event": "International Energy Week 2015",
      "type": "International Convention",
      "delegrate": 1070,
      "delegrate2": "1070 Delegates",
      "status": "Track Record"
  },
  {
      "no": 37,
      "event": "International Disaster Conference & Major Incident Response Exercise Competition (I-MIREX) 2014,",
      "type": "International Convention",
      "delegrate": 1120,
      "delegrate2": "1120 Delegates",
      "status": "Track Record"
  },
  {
      "no": 38,
      "event": "Asia Teaching English as Foreign Language International Conference- Asia TEFL 2014",
      "type": "International Convention",
      "delegrate": 1600,
      "delegrate2": "1600 Delegates",
      "status": "Track Record"
  },
  {
      "no": 39,
      "event": "World Organisation of National Colleges, Academics and Academic Association of General Practitioners/Family Physicians 2014 (WONCA)",
      "type": "International Convention",
      "delegrate": 1100,
      "delegrate2": "1100 Delegates",
      "status": "Track Record"
  },
  {
      "no": 40,
      "event": "3rd International Public Health Conference & 20th National Public Health Colloquium 2013",
      "type": "International Convention",
      "delegrate": 610,
      "delegrate2": "610 Delegates",
      "status": "Track Record"
  },
  {
      "no": 41,
      "event": "43rd Malaysian Orthopaedic Association Annual Scientific Meeting & 33rd Asean Orthopaedic Association Annual Congress 2013,",
      "type": "Regional Convention",
      "delegrate": 880,
      "delegrate2": "880 Delegates",
      "status": "Track Record"
  },
  {
      "no": 42,
      "event": "Asian &amp Oceanic Society of Regional Anaesthesia and Pain Medicine Congress 2013",
      "type": "Regional Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 43,
      "event": "4th World Conference in Science and Technology Education 2013",
      "type": "International Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 44,
      "event": "9th Combined Paediatric & Spine Congress 2013",
      "type": "International Convention",
      "delegrate": 1030,
      "delegrate2": "1030 Delegates",
      "status": "Track Record"
  },
  {
      "no": 45,
      "event": "1st Borneo World Music Expo 2013",
      "type": "Regional Convention",
      "delegrate": 1400,
      "delegrate2": "1400 Delegates",
      "status": "Track Record"
  },
  {
      "no": 46,
      "event": "12th Asian and Oceanic Society of Regional Anaesthesia and Pain Medicine Congress 2013 (AOSRA-PM)",
      "type": "Regional Convention",
      "delegrate": 800,
      "delegrate2": "800 Delegates",
      "status": "Track Record"
  },
  {
      "no": 47,
      "event": "Rwo-Shr Health Methods Incorporating the Traditional & Complementary Medicine Worldwide Conference and Exhibition 2012",
      "type": "International Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 48,
      "event": "The 9th ASEAN Hakka Convention 2013",
      "type": "Regional Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 49,
      "event": "9th World Congress of Chinese Medicine 2012 – WCCM",
      "type": "International Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 50,
      "event": "2nd World Hopoh Community Convention 2012",
      "type": "International Convention",
      "delegrate": 1700,
      "delegrate2": "1700 Delegates",
      "status": "Track Record"
  },
  {
      "no": 51,
      "event": "14th Asian Pacific Congress of Paediatrics 2012 (APCP) & 4th Asia Pacific Congress of Paediatric Nursing (APCPN)",
      "type": "Regional Convention",
      "delegrate": 1200,
      "delegrate2": "1200 Delegates",
      "status": "Track Record"
  },
  {
      "no": 52,
      "event": "13th Global Reunion of Nanyang University Alumni 2012",
      "type": "International Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 53,
      "event": "Ecology and Holistic Living Conference (EHLC) 2012",
      "type": "International Convention",
      "delegrate": 1000,
      "delegrate2": "1000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 54,
      "event": "Royal College of Obstetricians and Gynaecologist (RCOG) 10th International Scientific Meeting 2012",
      "type": "International Convention",
      "delegrate": 1350,
      "delegrate2": "1350 Delegates",
      "status": "Track Record"
  },
  {
      "no": 55,
      "event": "50th MD 308 Lions Convention 2012",
      "type": "International Convention",
      "delegrate": 2000,
      "delegrate2": "2000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 56,
      "event": "Nursing and Allied Health Conference 2012",
      "type": "Regional Convention",
      "delegrate": 1395,
      "delegrate2": "1395 Delegates",
      "status": "Track Record"
  },
  {
      "no": 57,
      "event": "16th Hope Malaysia National Convention 2011",
      "type": "Regional Convention",
      "delegrate": 2000,
      "delegrate2": "2000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 58,
      "event": "Public Health Nursing Conference 2011",
      "type": "Regional Convention",
      "delegrate": 900,
      "delegrate2": "900 Delegates",
      "status": "Track Record"
  },
  {
      "no": 59,
      "event": "The 9th CPD Diabetes Asia Conference 2010",
      "type": "International Convention",
      "delegrate": 1500,
      "delegrate2": "1500 Delegates",
      "status": "Track Record"
  },
  {
      "no": 60,
      "event": "4th World Engineering Conference 2010 (WEC)",
      "type": "International Convention",
      "delegrate": 1200,
      "delegrate2": "1200 Delegates",
      "status": "Track Record"
  },
  {
      "no": 61,
      "event": "Urban Public Transport Conference : A Platform for Change 2010",
      "type": "International Convention",
      "delegrate": 800,
      "delegrate2": "800 Delegates",
      "status": "Track Record"
  },
  {
      "no": 62,
      "event": "Sarawak Rainforest Interhash 2010",
      "type": "International Convention",
      "delegrate": 5000,
      "delegrate2": "5000 Delegates",
      "status": "Track Record"
  },
  {
      "no": 63,
      "event": "Toastmaster District 51 2010 Lutong Convention",
      "type": "Regional Convention",
      "delegrate": 1200,
      "delegrate2": "1200 Delegates",
      "status": "Track Record"
  },
  {
      "no": 64,
      "event": "Alpha Malaysia 2010",
      "type": "International Convention",
      "delegrate": 1100,
      "delegrate2": "1100 Delegates",
      "status": "Track Record"
  }
]



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

export default function GeneralSDGPage() {

  const { selectedID } = useParams();

  console.log(selectedID)

  const currentInvoice = TrackRecord.find((TrackRecords) => TrackRecords.no === Number(selectedID));

  console.log(currentInvoice)

  const theme = useTheme();

  const navigate = useNavigate();

  const { themeStretch } = useSettingsContext();

  const [openDetails, setOpenDetails] = useState(false);

  const handleOpenDetails = () => {
    setOpenDetails(true);
  };

  const handleCloseDetails = () => {
    setOpenDetails(false);
  };

  const handleGoalsClick = (selected) => {
    console.log(selected)
    navigate(PATH_DASHBOARD.general.list(selected));
  }

  return (
    <>
      <Helmet>
        <title> BE | BE Legacy Indicators </title>
      </Helmet>

      <Container maxWidth={false}>
      <CustomBreadcrumbs
          heading={currentInvoice.event}
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Events',
              href: PATH_DASHBOARD.general.events,
            },
            {
              name: currentInvoice.event
            },
          ]}
        />
        <Grid container xs={12} md={12}>
          <Grid item xs={12} md={6} sx={{ pr: 3, pb: 3 }}>
            <SarawakMap />
          </Grid>
          <Grid item xs={12} md={6} sx={{ pl: 3, pb: 3 }}>
            <BookingBookedRoom title="legacy impact performance" subheader={2023} data={_bookingsOverview2023} />
            {/* <BookingBookedRoom title="Event Performance Index" subheader={2022} data={_bookingsOverview2022} /> */}
          </Grid>
          <Card>
            <CardContent>
              <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
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
                          <Card key={details.id} sx={{ cursor: "pointer", p: 1 }} >
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
                </Grid>
            </CardContent> 
          </Card>
        </Grid>
      </Container>
    </>
  );
}
