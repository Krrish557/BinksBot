export async function getHealth(request, reply) {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  };
}
