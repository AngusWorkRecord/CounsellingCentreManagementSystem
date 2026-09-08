import PropTypes from 'prop-types';
// @mui
import { Avatar, Chip, Stack, Paper } from '@mui/material';
import { tr, useUiLanguage } from '../../../locales/translate';
// _mock
import _mock from '../../../_mock';
// components
import Iconify from '../../../components/iconify';
//
import { Label } from '../Block';

// ----------------------------------------------------------------------

const style = {
  p: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexWrap: 'wrap',
  '& > *': { m: '8px !important' },
};

// ----------------------------------------------------------------------

Chips.propTypes = {
  variant: PropTypes.string,
};

export default function Chips({ variant = 'filled' }) {
  useUiLanguage();
  const handleDelete = () => {
    console.info('You clicked the delete icon.');
  };

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={style}>
        <Chip
          variant={variant}
          label={tr("Default deletable")}
          avatar={<Avatar>M</Avatar>}
          onDelete={handleDelete}
        />

        <Chip variant={variant} clickable label={tr("Default clickable")} avatar={<Avatar>M</Avatar>} />

        <Chip
          variant={variant}
          label={tr("Primary deletable")}
          avatar={<Avatar alt="Natacha" src={_mock.image.avatar(1)} />}
          color="primary"
          onDelete={handleDelete}
        />

        <Chip
          variant={variant}
          clickable
          label={tr("Primary clickable")}
          avatar={<Avatar alt="Natacha" src={_mock.image.avatar(1)} />}
          color="primary"
        />

        <Chip
          variant={variant}
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Secondary deletable")}
          onDelete={handleDelete}
          color="secondary"
        />

        <Chip
          variant={variant}
          clickable
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Secondary clickable")}
          color="secondary"
        />

        <Chip
          variant={variant}
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Info deletable")}
          onDelete={handleDelete}
          color="info"
        />

        <Chip
          variant={variant}
          clickable
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Info clickable")}
          color="info"
        />

        <Chip
          variant={variant}
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Success deletable")}
          onDelete={handleDelete}
          color="success"
        />

        <Chip
          variant={variant}
          clickable
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Success clickable")}
          color="success"
        />

        <Chip
          variant={variant}
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Warning deletable")}
          onDelete={handleDelete}
          color="warning"
        />

        <Chip
          variant={variant}
          clickable
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Warning clickable")}
          color="warning"
        />

        <Chip
          variant={variant}
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Error deletable")}
          onDelete={handleDelete}
          color="error"
        />

        <Chip
          clickable
          variant={variant}
          icon={<Iconify width={24} icon="eva:smiling-face-fill" />}
          label={tr("Error clickable")}
          color="error"
        />
      </Paper>

      <div>
        <Label title={tr("Custom icon")} />

        <Paper variant="outlined" sx={style}>
          <Chip
            variant={variant}
            avatar={<Avatar>M</Avatar>}
            label={tr("Custom icon")}
            onDelete={handleDelete}
            deleteIcon={<Iconify width={24} icon="eva:checkmark-fill" />}
          />

          <Chip
            variant={variant}
            avatar={<Avatar>M</Avatar>}
            label={tr("Custom icon")}
            onDelete={handleDelete}
            deleteIcon={<Iconify width={24} icon="eva:checkmark-fill" />}
            color="info"
          />
        </Paper>
      </div>

      <div>
        <Label title={tr("Disabled")} />

        <Paper variant="outlined" sx={style}>
          <Chip
            disabled
            variant={variant}
            avatar={<Avatar>M</Avatar>}
            label={tr("Disabled")}
            onDelete={handleDelete}
          />

          <Chip
            disabled
            variant={variant}
            avatar={<Avatar>M</Avatar>}
            label={tr("Disabled")}
            onDelete={handleDelete}
            color="info"
          />
        </Paper>
      </div>

      <div>
        <Label title={tr("Size")} />

        <Paper variant="outlined" sx={style}>
          <Chip
            variant={variant}
            avatar={<Avatar>M</Avatar>}
            label={tr("Normal")}
            onDelete={handleDelete}
            color="info"
          />

          <Chip
            variant={variant}
            size="small"
            avatar={<Avatar>M</Avatar>}
            label={tr("Small")}
            onDelete={handleDelete}
            color="info"
          />
        </Paper>
      </div>
    </Stack>
  );
}
