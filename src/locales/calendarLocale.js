// FullCalendar 5 accepts a locale object; no additional locale bundle is required.
const cnCalendar = {
  code: 'zh-cn',
  buttonText: { prev: '上一页', next: '下一页', today: '今天', month: '月', week: '周', day: '日', list: '日程' },
  weekText: '周', allDayText: '全天', moreLinkText: (count) => `另外 ${count} 项`,
  noEventsText: '暂无活动',
};
export default cnCalendar;
