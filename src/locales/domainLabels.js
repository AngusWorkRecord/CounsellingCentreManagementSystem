import { tr } from './translate';

// Database values remain unchanged. Only these system-defined values have display labels.
const labels = {
  '面谈': 'Face-to-face', '电话辅导': 'Telephone Counselling', '线上辅导': 'Online Counselling',
  '精神': 'Mental Health', '情感与婚姻': 'Relationships and Marriage', '家庭': 'Family',
  '亲子教养': 'Parenting', '成瘾': 'Addiction', '人际关系': 'Interpersonal Relationships',
  '职业生涯': 'Career', '学业': 'Education', '身体健康': 'Physical Health', '其他': 'Other', '咨询': 'Consultation',
};
const systemValues = new Set([
  '人生价值', '特质能力', '生活方式', '沟通互动', '外在条件', '身体激情',
  '支持肯定', '精心时刻', '身体接触', '行动付出', '真心赠礼', '自我', '伴侣',
  ...Object.values(labels), 'All', 'Uncategorised', 'Intake Incomplete', 'Brief Report Pending',
  'Detailed Report Pending', 'Completed', 'First Reminder', 'Second Reminder', 'Final Reminder',
  'routine', 'medium', 'high', 'immediate_human_review', 'unknown',
]);
export function domainLabel(value) {
  if (!value) return tr('Uncategorised');
  if (labels[value]) return tr(labels[value]);
  return systemValues.has(value) ? tr(value) : value;
}
