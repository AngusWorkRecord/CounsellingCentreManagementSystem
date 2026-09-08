import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Divider, Stack, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material';
import { useUiLanguage, tr, currentLocale } from '../../../../../locales/translate';
import { domainLabel } from '../../../../../locales/domainLabels';
import Iconify from '../../../../../components/iconify';
import { generateCaseAdvice, getCaseAdvice } from '../../../../../services/aiAnalysisService';
import useAiAnalysis from '../../useAiAnalysis';

const CRISIS_SIGNALS = [
  // 中文原文标签：自伤或自杀风险线索、伤害他人风险线索、虐待或暴力风险线索、失联或失踪风险线索
  { get label() { return tr("Self-harm or Suicide Risk Indicator"); }, pattern: /自杀|轻生|不想活|结束生命|伤害自己|自残|割腕|suicid|self[- ]?harm|kill myself/i },
  { get label() { return tr("Risk Indicator for Harm to Others"); }, pattern: /杀死|杀人|伤害他人|报复|袭击|攻击他人|harm (him|her|them)|kill (him|her|them)/i },
  { get label() { return tr("Abuse or Violence Risk Indicator"); }, pattern: /虐待|家暴|暴力|性侵|侵犯|殴打|威胁|abuse|domestic violence|sexual assault/i },
  { get label() { return tr("Missing or Unreachable Person Risk Indicator"); }, pattern: /失联|失踪|联系不上|下落不明|missing person|cannot be reached/i },
];
const ACTION_MARKERS = {
  followUp: /跟进|复诊|回访|再次联系|follow[- ]?up|check in/i,
  timing: /今天|明天|本周|下周|小时|日期|日前|期限|today|tomorrow|this week|next week|within|by \d/i,
  owner: /辅导员|志工|主管|负责人|家属|counsellor|volunteer|supervisor|person in charge/i,
  referral: /转介|医院|诊所|社工|心理师|精神科|紧急服务|refer|hospital|clinic|emergency/i,
};
const LEVEL_META = {
  // 中文原文：需要立即人工复核、需要补充／复核、一般复核、未见即时线索、需要复核、资料不足
  immediate_review: { get label() { return tr("Immediate Human Review Required"); }, color: 'error' },
  review: { get label() { return tr("Additional Information or Review Required"); }, color: 'warning' }, routine: { get label() { return tr("Routine Review"); }, color: 'success' },
  no_immediate_signal: { get label() { return tr("No Immediate Indicator Found"); }, color: 'success' }, needs_review: { get label() { return tr("Review Required"); }, color: 'warning' },
  needs_prompt_review: { get label() { return tr("Immediate Human Review Required"); }, color: 'error' }, insufficient_data: { get label() { return tr("Insufficient Data"); }, color: 'default' },
};

function cleanText(value) { return typeof value === 'string' ? value.trim() : ''; }

function analyseCase(summaryValue, actionsValue) {
  const summary = cleanText(summaryValue);
  const actions = cleanText(actionsValue);
  const crisisSignals = CRISIS_SIGNALS.filter((signal) => signal.pattern.test(`${summary}\n${actions}`));
  const dataGaps = [];
  const recommendations = [];
  // 中文原文：尚未填写案主自述摘要；摘要较简短；尚未记录志工处理步骤
  if (!summary) dataGaps.push(tr("The client statement summary has not been completed, so the primary concerns cannot be assessed."));
  else if (summary.length < 30) dataGaps.push(tr("The client statement summary is brief. Confirm the main concern, its impact, and the assistance expected."));
  if (!actions) dataGaps.push(tr("Volunteer actions have not been recorded, so completed actions cannot be confirmed."));
  else {
    if (!ACTION_MARKERS.followUp.test(actions)) dataGaps.push(tr("The actions do not clearly state whether follow-up is required."));
    if (!ACTION_MARKERS.timing.test(actions)) dataGaps.push(tr("The actions do not include a clear time or completion deadline."));
    if (!ACTION_MARKERS.owner.test(actions)) dataGaps.push(tr("The person responsible for the follow-up action is not specified."));
  }
  if (crisisSignals.length) {
    recommendations.push(tr("Have an authorised counsellor immediately review the original record and use the organisation’s crisis SOP to determine whether escalation is required."));
    recommendations.push(tr("Manually confirm how current and specific the indicators are, along with protective factors and actions already taken."));
  }
  if (summary && actions) recommendations.push(tr("Check whether the recorded actions address the main concerns in the summary and document any outstanding items."));
  if (!ACTION_MARKERS.followUp.test(actions)) recommendations.push(tr("Have the counsellor decide whether follow-up is required and record the owner, method, and timing."));
  if (ACTION_MARKERS.referral.test(actions)) recommendations.push(tr("Manually confirm whether referral or escalation arrangements were completed and record the outcome."));
  if (!recommendations.length) recommendations.push(tr("Have the counsellor review consistency between the summary and actions and confirm whether further follow-up is required."));
  let level = 'routine';
  if (dataGaps.length) level = 'review';
  if (crisisSignals.length) level = 'immediate_review';
  return { level, crisisSignals, dataGaps, recommendations };
}

