import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
// @mui
import { Card, CardHeader, Box, Grid, Skeleton, Typography, Stack } from '@mui/material';
// components
import Chart, { useChart } from '../../../../components/chart';

// ----------------------------------------------------------------------

PerformanceChart.propTypes = {
  chart: PropTypes.object,
  title: PropTypes.string,
  subheader: PropTypes.string,
};

export default function PerformanceChart({ title, subheader, chart, ...other }) {
  const { colors, series, options, categories, oldSeries } = chart;

  const [scoreData, setData] = useState({
    rank: 0,
    score: 0
  });

  const chartSeries = series.map((i) => i.value);
  const checkrateColor = (rate) => {
    let color = "#00AEEF"
    if (rate < 50)
      color = '#DD1E47'
    if (rate < 65 && rate > 49)
      color = '#FFC40C'
    if (rate < 100 && rate > 64)
      color = '#00A084'
    return color
  }

  const scoreRank = [...series].sort((a, b) => b.value - a.value);
  const scoreSetting = (index) => {
    let ranking = 1
    scoreRank.map((x, i) => {
      if (x.label === series[index].label)
        ranking = i + 1
      return {}
    }
    )

    if (series.length > 0) {
      setData({
        rank: ranking,
        score: series[index].value
      })
    }
  }

  useEffect(() => {
    if (series.length > 0) {
      setData({
        rank: 1,
        score: scoreRank[0].value
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [series]);


  const chartPoint = [
    { x: 70, y: -5, image: { path: 'https://img.icons8.com/external-flaticons-lineal-color-flat-icons/64/null/external-brand-awareness-traditional-marketing-flaticons-lineal-color-flat-icons.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 215, y: -5, image: { path: 'https://img.icons8.com/external-fauzidea-detailed-outline-fauzidea/64/null/external-government-building-fauzidea-detailed-outline-fauzidea.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 360, y: -5, image: { path: 'https://img.icons8.com/external-vectorslab-outline-color-vectorslab/53/null/external-feedback-shopping-and-ecommerce-vectorslab-outline-color-vectorslab.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 500, y: -5, image: { path: 'https://img.icons8.com/external-xnimrodx-lineal-gradient-xnimrodx/64/null/external-setting-advertising-xnimrodx-lineal-gradient-xnimrodx-2.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },

    { x: 645, y: -5, image: { path: 'https://img.icons8.com/external-filled-outline-geotatah/64/null/external-customer-customer-satisfaction-filled-outline-filled-outline-geotatah-2.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 790, y: -5, image: { path: 'https://img.icons8.com/external-icongeek26-outline-gradient-icongeek26/64/null/external-analytic-bitcoin-icongeek26-outline-gradient-icongeek26.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 930, y: -5, image: { path: 'https://img.icons8.com/external-filled-outline-geotatah/64/null/external-champion-managerial-psychology-color-filled-outline-geotatah.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 1070, y: -5, image: { path: 'https://img.icons8.com/external-smashingstocks-detailed-outline-smashing-stocks/66/null/external-social-banking-and-finance-smashingstocks-detailed-outline-smashing-stocks.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },

    { x: 1215, y: -5, image: { path: 'https://img.icons8.com/external-bearicons-flat-bearicons/64/null/external-Lightbulb-happiness-bearicons-flat-bearicons.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },
    { x: 1340, y: -5, image: { path: 'https://img.icons8.com/external-flat-geotatah/64/null/external-community-work-life-balance-flat-flat-geotatah.png', width: 35, height: 35, offsetX: 0, offsetY: 0, } },

  ]
  const chartOptions = useChart({
    plotOptions: {
      bar: {
        barHeight: '100%',
        columnWidth: '100%',
        distributed: true,
        horizontal: false,
        dataLabels: {
          position: 'top'
        },
      }
    },
    colors: series.map((i) => checkrateColor(i.value)),
    dataLabels: {
      enabled: true,
      textAnchor: 'middle',
      style: {
        colors: ['#000']
      },
      offsetX: 0,
      dropShadow: {
        enabled: true
      }
    },
    stroke: {
      width: 1,
      colors: ['#fff']
    },
    xaxis: {
      labels: {
        show: false
      },
      categories
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        title: {
          formatter: (value) => `${value}`,
        }
      }
    },
    chart: {
      events: {
        dataPointSelection: (event, chartContext, config) => {
          scoreSetting(config.dataPointIndex)
        }
      }
    },
    legend: {
      show: false,
      position: "bottom",
      horizontalAlign: "center",

    },
    // annotations: {
    //   points: chartPoint
    // },
    ...options,
  });

  return (
    <Card {...other}>
      <CardHeader
        title={
          <Stack direction="row">
            {title}
            <Grid sx={{ mx: 2, my: 2, justifyContent:"end" }} container  {...other}>
              <Grid item xs={0.5} md={0.5} lg={0.5} style={{ textAlign: "center", borderRight: "2px solid lightgrey" }}>
                <div style={{ justifyContent: "center", display: "flex" }}>  <Typography variant='caption'>Rank </Typography></div>
                <div style={{ justifyContent: "center", display: "flex" }}>  <Typography variant='h4'>{scoreData.rank} </Typography></div>
              </Grid>
              <Grid item xs={0.5} md={0.5} lg={0.5}>
                <div style={{ justifyContent: "center", display: "flex" }}>  <Typography variant='caption'>Score </Typography></div>
                <div style={{ justifyContent: "center", display: "flex" }}>  <Typography variant='h4'>{scoreData.score} </Typography></div>
              </Grid>
            </Grid>
          </Stack>
        }
        subheader={subheader}
      />
      <Box sx={{ mx: 3 }} dir="ltr">
        <Chart type="bar" series={[{ name: '', data: chartSeries }]} options={chartOptions} height={400} />

        <Grid sx={{ mx: 2 }} container spacing={0.3}  {...other}>
          {
            chartPoint.map((i) =>
            (
              <Grid item xs={1.18} md={1.18} lg={1.18}>
                <Card spacing={2} sx={{ p: 1, borderRadius: 0 }} style={{ textAlign: "center" }}>
                  <div style={{ justifyContent: "center", display: "flex" }}><img src={i.image.path} alt="" width={40} height={40} /> </div></Card>
              </Grid>
            ))
          }
        </Grid>
        <Grid sx={{ mx: 2 }} container spacing={0.3}  {...other}>
          {
            series.map((i) =>
            (
              <Grid item xs={1.18} md={1.18} lg={1.18}>
                <Card spacing={2} sx={{ p: 2, borderRadius: 0 }} style={{ textAlign: "center", backgroundColor: checkrateColor(i.value) }}>
                  <div style={{ justifyContent: "center", display: "flex" }}><img src={i.symbol} alt="" width={20} height={20} /> </div>
                  {i.value}</Card>
              </Grid>
            ))
          }
        </Grid>
        <Grid sx={{ mx: 2, my: 0.2 }} container spacing={0.3} {...other}>
          {
            oldSeries.map((i) =>
            (
              <Grid item xs={1.18} md={1.18} lg={1.18}>
                <Card spacing={2} sx={{ p: 2, borderRadius: 0 }} style={{ textAlign: "center", backgroundColor: checkrateColor(i.value) }}>{i.value}</Card>
              </Grid>
            ))
          }
        </Grid>
        <Typography variant='caption' sx={{ pt: 2, pl: 2, }}>Score 2023 VS Score 2022</Typography>
      </Box>
    </Card>
  );
}
