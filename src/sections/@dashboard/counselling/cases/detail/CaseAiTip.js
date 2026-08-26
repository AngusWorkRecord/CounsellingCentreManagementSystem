import PropTypes from 'prop-types';
import { useCallback, useMemo } from 'react';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Divider, Stack, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material';
import Iconify from '../../../../../components/iconify';
import { generateCaseAdvice, getCaseAdvice } from '../../../../../services/aiAnalysisService';
import useAiAnalysis from '../../useAiAnalysis';

const CRISIS_SIGNALS = [
  { label: '自伤或自杀风险线索', pattern: /自杀|轻生|不想活|结束生命|伤害自己|自残|割腕|suicid|self[- ]?harm|kill myself/i },
  { label: '伤害他人风险线索', pattern: /杀死|杀人|伤害他人|报复|袭击|攻击他人|harm (him|her|them)|kill (him|her|them)/i },
  { label: '虐待或暴力风险线索', pattern: /虐待|家暴|暴力|性侵|侵犯|殴打|威胁|abuse|domestic violence|sexual assault/i },
  { label: '失联或失踪风险线索', pattern: /失联|失踪|联系不上|下落不明|missing person|cannot be reached/i },
];
const ACTION_MARKERS = {
  followUp: /跟进|复诊|回访|再次联系|follow[- ]?up|check in/i,
  timing: /今天|明天|本周|下周|小时|日期|日前|期限|today|tomorrow|this week|next week|within|by \d/i,
  owner: /辅导员|志工|主管|负责人|家属|counsellor|volunteer|supervisor|person in charge/i,
  referral: /转介|医院|诊所|社工|心理师|精神科|紧急服务|refer|hospital|clinic|emergency/i,
};
const LEVEL_META = {
  immediate_review: { label: '需要立即人工复核', color: 'error' },
  review: { label: '需要补充／复核', color: 'warning' }, routine: { label: '一般复核', color: 'success' },
  no_immediate_signal: { label: '未见即时线索', color: 'success' }, needs_review: { label: '需要复核', color: 'warning' },
  needs_prompt_review: { label: '需要立即人工复核', color: 'error' }, insufficient_data: { label: '资料不足', color: 'default' },
};

function cleanText(value) { return typeof value === 'string' ? value.trim() : ''; }

function analyseCase(summaryValue, actionsValue) {
  const summary = cleanText(summaryValue);
  const actions = cleanText(actionsValue);
  const crisisSignals = CRISIS_SIGNALS.filter((signal) => signal.pattern.test(`${summary}\n${actions}`));
  const dataGaps = [];
  const recommendations = [];
  if (!summary) dataGaps.push('尚未填写案主自述摘要，无法了解主要关注事项。');
  else if (summary.length < 30) dataGaps.push('案主自述摘要较简短，建议确认主要困扰、影响及期望协助。');
  if (!actions) dataGaps.push('尚未记录志工处理步骤，无法确认已完成的行动。');
  else {
    if (!ACTION_MARKERS.followUp.test(actions)) dataGaps.push('处理步骤未明确记录是否需要 follow-up。');
    if (!ACTION_MARKERS.timing.test(actions)) dataGaps.push('处理步骤未见明确时间点或完成期限。');
    if (!ACTION_MARKERS.owner.test(actions)) dataGaps.push('处理步骤未明确说明后续行动负责人。');
  }
  if (crisisSignals.length) {
    recommendations.push('请由授权 counsellor 立即人工复核原始记录，并依机构危机 SOP 判断是否升级。');
    recommendations.push('人工确认线索的当前性、具体性、保护因素和已采取措施。');
  }
  if (summary && actions) recommendations.push('核对处理步骤是否回应摘要中的主要关注事项，并记录未处理部分。');
  if (!ACTION_MARKERS.followUp.test(actions)) recommendations.push('由 counsellor 决定是否需要 follow-up，并记录负责人、方式和时间。');
  if (ACTION_MARKERS.referral.test(actions)) recommendations.push('人工确认转介或升级安排是否已完成，并记录实际结果。');
  if (!recommendations.length) recommendations.push('由 counsellor 复核摘要与处理记录的一致性，并确认是否需要后续跟进。');
  let level = 'routine';
  if (dataGaps.length) level = 'review';
  if (crisisSignals.length) level = 'immediate_review';
  return { level, crisisSignals, dataGaps, recommendations };
}

