import { Helmet } from 'react-helmet-async';
import { useState } from 'react';
import sumBy from 'lodash/sumBy';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
} from '@mui/material';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// utils
import { fTimestamp } from '../../utils/formatTime';
// _mock_
import { _invoices } from '../../_mock/arrays';
// components
import Label from '../../components/label';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import ConfirmDialog from '../../components/confirm-dialog';
import CustomBreadcrumbs from '../../components/custom-breadcrumbs';
import { useSettingsContext } from '../../components/settings';
import {
  useTable,
  getComparator,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from '../../components/table';
// sections
import InvoiceAnalytic from '../../sections/@dashboard/invoice/InvoiceAnalytic';
import { InvoiceTableRow, InvoiceTableToolbar } from '../../sections/@dashboard/invoice/list';

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  'All',
  'Kuching',
  'Sibu',
  'Miri'
];

const TABLE_HEAD = [
  // { id: 'no', label: 'No', align: 'left' },
  { id: 'event', label: 'CONVENTION', align: 'left' },
  { id: 'delegrate2', label: 'DELEGATES', align: 'left' },
  { id: 'type', label: 'CONVENTION TYPE', align: 'left' },
  { id: 'status', label: 'STATUS', align: 'left' },
  { id: '' },
];

// ----------------------------------------------------------------------

