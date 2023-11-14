export default async function (fastify) {
  fastify.get('/status', async (request) => {
    const { query } = request;
    let status = {};
    if (`${query.address}/feed_state` in fastify) {
      status = { ...status, feed_state: fastify.feed_state };
    }
    if (`${query.address}/battery_percentage` in fastify) {
      status = { ...status, battery_percentage: fastify.battery_percentage };
    }
    if (`${query.address}/power_mode` in fastify) {
      status = { ...status, power_mode: fastify.power_mode };
    }
    if (`${query.address}/indicator` in fastify) {
      status = { ...status, indicator: fastify.indicator };
    }
    return status;
  });

  fastify.post('/manual_feed', async (request, reply) => {
    if ('mqtt' in fastify) {
      const { mqtt: client } = fastify;
      const { count, address } = request.body;
      await client.publish(`${address}/feed`, count.toString(), { qos: 1 }, (err) => {
        console.log(err);
        reply.send(err);
      });
    }
  });
}
