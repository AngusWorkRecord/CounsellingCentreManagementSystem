import PropTypes from 'prop-types';
import { useState } from 'react';
// @mui
import {
  Box,
  Chip,
  List,
  Stack,
  Drawer,
  Button,
  Divider,
  Tooltip,
  Checkbox,
  TextField,
  Typography,
  IconButton,
  ListItemText,
  Autocomplete,
} from '@mui/material';
// utils
import { fData } from '../../../../utils/formatNumber';
import { fDateTime } from '../../../../utils/formatTime';
// components
import Iconify from '../../../../components/iconify';
import Scrollbar from '../../../../components/scrollbar';

// ----------------------------------------------------------------------

const indicatorDetails = [
  { id: 1, title: 'Destination Awareness', overallScore: "90.5/100", rank: "60/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 2, title: 'Government Commitment', overallScore: "98.6/100", rank: "12/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 3, title: 'Sarawak Business Event(BE) Brand', overallScore: "77/100", rank: "50/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 4, title: 'Inter-organizational Collaboration', overallScore: "98/100", rank: "3/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 5, title: 'Service Quality and Standards', overallScore: "85.6/100", rank: "42/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 6, title: 'Business Events(BE) Sector Advancement', overallScore: "89.7/100", rank: "31/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 7, title: 'Organization and HR Development', overallScore: "87/100", rank: "65/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 8, title: 'Social Legacy', overallScore: "74/100", rank: "86/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 9, title: 'Environment Conservation', overallScore: "89.3/100", rank: "23/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
  { id: 10, title: 'Community Buy-in', overallScore: "88/100", rank: "21/163", desc: "The overall score measures the total progress towards achieving all 10 BE Indicators. The score can be interpreted as a percentage of BE achievement. A score of 100 indicates that all BEs have been achieved.", performanceDesc: "Average above of 163 area" },
]

ScoringDetailsDrawer.propTypes = {
  open: PropTypes.bool,
  details: PropTypes.object,
  onClose: PropTypes.func,
};

export default function ScoringDetailsDrawer({
  details,
  open,
  onClose,
  ...other
}) {

  const currentDetails = indicatorDetails.find((data) => data.id === details);

  return (
    <>
      <Drawer
        open={open}
        onClose={onClose}
        anchor="right"
        BackdropProps={{
          invisible: true,
        }}
        PaperProps={{
          sx: { width: 320 },
        }}
        {...other}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-around" sx={{ p: 2.5 }}>
            <img src='https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Flag_of_Sarawak.svg/250px-Flag_of_Sarawak.svg.png' alt='MY' width={50} />
            <Typography variant="h6"> Sarawak </Typography>
          </Stack>
          <Divider />
          <Stack sx={{ p: 2.5 }}>
            <Typography variant="h6"> {currentDetails?.title} </Typography>
            {/* <Typography variant='caption'>SDR</Typography> */}
            <Typography variant='subtitle2'>Overall Score</Typography>
          </Stack>
          <Divider />
          <Stack sx={{ p: 2.5 }}>
            <Typography variant='subtitle2'>Score: {currentDetails?.overallScore}</Typography>
            <Typography variant='subtitle2'>Rank: {currentDetails?.rank}</Typography>
          </Stack>
          <Divider />
          <Stack sx={{ p: 2.5 }}>
            <Typography variant='subtitle2'>Description</Typography>
            <Typography variant='caption'> {currentDetails?.desc} </Typography>
          </Stack>
          <Stack sx={{ p: 2.5 }}>
            <Typography variant="subtitle2"> Performance on SDG </Typography>
            <Typography variant="caption"> {currentDetails?.performanceDesc} </Typography>
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}

// ----------------------------------------------------------------------

Panel.propTypes = {
  toggle: PropTypes.bool,
  label: PropTypes.string,
  onToggle: PropTypes.func,
};

function Panel({ label, toggle, onToggle, ...other }) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" {...other}>
      <Typography variant="subtitle2"> {label} </Typography>

      <IconButton size="small" onClick={onToggle}>
        <Iconify icon={toggle ? 'eva:chevron-up-fill' : 'eva:chevron-down-fill'} />
      </IconButton>
    </Stack>
  );
}

// ----------------------------------------------------------------------

Row.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

function Row({ label, value = '' }) {
  return (
    <Stack direction="row" sx={{ typography: 'caption', textTransform: 'capitalize' }}>
      <Box component="span" sx={{ width: 80, color: 'text.secondary', mr: 2 }}>
        {label}
      </Box>

      {value}
    </Stack>
  );
}