function NumberedItems({ items, getText }) {
  const uiLanguage = useUiLanguage();
  return (
    <Stack spacing={1}>
      {items.map((item, index) => {
        const text = getText(item);
        return (
          <Stack key={`${index}-${text}`} direction="row" spacing={1} alignItems="flex-start">
            <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'grid', placeItems: 'center', typography: 'caption', flexShrink: 0 }}>{index + 1}</Box>
            <Typography variant="body2" sx={{ lineHeight: 1.7, overflowWrap: 'anywhere' }}>{text}</Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
NumberedItems.propTypes = { items: PropTypes.array.isRequired, getText: PropTypes.func.isRequired };

export default function CaseAiTip({ session }) {
  const uiLanguage = useUiLanguage();
  const language = useUiLanguage();
  const general = useMemo(() => analyseCase(session.client_summary, session.volunteer_actions, uiLanguage), [session.client_summary, session.volunteer_actions, uiLanguage]);
  const scopeKey = `${session.id}:${session.updated_at || ''}`;
  const loadLatest = useCallback((options) => getCaseAdvice(session.id, { ...options, language }), [session.id, language]);
  const generate = useCallback((options) => generateCaseAdvice(session.id, { ...options, language }), [session.id, language]);
  const ai = useAiAnalysis({ generate, loadLatest, scopeKey: `${scopeKey}:${language}` });
  const result = ai.analysis?.result;
  const hasInput = Boolean(cleanText(session.client_summary) || cleanText(session.volunteer_actions));
  const level = LEVEL_META[ai.mode === 'general' ? general.level : result?.riskLevel || 'insufficient_data'];

  return (
    <Card sx={{ p: 3, minWidth: 0, minHeight: 0, height: { md: '100%' }, display: 'flex', flexDirection: 'column' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:flash-fill" width={22} sx={{ color: 'secondary.main' }} />
          <Box><Typography variant="h6">{tr("Case Support Recommendations")}</Typography><Chip label={level.label} color={level.color} size="small" sx={{ mt: 0.5 }} /></Box>
        </Stack>
        <ToggleButtonGroup exclusive size="small" value={ai.mode} onChange={(_, value) => value && ai.setMode(value)}>
          <ToggleButton value="general">{tr("General")}</ToggleButton><ToggleButton value="ai">{tr("AI")}</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {ai.mode === 'ai' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">{tr("Analyses: client statement summary and volunteer actions")}</Typography>
          <Stack direction="row" spacing={1}>
            {ai.loading && <Button size="small" color="inherit" onClick={ai.cancel}>{tr("Cancel")}</Button>}
            <Button size="small" variant="contained" disabled={ai.loading || !hasInput} onClick={ai.run} startIcon={ai.loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:flash-fill" />}>
              {result && !ai.stale ? tr("Regenerate") : tr("Generate AI Recommendations")}
            </Button>
          </Stack>
        </Stack>
      )}

      <Box sx={{ flex: { md: 1 }, minHeight: { md: 0 }, maxHeight: { xs: '65vh', md: 'none' }, overflowY: 'auto', overflowX: 'hidden', pr: { md: 1 }, overflowWrap: 'anywhere' }}>
        {ai.mode === 'general' ? (
          <>
            <Typography variant="caption" color="text.secondary">{tr("Local rule check; data is not sent to an external service.")}</Typography>
            {general.crisisSignals.length > 0 && <Alert severity="error" sx={{ my: 2 }}><Typography variant="subtitle2">{tr("Immediate Human Review Required")}</Typography>{tr("The record contains text that may indicate")} {general.crisisSignals.map((item) => item.label).join(', ')}{tr(". This is not a final risk assessment.")}</Alert>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Data Gaps")}</Typography>
            {general.dataGaps.length ? general.dataGaps.map((text) => <Typography key={text} variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>• {text}</Typography>) : <Typography variant="body2" color="text.secondary">{tr("No basic record-structure gaps were found.")}</Typography>}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>{tr("Recommended Next Steps")}</Typography>
            <NumberedItems items={general.recommendations} getText={(item) => item} />
          </>
        ) : (
          <>
            {ai.stale && <Alert severity="warning" sx={{ mb: 2 }}>{tr("The case record has changed. The current result is outdated; please regenerate it.")}</Alert>}
            {ai.error && <Alert severity="error" sx={{ mb: 2 }}>{ai.error}</Alert>}
            {!hasInput && <Alert severity="warning">{tr("Both analysis fields are empty, so AI recommendations cannot be generated.")}</Alert>}
            {!result && !ai.loading && hasInput && <Alert severity="info">{tr("AI does not run automatically. Confirm the data scope, then select “Generate AI Recommendations”.")}</Alert>}
            {result && (
              <Stack spacing={2}>
                {result.riskSignals.some((item) => item.urgency === 'immediate_human_review') && <Alert severity="error">{tr("Potential indicators requiring immediate human review were found. Review the original record and follow the organisation’s crisis SOP; this is not a final risk assessment.")}</Alert>}
                <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Risk Indicators")}</Typography>{result.riskSignals.map((item) => <Box key={`${item.title}-${item.detail}`} sx={{ mb: 1 }}><Typography variant="body2"><b>{item.title}</b></Typography><Typography variant="body2" color="text.secondary">{item.detail}</Typography><Typography variant="caption" color="text.disabled">{tr("Sources:")} {item.sourceRefs.join(', ')}</Typography></Box>)}</Box>
                <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Data Gaps")}</Typography>{result.dataGaps.map((item) => <Box key={`${item.title}-${item.detail}`} sx={{ mb: 1 }}><Typography variant="body2"><b>{item.title}</b>: {item.detail}</Typography><Typography variant="caption" color="text.disabled">{tr("Sources:")} {item.sourceRefs.join(', ')}</Typography></Box>)}</Box>
                <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>{tr("Recommended Next Steps")}</Typography><NumberedItems items={[...result.recommendedActions].sort((a, b) => a.priority - b.priority)} getText={(item) => `${item.action} — ${item.rationale}`} /></Box>
                {result.limitations.map((text) => <Alert key={text} severity="warning">{text}</Alert>)}
                <Typography variant="caption" color="text.secondary">{tr("Generated:")} {new Date(ai.analysis.generatedAt).toLocaleString(currentLocale())} {tr("· Follow-up:")} {domainLabel(result.followUpPriority)}</Typography>
              </Stack>
            )}
          </>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* {ai.mode === 'ai' ? tr("AI-generated, counsellor review required.") : tr("General uses a local rule check.")} {tr("This is not a diagnosis or final risk assessment and does not automatically modify records or contact third parties.")}</Typography>
    </Card>
  );
}

CaseAiTip.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    client_summary: PropTypes.string, volunteer_actions: PropTypes.string, updated_at: PropTypes.string,
  }).isRequired,
};
