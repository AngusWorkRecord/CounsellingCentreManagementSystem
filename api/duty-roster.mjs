import { createRosterHandler } from './_lib/duty-roster.mjs';
import { createRouter } from './_lib/router.mjs';

export default createRouter({
  '/api/duty-roster': createRosterHandler(),
  '/api/duty-roster-settings': createRosterHandler(true),
});
