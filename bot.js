import TelegramBot from 'node-telegram-bot-api'
import * as mqtt from 'mqtt'

const token = process.env.TELEGRAM_BOT_KEY ?? ''
const bot = new TelegramBot(token, { polling: true })

const client = mqtt.connect("mqtt://mqtt");
let status = {}

client.on("connect", function () {
  client.subscribe("manual_feed", function (err) {
    console.log(err)
  });
  client.subscribe("feed_state", function (err) {
    console.log(err)
  });
  client.subscribe("battery_percentage", function (err) {
    console.log(err)
  });
  client.subscribe("power_mode", function (err) {
    console.log(err)
  });
  client.subscribe("indicator", function (err) {
    console.log(err)
  });
});

client.on("message", function (topic, message) {
  // message is Buffer
  if (["manual_feed", "feed_state", "battery_percentage", "power_mode", "indicator"].indexOf(topic) !== -1) {
    status = { ...status, [topic]: message.toString() }
  }
});

bot.setMyCommands([
  {
    command: 'manual_feed',
    description: 'setAuthKey'
  }, {
    command: 'get_status',
    description: 'getAuthKey'
  },
], { scope: { type: 'all_private_chats' }, language_code: 'en' }).then(() => {
  console.log('command set ok')
})

bot.onText(/^\/manual_feed/, async (msg) => {
  const chatId = msg.chat.id
  let feedCount
  try {
    const { groups: { limitCount } } = /\/manual_feed (?<limitCount>[^ $]*)/.exec(msg.text)
    feedCount = parseInt(limitCount)
  } catch {
    feedCount = 1
  }

    client.publish("feed", feedCount.toString(), { qos: 1 }, (err) => {
    console.log(err)
  })
  await bot.sendMessage(msg.chat.id, "ok")
})

bot.onText(/^\/get_status/, async (msg) => {
  const chatId = msg.chat.id
  await bot.sendMessage(msg.chat.id, JSON.stringify(status))
})