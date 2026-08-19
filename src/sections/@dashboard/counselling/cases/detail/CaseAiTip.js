import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { Alert, Box, Card, Chip, Divider, Stack, Typography } from '@mui/material';
import Iconify from '../../../../../components/iconify';

const CRISIS_SIGNALS = [
  {
    label: '自伤或自杀风险线索',
    pattern: /自杀|轻生|不想活|结束生命|伤害自己|自残|割腕|suicid|self[- ]?harm|kill myself/i,
  },
  {
    label: '伤害他人风险线索',
    pattern: /杀死|杀人|伤害他人|报复|袭击|攻击他人|harm (him|her|them)|kill (him|her|them)/i,
  },
  {
    label: '虐待或暴力风险线索',
    pattern: /虐待|家暴|暴力|性侵|侵犯|殴打|威胁|abuse|domestic violence|sexual assault/i,
  },
  {
    label: '失联或失踪风险线索',
    pattern: /失联|失踪|联系不上|下落不明|missing person|cannot be reached/i,
  },
];

const ACTION_MARKERS = {
  followUp: /跟进|复诊|回访|再次联系|follow[- ]?up|check in/i,
  timing: /今天|明天|本周|下周|小时|日期|日前|期限|today|tomorrow|this week|next week|within|by \d/i,
  owner: /辅导员|志工|主管|负责人|家属|counsellor|volunteer|supervisor|person in charge/i,
  referral: /转介|医院|诊所|社工|心理师|精神科|紧急服务|refer|hospital|clinic|emergency/i,
};

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function analyseCase(summaryValue, actionsValue) {
  const summary = cleanText(summaryValue);
  const actions = cleanText(actionsValue);
  const combined = `${summary}\n${actions}`;
  const crisisSignals = CRISIS_SIGNALS.filter((signal) => signal.pattern.test(combined));
  const dataGaps = [];
  const recommendations = [];

  if (!summary) {
    dataGaps.push('尚未填写案主自述摘要，无法了解主要关注事项。');
  } else if (summary.length < 30) {
    dataGaps.push('案主自述摘要较简短，建议确认主要困扰、影响及期望获得的协助。');
  }

  if (!actions) {
    dataGaps.push('尚未记录志工处理步骤，无法确认已完成的行动。');
  } else {
    if (!ACTION_MARKERS.followUp.test(actions)) {
      dataGaps.push('处理步骤未明确记录是否需要 follow-up。');
    }
    if (!ACTION_MARKERS.timing.test(actions)) {
      dataGaps.push('处理步骤未见明确时间点或完成期限。');
    }
    if (!ACTION_MARKERS.owner.test(actions)) {
      dataGaps.push('处理步骤未明确说明后续行动负责人。');
    }
  }

  if (crisisSignals.length) {
    recommendations.push('请由授权 counsellor 立即人工复核相关原始记录，并依机构危机 SOP 判断是否需要升级。');
    recommendations.push('人工确认线索的当前性、具体性，以及现有保护因素和已采取措施；不要仅凭本提示作最终风险判断。');
  }

  if (summary && actions) {
    recommendations.push('核对处理步骤是否逐一回应案主摘要中的主要关注事项，并记录尚未处理的部分。');
  }
  if (!ACTION_MARKERS.followUp.test(actions)) {
    recommendations.push('由 counsellor 决定是否需要 follow-up；如需要，请记录负责人、方式和预计时间。');
  }
  if (ACTION_MARKERS.referral.test(actions)) {
    recommendations.push('人工确认转介或升级安排是否已经完成，并记录实际结果；本系统不会自动联系任何第三方。');
  }
  if (!recommendations.length) {
    recommendations.push('由 counsellor 复核摘要与处理记录的一致性，并确认是否需要后续跟进。');
  }

  let level = 'routine';
  if (dataGaps.length) level = 'review';
  if (crisisSignals.length) level = 'immediate_review';

  return {
    level,
    crisisSignals,
    dataGaps,
    recommendations,
    coverage: [
      { label: '案主自述摘要', available: Boolean(summary) },
      { label: '志工处理步骤', available: Boolean(actions) },
    ],
  };
}

const LEVEL_META = {
  immediate_review: { label: '需要立即人工复核', color: 'error' },
  review: { label: '需要补充／复核', color: 'warning' },
  routine: { label: '一般复核', color: 'success' },
};

export default function CaseAiTip({ session }) {
  const analysis = useMemo(
    () => analyseCase(session.client_summary, session.volunteer_actions),
    [session.client_summary, session.volunteer_actions]
  );
  const level = LEVEL_META[analysis.level];

  return (
    <Card sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="eva:flash-fill" width={22} sx={{ color: 'secondary.main' }} />
          <Typography variant="h6">AI 个案辅助建议</Typography>
        </Stack>
        <Chip label={level.label} color={level.color} size="small" />
      </Stack>

      <Typography variant="caption" color="text.secondary">
        分析范围：案主自述摘要与志工处理步骤；资料仅在当前页面进行规则检查。
      </Typography>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5, mb: 2 }}>
        {analysis.coverage.map((item) => (
          <Chip
            key={item.label}
            label={`${item.label}：${item.available ? '有资料' : '缺失'}`}
            color={item.available ? 'success' : 'warning'}
            variant="outlined"
            size="small"
          />
        ))}
      </Stack>

      {analysis.crisisSignals.length > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <Typography variant="subtitle2">需要人工立即复核</Typography>
          <Typography variant="body2">
            记录中出现可能涉及{analysis.crisisSignals.map((item) => item.label).join('、')}的文字线索。
            这不是最终风险判定，请查阅原始记录并依机构危机 SOP 处理。
          </Typography>
        </Alert>
      )}

      <Divider sx={{ my: 2 }} />

      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>资料缺口</Typography>
        {analysis.dataGaps.length ? (
          <Stack spacing={0.75}>
            {analysis.dataGaps.map((gap) => (
              <Typography key={gap} variant="body2" color="text.secondary">• {gap}</Typography>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">未发现基本记录结构缺口。</Typography>
        )}
      </Box>

      <Box>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>建议下一步</Typography>
        <Stack spacing={1}>
          {analysis.recommendations.map((recommendation, index) => (
            <Stack key={recommendation} direction="row" spacing={1} alignItems="flex-start">
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', bgcolor: 'secondary.main', color: 'secondary.contrastText', display: 'grid', placeItems: 'center', typography: 'caption', flexShrink: 0 }}>
                {index + 1}
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.7 }}>{recommendation}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
        * 系统生成的辅助提示可能误报或遗漏，仅供 counsellor 复核，不构成诊断或最终风险判断，也不会自动修改记录或联系第三方。
      </Typography>
    </Card>
  );
}

CaseAiTip.propTypes = {
  session: PropTypes.shape({
    client_summary: PropTypes.string,
    volunteer_actions: PropTypes.string,
  }).isRequired,
};