function NumberedItems({ items, getText }) {
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
  const general = useMemo(() => analyseCase(session.client_summary, session.volunteer_actions), [session.client_summary, session.volunteer_actions]);
  const scopeKey = `${session.id}:${session.updated_at || ''}`;
  const loadLatest = useCallback((options) => getCaseAdvice(session.id, options), [session.id]);
  const generate = useCallback((options) => generateCaseAdvice(session.id, options), [session.id]);
  const ai = useAiAnalysis({ generate, loadLatest, scopeKey });
  const result = ai.analysis?.result;
  const hasInput = Boolean(cleanText(session.client_summary) || cleanText(session.volunteer_actions));
  const level = LEVEL_META[ai.mode === 'general' ? general.level : result?.riskLevel || 'insufficient_data'];

  return (
    <Card sx={{ p: 3, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:flash-fill" width={22} sx={{ color: 'secondary.main' }} />
          <Box><Typography variant="h6">个案辅助建议</Typography><Chip label={level.label} color={level.color} size="small" sx={{ mt: 0.5 }} /></Box>
        </Stack>
        <ToggleButtonGroup exclusive size="small" value={ai.mode} onChange={(_, value) => value && ai.setMode(value)}>
          <ToggleButton value="general">General</ToggleButton><ToggleButton value="ai">AI</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {ai.mode === 'ai' && (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} justifyContent="space-between" alignItems={{ sm: 'center' }} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">将分析：案主自述摘要、志工处理步骤</Typography>
          <Stack direction="row" spacing={1}>
            {ai.loading && <Button size="small" color="inherit" onClick={ai.cancel}>取消</Button>}
            <Button size="small" variant="contained" disabled={ai.loading || !hasInput} onClick={ai.run} startIcon={ai.loading ? <CircularProgress size={16} color="inherit" /> : <Iconify icon="eva:flash-fill" />}>
              {result && !ai.stale ? '重新生成' : '生成 AI 建议'}
            </Button>
          </Stack>
        </Stack>
      )}

      <Box sx={{ maxHeight: { xs: '65vh', md: 480 }, overflowY: 'auto', overflowX: 'hidden', pr: { md: 1 }, overflowWrap: 'anywhere' }}>
        {ai.mode === 'general' ? (
          <>
            <Typography variant="caption" color="text.secondary">本地规则检查，不会把资料发送到外部服务。</Typography>
            {general.crisisSignals.length > 0 && <Alert severity="error" sx={{ my: 2 }}><Typography variant="subtitle2">需要人工立即复核</Typography>记录中出现可能涉及{general.crisisSignals.map((item) => item.label).join('、')}的文字线索。这不是最终风险判断。</Alert>}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ mb: 1 }}>资料缺口</Typography>
            {general.dataGaps.length ? general.dataGaps.map((text) => <Typography key={text} variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>• {text}</Typography>) : <Typography variant="body2" color="text.secondary">未发现基本记录结构缺口。</Typography>}
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>建议下一步</Typography>
            <NumberedItems items={general.recommendations} getText={(item) => item} />
          </>
        ) : (
          <>
            {ai.stale && <Alert severity="warning" sx={{ mb: 2 }}>个案记录已改变；当前结果已过期，请重新生成。</Alert>}
            {ai.error && <Alert severity="error" sx={{ mb: 2 }}>{ai.error}</Alert>}
            {!hasInput && <Alert severity="warning">两个分析字段都没有内容，无法生成 AI 建议。</Alert>}
            {!result && !ai.loading && hasInput && <Alert severity="info">AI 不会自动运行。确认资料范围后点击“生成 AI 建议”。</Alert>}
            {result && (
              <Stack spacing={2}>
                {result.riskSignals.some((item) => item.urgency === 'immediate_human_review') && <Alert severity="error">发现需要立即人工复核的潜在线索。请查阅原始记录并依机构危机 SOP 处理；这不是最终风险判断。</Alert>}
                <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>风险提示</Typography>{result.riskSignals.map((item) => <Box key={`${item.title}-${item.detail}`} sx={{ mb: 1 }}><Typography variant="body2"><b>{item.title}</b></Typography><Typography variant="body2" color="text.secondary">{item.detail}</Typography><Typography variant="caption" color="text.disabled">来源：{item.sourceRefs.join(', ')}</Typography></Box>)}</Box>
                <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>资料缺口</Typography>{result.dataGaps.map((item) => <Box key={`${item.title}-${item.detail}`} sx={{ mb: 1 }}><Typography variant="body2"><b>{item.title}</b>：{item.detail}</Typography><Typography variant="caption" color="text.disabled">来源：{item.sourceRefs.join(', ')}</Typography></Box>)}</Box>
                <Box><Typography variant="subtitle2" sx={{ mb: 1 }}>建议下一步</Typography><NumberedItems items={[...result.recommendedActions].sort((a, b) => a.priority - b.priority)} getText={(item) => `${item.action} — ${item.rationale}`} /></Box>
                {result.limitations.map((text) => <Alert key={text} severity="warning">{text}</Alert>)}
                <Typography variant="caption" color="text.secondary">生成：{new Date(ai.analysis.generatedAt).toLocaleString()} · Follow-up：{result.followUpPriority}</Typography>
              </Stack>
            )}
          </>
        )}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>* {ai.mode === 'ai' ? 'AI-generated, counsellor review required.' : 'General 为本地规则检查。'} 不构成诊断或最终风险判断，也不会自动修改记录或联系第三方。</Typography>
    </Card>
  );
}

CaseAiTip.propTypes = {
  session: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    client_summary: PropTypes.string, volunteer_actions: PropTypes.string, updated_at: PropTypes.string,
  }).isRequired,
};