export default function EventListPage() {
  const theme = useTheme();

  const { themeStretch } = useSettingsContext();

  const navigate = useNavigate();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'no' });
 
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

  const [tableData, setTableData] = useState(TrackRecord);

  const [filterName, setFilterName] = useState('');

  const [openConfirm, setOpenConfirm] = useState(false);

  const [filterStatus, setFilterStatus] = useState('All');

  const [filterEndDate, setFilterEndDate] = useState(null);

  const [filterService, setFilterService] = useState('All');

  const [filterStartDate, setFilterStartDate] = useState(null);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const dataInPage = dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const denseHeight = dense ? 56 : 76;

  const isFiltered =
    filterStatus !== 'All' ||
    filterName !== '' ||
    filterService !== 'All' ||
    (!!filterStartDate && !!filterEndDate);

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);

  const getLengthByStatus = (status) => tableData.filter((item) => item.status === status).length;

  const getLengthByType = (type) => tableData.filter((item) => item.type === type).length;
  
  const getTotalPriceByStatus = (status) =>
    sumBy(
      tableData.filter((item) => item.status === status),
      'delegrate'
    );

    const getTotalPriceByType = (type) =>
    sumBy(
      tableData.filter((item) => item.type === type),
      'delegrate'
    );
    

  const getPercentByStatus = (status) => (getLengthByStatus(status) / tableData.length) * 100;

  const getPercentByType = (type) => (getLengthByType(type) / tableData.length) * 100;

  

  const TABS = [
    { value: 'All', label: 'All', color: 'info', count: tableData.length },
    { value: 'Upcoming Event', label: 'Upcoming Event', color: 'success', count: getLengthByStatus('Upcoming Event') },
    { value: 'Track Record', label: 'Track Record', color: 'warning', count: getLengthByStatus('Track Record') },
  ];

  const handleOpenConfirm = () => {
    setOpenConfirm(true);
  };

  const handleCloseConfirm = () => {
    setOpenConfirm(false);
  };

  const handleFilterStatus = (event, newValue) => {
    setPage(0);
    setFilterStatus(newValue);
  };

  const handleFilterName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const handleFilterService = (event) => {
    setPage(0);
    setFilterService(event.target.value);
  };

  const handleDeleteRow = (id) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);

    if (page > 0) {
      if (dataInPage.length < 2) {
        setPage(page - 1);
      }
    }
  };

  const handleDeleteRows = (selectedRows) => {
    const deleteRows = tableData.filter((row) => !selectedRows.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);

    if (page > 0) {
      if (selectedRows.length === dataInPage.length) {
        setPage(page - 1);
      } else if (selectedRows.length === dataFiltered.length) {
        setPage(0);
      } else if (selectedRows.length > dataInPage.length) {
        const newPage = Math.ceil((tableData.length - selectedRows.length) / rowsPerPage) - 1;
        setPage(newPage);
      }
    }
  };

  const handleEditRow = (id) => {
    navigate(PATH_DASHBOARD.invoice.edit(id));
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.general.view(id));
  };

  const handleResetFilter = () => {
    setFilterName('');
    setFilterStatus('All');
    setFilterService('All');
    setFilterEndDate(null);
    setFilterStartDate(null);
  };

  return (
    <>
      <Helmet>
        <title> Invoice: List | BESarawak</title>
      </Helmet>

      <Container maxWidth={false}>
        <CustomBreadcrumbs
          heading="Event List"
          links={[
            {
              name: 'Dashboard',
              href: PATH_DASHBOARD.root,
            },
            {
              name: 'Events'
            },
          ]}
          action={
            <Button
              component={RouterLink}
              to={PATH_DASHBOARD.invoice.new}
              variant="contained"
              startIcon={<Iconify icon="eva:plus-fill" />}
            >
              New Event
            </Button>
          }
        />

        <Card sx={{ mb: 5 }}>
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, 'delegrate')}
                icon="ic:round-receipt"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="International Convention"
                total={getLengthByType('International Convention')}
                percent={(getPercentByType('International Convention'))}
                price={getTotalPriceByType('International Convention')}
                icon="eva:checkmark-circle-2-fill"
                color={theme.palette.success.main}
              />

              <InvoiceAnalytic
                title="Regional Convention"
                total={getLengthByType('Regional Convention')}
                percent={getPercentByType('Regional Convention')}
                price={getTotalPriceByType('Regional Convention')}
                icon="eva:clock-fill"
                color={theme.palette.warning.main}
              />

              <InvoiceAnalytic
                title="National Convention"
                total={getLengthByType('National Convention')}
                percent={getPercentByType('National Convention')}
                price={getTotalPriceByType('National Convention')}
                icon="eva:bell-fill"
                color={theme.palette.error.main}
              />

              <InvoiceAnalytic
                title="Upcoming Event"
                total={getLengthByStatus('Upcoming Event')}
                percent={getPercentByStatus('Upcoming Event')}
                price={getTotalPriceByStatus('Upcoming Event')}
                icon="eva:file-fill"
                color={theme.palette.text.secondary}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Tabs
            value={filterStatus}
            onChange={handleFilterStatus}
            sx={{
              px: 2,
              bgcolor: 'background.neutral',
            }}
          >
            {TABS.map((tab) => (
              <Tab
                key={tab.value}
                value={tab.value}
                label={tab.label}
                icon={
                  <Label color={tab.color} sx={{ mr: 1 }}>
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <Divider />

          <InvoiceTableToolbar
            filterName={filterName}
            isFiltered={isFiltered}
            filterService={filterService}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
            optionsService={SERVICE_OPTIONS}
            filterStartDate={filterStartDate}
            onResetFilter={handleResetFilter}
            onFilterService={handleFilterService}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={dense}
              numSelected={selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
                )
              }
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="ic:round-send" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="eva:printer-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={handleOpenConfirm}>
                      <Iconify icon="eva:trash-2-outline" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table size={dense ? 'smAll' : 'medium'} sx={{ minWidth: 800 }}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                />

                <TableBody>
                  {dataFiltered
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((row) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={selected.includes(row.id)}
                        onSelectRow={() => onSelectRow(row.no)}
                        onViewRow={() => handleViewRow(row.no)}
                        onEditRow={() => handleEditRow(row.no)}
                        onDeleteRow={() => handleDeleteRow(row.id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(page, rowsPerPage, tableData.length)}
                  />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={dataFiltered.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={onChangePage}
            onRowsPerPageChange={onChangeRowsPerPage}
            //
            dense={dense}
            onChangeDense={onChangeDense}
          />
        </Card>
      </Container>

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong> {selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows(selected);
              handleCloseConfirm();
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}) {
  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
        invoice.invoiceTo.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'All') {
    inputData = inputData.filter((invoice) => invoice.status === filterStatus);
  }

  if (filterService !== 'All') {
    inputData = inputData.filter((invoice) =>
      invoice.items.some((c) => c.service === filterService)
    );
  }

  if (filterStartDate && filterEndDate) {
    inputData = inputData.filter(
      (invoice) =>
        fTimestamp(invoice.createDate) >= fTimestamp(filterStartDate) &&
        fTimestamp(invoice.createDate) <= fTimestamp(filterEndDate)
    );
  }

  return inputData;
}
