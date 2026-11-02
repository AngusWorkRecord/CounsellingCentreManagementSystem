import { useEffect, useRef, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Container,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import Iconify from '../../components/iconify';
import { useSnackbar } from '../../components/snackbar';
import useResponsive from '../../hooks/useResponsive';
import { currentLocale, tr, useUiLanguage } from '../../locales/translate';
import { domainLabel } from '../../locales/domainLabels';
import {
  peopleService,
  personErrorMessage,
  PERSON_FIELD_MESSAGES,
} from '../../services/peopleService';
import {
  emptyPerson,
  EMPTY_FILTERS,
  filterPeople,
  peopleCsv,
  PERSON_LANGUAGES,
  PERSON_STATUSES,
  PERSON_TYPES,
  validatePerson,
} from '../../sections/counselling-people/peopleModel';

const initials = (name) =>
  name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function CounsellingPeoplePage() {
  useUiLanguage();
  const desktop = useResponsive('up', 'md');
  const { enqueueSnackbar } = useSnackbar();
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [revision, setRevision] = useState(0);
  const inFlight = useRef(false);
  const mounted = useRef(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [direction, setDirection] = useState('asc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [menu, setMenu] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [draft, setDraft] = useState(emptyPerson);
  const [original, setOriginal] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setLoadError(null);
    peopleService
      .list({ signal: controller.signal })
      .then((items) => {
        if (!controller.signal.aborted) setPeople(items);
      })
      .catch((error) => {
        if (!controller.signal.aborted) setLoadError(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [revision]);

  const filtered = filterPeople(people, filters, direction, currentLocale());
  const safePage = Math.min(page, Math.max(0, Math.ceil(filtered.length / pageSize) - 1));
  const visible = filtered.slice(safePage * pageSize, (safePage + 1) * pageSize);
  const errors = submitted ? validatePerson(draft) : {};
  Object.entries(mutationError?.fields || {}).forEach(([key, code]) => {
    if (PERSON_FIELD_MESSAGES[code]) errors[key] = PERSON_FIELD_MESSAGES[code];
  });
  const isEditing = dialog?.mode === 'edit' || dialog?.mode === 'new';
  const notify = (key) => {
    setNotice(key);
    enqueueSnackbar(tr(key), { variant: 'success' });
  };
  const openPerson = (mode, person = emptyPerson()) => {
    if (inFlight.current) return;
    setMutationError(null);
    const copy = { ...person, languages: [...person.languages] };
    setDraft(copy);
    setOriginal(JSON.stringify(copy));
    setSubmitted(false);
    setDialog({ mode });
    setMenu(null);
  };
  const closeDialog = () => {
    if (inFlight.current) return;
    if (isEditing && JSON.stringify(draft) !== original) setConfirmation({ action: 'discard' });
    else setDialog(null);
  };
  const updateDraft = (key, value) => {
    setMutationError(null);
    setDraft((old) => ({ ...old, [key]: value }));
  };
  const updateFilter = (key, value) => {
    setFilters((old) => ({ ...old, [key]: value }));
    setPage(0);
  };
  const save = async (event) => {
    event.preventDefault();
    if (inFlight.current) return;
    setSubmitted(true);
    if (Object.keys(validatePerson(draft)).length) return;
    const person = {
      ...draft,
      name: draft.name.trim(),
      phone: draft.phone.trim(),
      email: draft.email.trim(),
      specialisation: draft.specialisation.trim(),
    };
    inFlight.current = true;
    setBusy(true);
    setMutationError(null);
    setNotice('');
    try {
      const saved =
        dialog.mode === 'new'
          ? await peopleService.create(person)
          : await peopleService.update(person.id, person);
      if (!mounted.current) return;
      if (dialog.mode === 'new') setPeople((old) => [...old, saved]);
      else setPeople((old) => old.map((item) => (item.id === saved.id ? saved : item)));
      setDialog(null);
      notify('Person saved');
    } catch (error) {
      if (mounted.current) setMutationError(error);
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const confirmAction = async () => {
    if (inFlight.current) return;
    const { action, person } = confirmation;
    if (action === 'discard') {
      setDialog(null);
      setConfirmation(null);
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setMutationError(null);
    setNotice('');
    try {
      if (action === 'delete') {
        await peopleService.remove(person.id, person.version);
        if (!mounted.current) return;
        setPeople((old) => old.filter((item) => item.id !== person.id));
        notify('Person deleted');
      } else {
        const saved = await peopleService.setStatus(
          person.id,
          person.status === 'active' ? 'inactive' : 'active',
          person.version
        );
        if (!mounted.current) return;
        setPeople((old) => old.map((item) => (item.id === saved.id ? saved : item)));
        notify('Person status updated');
      }
      setConfirmation(null);
    } catch (error) {
      if (mounted.current) setMutationError(error);
    } finally {
      inFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  const exportCsv = () => {
    const csv = peopleCsv(
      filtered,
      [
        tr('Name'),
        tr('Person type'),
        tr('Phone'),
        tr('Email'),
        tr('Languages'),
        tr('Specialisation / Focus Area'),
        tr('Status'),
      ],
      domainLabel
    );
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'counselling-people.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const identity = (person) => (
    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
      <Avatar sx={{ bgcolor: 'primary.lighter', color: 'primary.darker' }}>
        {initials(person.name)}
      </Avatar>
      <Button
        disabled={busy || loading || !!loadError}
        onClick={() => openPerson('view', person)}
        color="inherit"
        sx={{ textAlign: 'left', justifyContent: 'flex-start', overflowWrap: 'anywhere' }}
      >
        {person.name}
      </Button>
    </Stack>
  );
  const statusChip = (person) => (
    <Chip
      size="small"
      color={person.status === 'active' ? 'success' : 'default'}
      label={domainLabel(person.status)}
    />
  );
  const typeChip = (person) => (
    <Chip
      size="small"
      variant="outlined"
      color={person.type === 'counsellor' ? 'primary' : 'info'}
      label={domainLabel(person.type)}
    />
  );
  const actions = (person) => (
    <IconButton
      disabled={busy || loading || !!loadError}
      aria-label={tr('Actions for {{name}}', { name: person.name })}
      onClick={(event) => setMenu({ anchor: event.currentTarget, person })}
    >
      <Iconify icon="eva:more-horizontal-fill" />
    </IconButton>
  );
  const languageText = (person) => person.languages.map(domainLabel).join(', ') || '—';
  const selectFilter = (key, label, options) => (
    <TextField
      disabled={busy}
      select
      label={tr(label)}
      value={filters[key]}
      onChange={(event) => updateFilter(key, event.target.value)}
      sx={{ minWidth: { xs: 0, sm: 150 }, flex: 1 }}
    >
      <MenuItem value="">{tr('All')}</MenuItem>
      {options.map((value) => (
        <MenuItem key={value} value={value}>
          {domainLabel(value)}
        </MenuItem>
      ))}
    </TextField>
  );
  const confirmationTitle = () => {
    if (confirmation?.action === 'discard') return tr('Discard unsaved changes?');
    if (confirmation?.action === 'delete') return tr('Delete this person?');
    return tr('Change person status?');
  };
  const dialogTitle = () => {
    if (dialog?.mode === 'new') return tr('Add New Person');
    return isEditing ? tr('Edit person') : tr('View person details');
  };
  const confirmationText = () => {
    if (confirmation?.action === 'discard') return tr('Your unsaved changes will be lost.');
    const name = confirmation?.person.name;
    if (confirmation?.action === 'delete')
      return tr('Delete {{name}}? This cannot be undone.', { name });
    if (confirmation?.person.status === 'active')
      return tr('Deactivate {{name}}? Their details will be retained.', { name });
    return tr('Reactivate {{name}}?', { name });
  };

  return (
    <>
      <Helmet>
        <title>{tr('Counsellor & Volunteer Management')}</title>
      </Helmet>
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            spacing={2}
            alignItems={{ sm: 'center' }}
          >
            <Box>
              <Typography variant="h4">{tr('Counsellor & Volunteer Directory')}</Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {tr('Manage counsellors and counselling volunteers')}
              </Typography>
            </Box>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                disabled={busy || loading || !!loadError}
                startIcon={<Iconify icon="eva:plus-fill" />}
                onClick={() => openPerson('new')}
              >
                {tr('Add New Person')}
              </Button>
              <Button
                variant="outlined"
                disabled={!filtered.length || busy || loading || !!loadError}
                startIcon={<Iconify icon="eva:download-outline" />}
                onClick={exportCsv}
              >
                {tr('Export CSV')}
              </Button>
              <Button
                variant="outlined"
                disabled={busy || loading}
                onClick={() => {
                  setMenu(null);
                  setRevision((old) => old + 1);
                }}
              >
                {tr('Reload directory')}
              </Button>
            </Stack>
          </Stack>
          {loading && (
            <Stack direction="row" spacing={2} alignItems="center" role="status">
              <CircularProgress size={22} />
              <Typography>{tr('Loading personnel...')}</Typography>
            </Stack>
          )}
          {loadError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" onClick={() => setRevision((old) => old + 1)}>
                  {tr('Retry')}
                </Button>
              }
            >
              {tr(personErrorMessage(loadError))}
            </Alert>
          )}
          {mutationError && !dialog && !confirmation && (
            <Alert severity="error">{tr(personErrorMessage(mutationError))}</Alert>
          )}
          {notice && (
            <Alert severity="success" onClose={() => setNotice('')}>
              {tr(notice)}
            </Alert>
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {[
              [
                'Total Counsellors',
                people.filter((p) => p.type === 'counsellor').length,
                'eva:people-fill',
                'primary',
              ],
              [
                'Total Volunteers',
                people.filter((p) => p.type === 'volunteer').length,
                'eva:heart-fill',
                'info',
              ],
              [
                'Active personnel',
                people.filter((p) => p.status === 'active').length,
                'eva:checkmark-circle-2-fill',
                'success',
              ],
              [
                'Inactive personnel',
                people.filter((p) => p.status === 'inactive').length,
                'eva:pause-circle-fill',
                'warning',
              ],
            ].map(([label, count, icon, color]) => (
              <Card
                key={label}
                sx={{
                  p: { xs: 2, md: 3 },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: `${color}.lighter`,
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: `${color}.light`,
                    color: `${color}.dark`,
                    display: { xs: 'none', sm: 'flex' },
                  }}
                >
                  <Iconify icon={icon} />
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                    {tr(label)}
                  </Typography>
                  <Typography variant="h3">
                    {loading || loadError ? '—' : count.toLocaleString(currentLocale())}
                  </Typography>
                </Box>
              </Card>
            ))}
          </Box>
          <Card sx={{ overflow: 'hidden' }}>
            <Stack spacing={2} sx={{ p: 2.5 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  disabled={busy}
                  fullWidth
                  label={tr('Search by name, email or contact no.')}
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Iconify icon="eva:search-fill" />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  sx={{ flexShrink: 0 }}
                  onClick={() => {
                    setFilters(EMPTY_FILTERS);
                    setPage(0);
                  }}
                >
                  {tr('Clear filters')}
                </Button>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {selectFilter('type', 'Person type', PERSON_TYPES)}
                {selectFilter('language', 'Languages', PERSON_LANGUAGES)}
                {selectFilter('status', 'Status', PERSON_STATUSES)}
                <Button
                  onClick={() => {
                    setDirection((old) => (old === 'asc' ? 'desc' : 'asc'));
                    setPage(0);
                  }}
                  startIcon={<Iconify icon="eva:swap-fill" />}
                >
                  {direction === 'asc' ? tr('Name: ascending') : tr('Name: descending')}
                </Button>
              </Stack>
            </Stack>
            {!loading && !loadError && !filtered.length && (
              <Box sx={{ p: 6, textAlign: 'center' }}>
                <Iconify
                  icon="eva:people-outline"
                  width={48}
                  sx={{ color: 'text.disabled', mb: 2 }}
                />
                <Typography>
                  {tr('No people found. Add a person or adjust your filters.')}
                </Typography>
              </Box>
            )}
            {!loading &&
              !loadError &&
              !!filtered.length &&
              (desktop ? (
                <TableContainer>
                  <Table
                    aria-label={tr('Counsellor & Volunteer Directory')}
                    sx={{ '& td': { overflowWrap: 'anywhere' } }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell sortDirection={direction}>
                          <TableSortLabel
                            active
                            direction={direction}
                            onClick={() => {
                              setDirection(direction === 'asc' ? 'desc' : 'asc');
                              setPage(0);
                            }}
                          >
                            {tr('Name')}
                          </TableSortLabel>
                        </TableCell>
                        {[
                          'Person type',
                          'Phone',
                          'Email',
                          'Languages',
                          'Specialisation / Focus Area',
                          'Status',
                          'Actions',
                        ].map((label) => (
                          <TableCell key={label}>{tr(label)}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {visible.map((person) => (
                        <TableRow hover key={person.id}>
                          <TableCell sx={{ minWidth: 180 }}>{identity(person)}</TableCell>
                          <TableCell>{typeChip(person)}</TableCell>
                          <TableCell>{person.phone || '—'}</TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>{person.email || '—'}</TableCell>
                          <TableCell>{languageText(person)}</TableCell>
                          <TableCell sx={{ maxWidth: 220 }}>
                            {person.specialisation || '—'}
                          </TableCell>
                          <TableCell>{statusChip(person)}</TableCell>
                          <TableCell>{actions(person)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
                  {visible.map((person) => (
                    <Card
                      variant="outlined"
                      key={person.id}
                      sx={{ p: 2, boxShadow: 'none', overflowWrap: 'anywhere' }}
                    >
                      <Stack direction="row" alignItems="center" justifyContent="space-between">
                        {identity(person)}
                        {actions(person)}
                      </Stack>
                      <Stack direction="row" spacing={1} sx={{ my: 2 }}>
                        {typeChip(person)}
                        {statusChip(person)}
                      </Stack>
                      {[
                        [tr('Phone'), person.phone],
                        [tr('Email'), person.email],
                        [tr('Languages'), languageText(person)],
                        [tr('Specialisation / Focus Area'), person.specialisation],
                      ].map(([label, value]) => (
                        <Typography key={label} variant="body2" sx={{ mt: 1 }}>
                          <Box component="span" sx={{ color: 'text.secondary' }}>
                            {label}:{' '}
                          </Box>
                          {value || '—'}
                        </Typography>
                      ))}
                    </Card>
                  ))}
                </Stack>
              ))}
            <TablePagination
              component="div"
              count={filtered.length}
              page={safePage}
              onPageChange={(_, next) => setPage(next)}
              rowsPerPage={pageSize}
              rowsPerPageOptions={[5, 10, 25]}
              onRowsPerPageChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(0);
              }}
              sx={{
                '& .MuiTablePagination-toolbar': {
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                  pl: 1,
                },
                '& .MuiTablePagination-spacer': { display: 'none' },
              }}
            />
          </Card>
        </Stack>
      </Container>
      <Menu anchorEl={menu?.anchor} open={!!menu} onClose={() => setMenu(null)}>
        <MenuItem onClick={() => openPerson('view', menu.person)}>
          {tr('View person details')}
        </MenuItem>
        <MenuItem onClick={() => openPerson('edit', menu.person)}>{tr('Edit person')}</MenuItem>
        <MenuItem
          onClick={() => {
            setConfirmation({ action: 'status', person: menu.person });
            setMenu(null);
          }}
        >
          {menu?.person.status === 'active' ? tr('Deactivate person') : tr('Reactivate person')}
        </MenuItem>
        <MenuItem
          sx={{ color: 'error.main' }}
          onClick={() => {
            setConfirmation({ action: 'delete', person: menu.person });
            setMenu(null);
          }}
        >
          {tr('Delete person')}
        </MenuItem>
      </Menu>
      <Dialog open={!!dialog} onClose={closeDialog} fullWidth maxWidth="sm" fullScreen={!desktop}>
        <Box
          component="form"
          onSubmit={save}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}
        >
          <DialogTitle>{dialogTitle()}</DialogTitle>
          <DialogContent dividers>
            {mutationError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {tr(personErrorMessage(mutationError))}
              </Alert>
            )}
            <Box component="fieldset" disabled={busy} sx={{ border: 0, p: 0, m: 0, minWidth: 0 }}>
              {isEditing ? (
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                  <TextField
                    disabled={busy}
                    autoFocus
                    required
                    label={tr('Person name')}
                    inputProps={{ maxLength: 100 }}
                    value={draft.name}
                    onChange={(e) => updateDraft('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name ? tr(errors.name) : ''}
                  />
                  <TextField
                    disabled={busy}
                    select
                    required
                    label={tr('Person type')}
                    value={draft.type}
                    onChange={(e) => updateDraft('type', e.target.value)}
                    error={!!errors.type}
                    helperText={errors.type ? tr(errors.type) : ''}
                  >
                    {PERSON_TYPES.map((value) => (
                      <MenuItem key={value} value={value}>
                        {domainLabel(value)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant="caption" color="text.secondary">
                    {tr('Provide at least one contact method: phone or email.')}
                  </Typography>
                  <TextField
                    disabled={busy}
                    label={tr('Phone')}
                    type="tel"
                    inputProps={{ maxLength: 50 }}
                    value={draft.phone}
                    onChange={(e) => updateDraft('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone ? tr(errors.phone) : ''}
                  />
                  <TextField
                    disabled={busy}
                    label={tr('Email')}
                    type="email"
                    inputProps={{ maxLength: 254 }}
                    value={draft.email}
                    onChange={(e) => updateDraft('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email ? tr(errors.email) : ''}
                  />
                  <TextField
                    disabled={busy}
                    select
                    label={tr('Languages')}
                    error={!!errors.languages}
                    helperText={errors.languages ? tr(errors.languages) : ''}
                    value={draft.languages}
                    SelectProps={{
                      multiple: true,
                      renderValue: (selected) => selected.map(domainLabel).join(', '),
                    }}
                    onChange={(e) =>
                      updateDraft(
                        'languages',
                        typeof e.target.value === 'string'
                          ? e.target.value.split(',')
                          : e.target.value
                      )
                    }
                  >
                    {PERSON_LANGUAGES.map((value) => (
                      <MenuItem key={value} value={value}>
                        {domainLabel(value)}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    disabled={busy}
                    multiline
                    minRows={3}
                    label={tr('Specialisation / Focus Area')}
                    inputProps={{ maxLength: 2000 }}
                    error={!!errors.specialisation}
                    helperText={errors.specialisation ? tr(errors.specialisation) : ''}
                    value={draft.specialisation}
                    onChange={(e) => updateDraft('specialisation', e.target.value)}
                  />
                  <Box>
                    <Typography variant="caption" sx={{ mr: 1 }}>
                      {tr('Status')}
                    </Typography>
                    {statusChip(draft)}
                  </Box>
                </Stack>
              ) : (
                <Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
                  {identity(draft)}
                  <Stack direction="row" spacing={1}>
                    {typeChip(draft)}
                    {statusChip(draft)}
                  </Stack>
                  {[
                    [tr('Phone'), draft.phone],
                    [tr('Email'), draft.email],
                    [tr('Languages'), languageText(draft)],
                    [tr('Specialisation / Focus Area'), draft.specialisation],
                  ].map(([label, value]) => (
                    <Box key={label}>
                      <Typography variant="caption" color="text.secondary">
                        {label}
                      </Typography>
                      <Typography sx={{ whiteSpace: 'pre-wrap' }}>{value || '—'}</Typography>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, flexWrap: 'wrap', gap: 1 }}>
            <Button disabled={busy} onClick={closeDialog}>
              {isEditing ? tr('Cancel') : tr('Close')}
            </Button>
            {isEditing ? (
              <Button disabled={busy} type="submit" variant="contained">
                {tr('Save person')}
              </Button>
            ) : (
              <Button variant="contained" onClick={() => openPerson('edit', draft)}>
                {tr('Edit person')}
              </Button>
            )}
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog
        open={!!confirmation}
        onClose={() => {
          if (!inFlight.current) setConfirmation(null);
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>{confirmationTitle()}</DialogTitle>
        <DialogContent>
          {mutationError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {tr(personErrorMessage(mutationError))}
            </Alert>
          )}
          <Typography sx={{ overflowWrap: 'anywhere' }}>{confirmationText()}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={busy}
            onClick={() => {
              setMutationError(null);
              setConfirmation(null);
            }}
          >
            {tr('Cancel')}
          </Button>
          <Button
            variant="contained"
            color={confirmation?.action === 'status' ? 'primary' : 'error'}
            onClick={confirmAction}
            disabled={busy}
          >
            {tr('Confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
