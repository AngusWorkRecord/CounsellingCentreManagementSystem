// Vercel forwards the original request URL to Node handlers after an internal
// route rewrite. Do not use query parameters as internal dispatch selectors.
export function createRouter(handlers) {
  return (request, response) => {
    const pathname = (request.url || '').split('?')[0];
    const handler = Object.hasOwn(handlers, pathname) ? handlers[pathname] : undefined;
    if (handler) return handler(request, response);
    response.setHeader('Cache-Control', 'no-store');
    return response.status(404).end();
  };
}
