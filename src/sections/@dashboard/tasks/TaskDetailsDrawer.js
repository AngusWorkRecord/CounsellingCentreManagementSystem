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
import { fData } from '../../../utils/formatNumber';
import { fDateTime } from '../../../utils/formatTime';
// components
import Iconify from '../../../components/iconify';
import Scrollbar from '../../../components/scrollbar';
// import FileThumbnail, { fileFormat } from '../../../../components/file-thumbnail';
//
import TaskInviteDialog from './TaskInviteDialog';
import TaskInvitedItem from './TaskInvitedItem';

// ----------------------------------------------------------------------

TaskDetailsDrawer.propTypes = {
  open: PropTypes.bool,
  item: PropTypes.object,
  users: PropTypes.object,
  category: PropTypes.object,
  onClose: PropTypes.func,
  onDelete: PropTypes.func,
  favorited: PropTypes.bool,
  onCopyLink: PropTypes.func,
  onFavorite: PropTypes.func,
  onClickAssignTask: PropTypes.func,
};

export default function TaskDetailsDrawer({
  item,
  open,
  users,
  category,
  favorited,
  onFavorite,
  onCopyLink,
  onClose,
  onDelete,
  onClickAssignTask,
  ...other
}) {
  const { name, size, url, type, EditorList, dateModified, PaperFile } = item;

  const hasShared = EditorList && !!JSON.parse(EditorList).length;

  const [openShare, setOpenShare] = useState(false);

  const [toggleTags, setToggleTags] = useState(true);

  const [inviteEmail, setInviteEmail] = useState('');

  const [PaperKeyword, setTags] = useState('');

  const [toggleProperties, setToggleProperties] = useState(true);

  const handleToggleTags = () => {
    setToggleTags(!toggleTags);
  };

  const handleToggleProperties = () => {
    setToggleProperties(!toggleProperties);
  };

  const handleOpenShare = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  const handleChangeInvite = (event) => {
    setInviteEmail(event.target.value);
  };

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
          sx: { width: 500 },
        }}
        {...other}
      >
        <Scrollbar sx={{ height: 1 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="h6"> Manuscript Information </Typography>

            {/* <Checkbox
              color="warning"
              icon={<Iconify icon="eva:star-outline" />}
              checkedIcon={<Iconify icon="eva:star-fill" />}
              checked={favorited}
              onChange={onFavorite}
              sx={{ p: 0.75 }}
            /> */}
          </Stack>

          <Stack
            spacing={2.5}
            justifyContent="center"
            sx={{ p: 2.5, bgcolor: 'background.neutral' }}
          >
            <ListItemText
              primary={item.PaperTitle}
              secondary={
                <Tooltip title={item.PaperManuscriptID}>
                  <span>{item.PaperManuscriptID}</span>
                </Tooltip>
              }
              primaryTypographyProps={{ noWrap: true, typography: 'subtitle2' }}
              secondaryTypographyProps={{ noWrap: true, fontSize: '0.8rem' }}
              sx={{ flexGrow: 1, pr: 1 }}
            />
            <Divider sx={{ borderStyle: 'dashed' }} />

            <Stack spacing={1}>
              <Panel label="Category" toggle={toggleTags} onToggle={handleToggleTags} />

              {toggleTags && (
                <Autocomplete
                  multiple
                  freeSolo
                  limitTags={2}
                  options={category.map((option) => option.ExpertiseName)}
                  value={item ? JSON.parse(item.PaperCategoryinArr) : []}
                  onChange={(event, newValue) => {
                    setTags([
                      ...item.PaperCategory,
                      ...newValue.filter(
                        (option) => item.PaperCategory.indexOf(option.ExpertiseName) === -1
                      ),
                    ]);
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        size="small"
                        variant="soft"
                        label={option}
                        key={option}
                      />
                    ))
                  }
                  renderInput={(params) => <TextField {...params} placeholder="#Add a category" />}
                />
              )}
            </Stack>

            <Stack spacing={1.5}>
              <Panel
                label="Properties"
                toggle={toggleProperties}
                onToggle={handleToggleProperties}
              />

              {toggleProperties && (
                <Stack spacing={1.2}>
                  <Row label="Type" value={item.PaperType} />
                  <Row label="Submission" value={item.SubmissionDate} />
                  <Row label="Status" value={item.PaperStatus} />
                  <Row label="Abstract" value={item.PaperAbstract} />
                  <Row label="Methodology" value={item.PaperMethodology} />
                  <Row label="Keywords" value={item.PaperKeyword} />
                  <Row
                    label="File"
                    value={
                      PaperFile &&
                      JSON.parse(PaperFile).map((row) => (
                        <Button
                          variant="contained"
                          size="small"
                          sx={{ margin: 0.5 }}
                          onClick={() => window.open(row.PaperFileURL, '_blank')}
                          startIcon={<Iconify icon="material-symbols:file-present-outline" />}
                        >
                          {row.PaperFileDesignation}
                        </Button>
                      ))
                    }
                  />
                  {/* <Row label="Type" value={fileFormat(type)} /> */}
                </Stack>
              )}
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 2.5 }}>
            <Typography variant="subtitle2"> Task Assign To </Typography>

            <IconButton
              size="small"
              color="success"
              onClick={handleOpenShare}
              sx={{
                p: 0,
                width: 24,
                height: 24,
                color: 'common.white',
                bgcolor: 'success.main',
                '&:hover': {
                  bgcolor: 'success.main',
                },
              }}
            >
              <Iconify icon="eva:plus-fill" />
            </IconButton>
          </Stack>

          {hasShared && (
            <List disablePadding sx={{ pl: 2.5, pr: 1 }}>
              {JSON.parse(item.EditorList).map((person) => {
                console.log();
                return <TaskInvitedItem key={person.UserID} person={person} />;
              })}
            </List>
          )}
        </Scrollbar>

        {/* <Box sx={{ p: 2.5 }}>
          <Button
            fullWidth
            variant="soft"
            color="error"
            size="large"
            startIcon={<Iconify icon="eva:trash-2-outline" />}
            onClick={onDelete}
          >
            Delete
          </Button>
        </Box> */}
      </Drawer>

      <TaskInviteDialog
        paper={item}
        open={openShare}
        shared={users}
        inviteEmail={inviteEmail}
        onChangeInvite={handleChangeInvite}
        onClickAssignTask={onClickAssignTask}
        onCopyLink={onCopyLink}
        onClose={() => {
          handleCloseShare();
          setInviteEmail('');
        }}
      />
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

