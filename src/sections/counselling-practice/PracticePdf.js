import { Document, Font, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import PropTypes from 'prop-types';

const fontFamily = 'Practice Noto Sans SC';
Font.register({ family: fontFamily, src: `${process.env.PUBLIC_URL || ''}/fonts/NotoSansSC.ttf` });

const styles = StyleSheet.create({
  page: { paddingTop: 36, paddingHorizontal: 42, paddingBottom: 54, color: '#24374A', fontFamily, fontSize: 10, lineHeight: 1.45 },
  header: { backgroundColor: '#142D46', borderLeftWidth: 5, borderLeftColor: '#32B5A5', paddingHorizontal: 20, paddingVertical: 16, marginBottom: 12 },
  title: { color: '#FFFFFF', fontSize: 23 },
  section: { marginTop: 11 },
  heading: { color: '#00695F', fontSize: 13, paddingBottom: 4, marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#B5DCD6' },
  entry: { paddingHorizontal: 10, paddingVertical: 6, marginBottom: 4, borderLeftWidth: 2, borderLeftColor: '#CDDDD9' },
  route: { backgroundColor: '#EAF7F4', borderLeftColor: '#27998E' },
  warning: { backgroundColor: '#FFF3D9', borderLeftColor: '#C7831D' },
  entryTitle: { fontSize: 11, color: '#142D46', marginBottom: 2 },
  line: { marginBottom: 2 },
  label: { color: '#00695F' },
  footer: { position: 'absolute', left: 42, right: 42, bottom: 23, borderTopWidth: 1, borderTopColor: '#CDDDD9', paddingTop: 5, textAlign: 'right', color: '#496278', fontSize: 9 },
});

// React PDF treats zero-width whitespace as a line-break opportunity.
function wrapWord(word) {
  return word.replace(/([\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]{4})(?=[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}])/gu, '$1\uFEFF')
    .replace(/[^\s]{36}(?=[^\s])/gu, '$&\uFEFF')
    .split(/(\uFEFF)/u);
}

function renderEntry(entry, key, tone, wrap) {
  const entryTone = entry.tone || tone;
  return (
    <View key={key} wrap={wrap} style={[styles.entry, ...(entryTone ? [styles[entryTone]] : [])]}>
      {entry.title && <Text style={styles.entryTitle} minPresenceAhead={16} hyphenationCallback={wrapWord}>{entry.title}</Text>}
      {entry.lines.map((line, index) => (
        <Text key={index} style={styles.line} hyphenationCallback={wrapWord}>
          {typeof line === 'string' ? line : (
            <><Text style={styles.label}>{line.label}{line.label.endsWith(':') ? ' ' : '  '}</Text>{line.text}</>
          )}
        </Text>
      ))}
    </View>
  );
}

export function PracticePdf({ report }) {
  return (
    <Document title={report.title}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}><Text style={styles.title}>{report.title}</Text></View>
        {report.sections.map(({ title, entries, tone, recordSection = false }) => (
          <View key={title} style={styles.section}>
            <View wrap={recordSection}>
              <Text style={styles.heading} minPresenceAhead={36}>{title}</Text>
              {renderEntry(entries[0], 0, tone, recordSection)}
            </View>
            {entries.slice(1).map((entry, index) => renderEntry(entry, index + 1, tone, recordSection))}
          </View>
        ))}
        <Text fixed style={styles.footer} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
PracticePdf.propTypes = { report: PropTypes.object.isRequired };

export default async function downloadPracticePdf(report) {
  const blob = await pdf(<PracticePdf report={report} />).toBlob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'counselling-practice.pdf';
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
