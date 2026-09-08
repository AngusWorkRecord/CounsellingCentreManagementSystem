import messages from './messages.json';
import { tr } from './translate';

const sourceKeys = new Map(Object.entries(messages).flatMap(([key, value]) => [[value.en, key], [value.cn, key]]));
// For authored notifications and validation errors only. Record content never passes here.
export function uiMessage(message) {
  if (typeof message !== 'string') return message;
  return tr(sourceKeys.get(message) || message);
}
