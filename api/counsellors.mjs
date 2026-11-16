import { createRouter } from './_lib/router.mjs';
import { createPeopleHandler } from './_lib/people.mjs';
import {
  createLoginHandler, createLogoutHandler, createMeHandler,
  createUsersHandler, createPasswordHandler,
} from './_lib/auth-handlers.mjs';

export default createRouter({
  '/api/counselling-people': createPeopleHandler(),
  '/api/auth/login': createLoginHandler(),
  '/api/auth/logout': createLogoutHandler(),
  '/api/auth/me': createMeHandler(),
  '/api/auth/users': createUsersHandler(),
  '/api/auth/users/password': createPasswordHandler(),
});
