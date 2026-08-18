import PropTypes from 'prop-types';
import { Card, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { valueOrDash } from './utils';

export default function CaseTextCard({ icon, title, children }) {
  return (
    <Card sx={{ p: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <Iconify icon={icon} width={22} sx={{ color: 'primary.main' }} />
        <Typography variant="h6">{title}</Typography>
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
        {valueOrDash(children)}
      </Typography>
    </Card>
  );
}

CaseTextCard.propTypes = {
  children: PropTypes.node,
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
};
