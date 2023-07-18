import fp from 'fastify-plugin';
import * as mqtt from 'mqtt';
import * as fs from 'fs';

// the use of fastify-plugin is required to be able
// to export the decorators to the outer scope

export default fp(async (fastify) => {
  const client = mqtt.connect('mqtt://mqtt');
  if (!('mqtt' in fastify)) {
    fastify.decorate('mqtt', client);
    fastify.addHook('onClose', () => {
      client.end();
    });

    let status = {};

    client.on('connect', () => {
      console.log('connect to mqtt');
      client.subscribe('manual_feed', (err) => {
        console.log(err);
      });
      client.subscribe('feed_state', (err) => {
        console.log(err);
      });
      client.subscribe('battery_percentage', (err) => {
        console.log(err);
      });
      client.subscribe('power_mode', (err) => {
        console.log(err);
      });
      client.subscribe('indicator', (err) => {
        console.log(err);
      });
    });

    client.on('message', (topic, message) => {
      // message is Buffer
      if (['manual_feed', 'feed_state', 'battery_percentage', 'power_mode', 'indicator'].indexOf(topic) !== -1) {
        status = { ...status, [topic]: message.toString() };
      }
    });
  } else {
    throw new Error('fastify-mqtt has already registered');
  }
});
