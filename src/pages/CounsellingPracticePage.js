import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Alert, Box, Button, Card, Checkbox, Container, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Tab, Tabs, Typography } from '@mui/material';
import i18n from '../locales/i18n';
import { tr, useUiLanguage } from '../locales/translate';
import { domainLabel } from '../locales/domainLabels';
import PracticeForm from '../sections/counselling-practice/PracticeForm';
import PracticeFeedback from '../sections/counselling-practice/PracticeFeedback';
import usePractice from '../sections/counselling-practice/usePractice';
import { examples, exportText } from '../sections/counselling-practice/model';

export default function CounsellingPracticePage() {
  const language = useUiLanguage();
  const practice = usePractice(language);
  const [tab, setTab] = useState(0);
  const [confirmation, setConfirmation] = useState(null);
  const { hasContent } = practice;
  const execute = (action) => {
    if (action === 'clear') practice.clear();
    else practice.replaceRecord(examples[language]);
    setConfirmation(null);
    setTab(0);
  };
  const confirmAction = (action) => hasContent ? setConfirmation(action) : execute(action);
  const download = () => {
    const text = exportText(practice.record, practice.feedback, tr, (value) => value ? domainLabel(value) : '');
    const url = URL.createObjectURL(new Blob(['\uFEFF', text], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'counselling-practice.txt';
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const generate = async (event) => {
    event.preventDefault();
    if (!practice.record.summary.trim()) { practice.run(); setTab(0); return; }
    setTab(1);
    await practice.run();
  };
  return <Box sx={{ minHeight: '100vh', bgcolor: 'background.neutral', pb: 6 }}>
    <Helmet><title>{tr('Counselling Practice')}</title></Helmet>
    <Box component="header" sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', py: 2 }}>
      <Container maxWidth="xl"><Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
        <Typography variant="subtitle1">{tr('Counselling Practice')}</Typography>
        <Stack direction="row" spacing={0.5}>
          <Button lang="zh-CN" size="small" aria-pressed={language === 'cn'} variant={language === 'cn' ? 'contained' : 'text'} onClick={() => i18n.changeLanguage('cn')}>华文</Button>
          <Button lang="en" size="small" aria-pressed={language === 'en'} variant={language === 'en' ? 'contained' : 'text'} onClick={() => i18n.changeLanguage('en')}>English</Button>
        </Stack>
      </Stack></Container>
    </Box>
    <Container maxWidth="xl" sx={{ pt: { xs: 3, md: 5 }, overflowWrap: 'anywhere' }}>
      <Typography variant="overline" color="primary.main">{tr('Reflect. Explore. Prepare.')}</Typography>
      <Typography component="h1" variant="h3" sx={{ mt: 1, mb: 1 }}>{tr('Prepare for your next counselling session')}</Typography>
      <Typography color="text.secondary" sx={{ maxWidth: 760, mb: 3 }}>{tr('Record a fictional or de-identified session and use AI feedback to support your learning and discussion with a supervisor.')}</Typography>
      <Alert severity="info" sx={{ mb: 3 }}>{tr('Records are kept only while this page is open. Refreshing or leaving clears them. Do not enter names, contact details or other identifying information. Submitted text is sent to an external AI service; its data handling policies apply.')}</Alert>
      <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={() => confirmAction('example')}>{tr('Load fictional example')}</Button>
        <Button variant="outlined" disabled={!hasContent} onClick={download}>{tr('Export record and feedback')}</Button>
        <Button color="inherit" disabled={!hasContent && !practice.loading} onClick={() => confirmAction('clear')}>{tr('Clear practice')}</Button>
      </Stack>
      <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="fullWidth" sx={{ display: { md: 'none' }, mb: 2 }} aria-label={tr('Practice panels')}>
        <Tab id="practice-record-tab" aria-controls="practice-record" label={tr('Case record')} />
        <Tab id="practice-feedback-tab" aria-controls="practice-feedback" label={tr('AI feedback')} />
      </Tabs>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1.05fr) minmax(0, 1fr)' }, gap: 3, alignItems: 'start' }}>
        <Card id="practice-record" component="form" noValidate onSubmit={generate} sx={{ p: { xs: 2, sm: 3 }, display: { xs: tab === 0 ? 'block' : 'none', md: 'block' }, minWidth: 0 }}>
          <PracticeForm record={practice.record} onChange={practice.setRecord} errors={practice.errors} />
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <FormControlLabel sx={{ alignItems: 'flex-start' }} control={<Checkbox checked={practice.confirmed} onChange={(event) => practice.setConfirmed(event.target.checked)} />} label={<Typography variant="body2" sx={{ pt: 1 }}>{tr('I confirm this record is fictional or de-identified and understand that it will be sent to an AI service.')}</Typography>} />
            <Button fullWidth type="submit" variant="contained" size="large" disabled={!practice.confirmed || practice.loading} sx={{ mt: 2 }}>{tr('Generate AI feedback')}</Button>
          </Box>
        </Card>
        <Card id="practice-feedback" sx={{ p: { xs: 2, sm: 3 }, minWidth: 0, display: { xs: tab === 1 ? 'block' : 'none', md: 'block' } }}>
          <PracticeFeedback feedback={practice.feedback} stale={practice.stale} loading={practice.loading} error={practice.error} />
          {practice.loading && <Button onClick={practice.cancel} sx={{ mt: 2 }}>{tr('Cancel')}</Button>}
          {practice.error && <Button onClick={() => { setTab(0); }} sx={{ mt: 2 }}>{tr('Return to record and retry')}</Button>}
        </Card>
      </Box>
    </Container>
    <Dialog open={Boolean(confirmation)} onClose={() => setConfirmation(null)} fullWidth maxWidth="xs">
      <DialogTitle>{tr(confirmation === 'clear' ? 'Clear this practice?' : 'Replace this record with an example?')}</DialogTitle>
      <DialogContent>{tr(confirmation === 'clear' ? 'The record and all cached feedback will be removed. Export anything you want to keep first.' : 'Your current input will be replaced by a fictional case in the selected language.')}</DialogContent>
      <DialogActions><Button onClick={() => setConfirmation(null)}>{tr('Cancel')}</Button><Button variant="contained" onClick={() => execute(confirmation)}>{tr('Confirm')}</Button></DialogActions>
    </Dialog>
  </Box>;
}
