// Scheduled functions have 30 seconds: dispatch the longer job instead.
exports.handler = async () => {
  if (process.env.CONTEXT !== 'production') return { statusCode: 200 };
  await require('../lib/jobs').dispatch({ type: 'reconcile' });
  return { statusCode: 200 };
};
