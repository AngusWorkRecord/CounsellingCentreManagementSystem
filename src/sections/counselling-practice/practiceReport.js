import { domainLabel } from '../../locales/domainLabels';
import { currentLocale, tr } from '../../locales/translate';
import fields from './fields.json';
import { reasoningTitles, STAGE_KEYS, stageTitles, validFeedbackResult } from './model';

export default function practiceReport({ record, feedback, stale }) {
  const sections = [];
  const recordEntries = (values) => Object.entries(fields)
    .filter(([key]) => values[key])
    .map(([key, { label }]) => ({
      title: tr(label),
      lines: [key === 'caseCategory' ? domainLabel(values[key]) : values[key]],
    }));
  const add = (title, entries, options) => {
    if (entries.length) sections.push({ title, entries, ...options });
  };
  const sources = (refs) => ({ label: tr('Sources:'), text: refs.join(', ') });
  const items = (entries) => entries.map(({ title, detail, sourceRefs }) => ({
    title, lines: [detail, sources(sourceRefs)],
  }));
  add(tr('Case record'), recordEntries(record), { recordSection: true });
  if (feedback && validFeedbackResult(feedback.result)) {
    const { result } = feedback;
    const date = new Date(feedback.generatedAt).toLocaleString(currentLocale());
    add(tr('AI feedback'), [
      { lines: [{ label: tr('Generated:'), text: date },
        { label: tr('Feedback language'), text: domainLabel(feedback.language) }] },
      ...(stale ? [{ tone: 'warning', lines: [tr('Your record has changed. This feedback is outdated; generate new feedback before using it.')] }] : []),
    ]);
    if (stale) add(tr('Feedback applies to this submitted record:'), recordEntries(feedback.record), { recordSection: true });
    add(tr('Points requiring human attention'), items(result.humanReview), { tone: 'warning' });
    add(tr('What to focus on'), items(result.priorities));
    add(tr('Your next-session route'), STAGE_KEYS.map((key) => {
      const stage = result.sessionRoute[key];
      return {
        title: tr(stageTitles[key]),
        lines: [
          { label: tr('Aim'), text: stage.aim },
          { label: tr('A question you could ask'), text: stage.question },
          { label: tr('Why ask this?'), text: stage.rationale },
          ...stage.followUps.flatMap(({ when, question }) => [
            { label: tr('If the client responds this way'), text: when },
            { label: tr('You could follow up with'), text: question },
          ]),
          sources(stage.sourceRefs),
        ],
      };
    }), { tone: 'route' });
    Object.entries(reasoningTitles).forEach(([key, title]) => add(tr(title), items(result.reasoning[key])));
    add(tr('Discussion with your supervisor'), items(result.supervision));
    add(tr('Limitations'), [{ lines: result.limitations }]);
  } else {
    add(tr('AI feedback'), [{ lines: [feedback
      ? tr('This feedback could not be read. Generate new feedback to continue.')
      : tr('No AI feedback has been generated for this report.')] }]);
  }
  return { title: tr('Counselling Practice'), sections };
}
