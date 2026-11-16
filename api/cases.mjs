import { createRouter } from './_lib/router.mjs';
import { createAppointmentsHandler } from './_lib/appointments.mjs';
import { createCounsellingSessionsHandler } from './_lib/counselling-sessions.mjs';
import { createCaseAdviceHandler } from './_lib/case-advice.mjs';
import { createManagementInsightsHandler } from './_lib/management-insights.mjs';
import { createStudentFeedbackHandler } from './_lib/student-feedback.mjs';

export default createRouter({
  '/api/counselling-sessions': createCounsellingSessionsHandler(),
  '/api/appointments': createAppointmentsHandler(),
  '/api/appointment-cases': createAppointmentsHandler({}, true),
  '/api/ai/case-advice': createCaseAdviceHandler(),
  '/api/ai/management-insights': createManagementInsightsHandler(),
  '/api/ai/student-feedback': createStudentFeedbackHandler(),
});
