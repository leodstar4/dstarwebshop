function toEvent(req, body, context) {
  const url = new URL(req.url);
  const headers = Object.fromEntries(req.headers);
  if (context?.ip && !headers['x-nf-client-connection-ip']) headers['x-nf-client-connection-ip'] = context.ip;
  return { httpMethod: req.method, headers, body, path: url.pathname, rawUrl: req.url, queryStringParameters: Object.fromEntries(url.searchParams) };
}
module.exports = handler => async (req, context) => {
  if (!process.env.CONTEXT && context?.deploy?.context) process.env.CONTEXT = context.deploy.context;
  if (!process.env.URL && context?.site?.url) process.env.URL = context.site.url;
  const body = ['GET', 'HEAD'].includes(req.method) ? null : await req.text();
  const r = await handler(toEvent(req, body, context), context) || {};
  return new Response(r.body ?? null, { status: r.statusCode || 200, headers: r.headers });
};
