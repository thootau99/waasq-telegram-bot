import TelegramBot from 'node-telegram-bot-api'
import * as mqtt from 'mqtt'
import { MachineReader } from './machine-reader.js'

const token = process.env.TELEGRAM_BOT_KEY ?? ''
const allowChatId = process.env.ALLOW_CHAT_ID ?? ''

const bot = new TelegramBot(token, { polling: true })

const client = mqtt.connect("mqtt://mqtt");
let status = {}

client.on("connect", async function () {

  const machineReader = new MachineReader();


  const machines = await machineReader.getAllMachines()
  machines.forEach(machine => {
    client.subscribe(`${machine['address']}/+`)
  })
});

client.on("message", async function (topic, message) {
  // message is Buffer
  const [ address, _topic ] = topic.split('/')
  if (["manual_feed", "feed_state", "battery_percentage", "power_mode", "indicator"].indexOf(_topic) !== -1) {
    if (!address in status) {
      status[address] = {}
    }
    status = { ...status, address: { ...status['address'], [_topic]: message.toString() } }

    if (_topic.includes('error')) {
      await bot.sendMessage('195154317', message.toString())
      await bot.sendMessage('1224703857', message.toString())
    }
  }
});

bot.setMyCommands([
  {
    command: 'manual_feed',
    description: 'manual_feed'
  }, {
    command: 'get_status',
    description: 'get_status'
  }, {
    command: 'reconnect',
    description: 'reconnect'
  },
], { scope: { type: 'all_private_chats' }, language_code: 'en' }).then(() => {
  console.log('command set ok')
})

bot.onText(/^\/manual_feed/, async (msg) => {
  const chatId = msg.chat.id
  const allow = allowChatId.split(',').find(chatIdInString => parseInt(chatIdInString) === chatId) !== undefined
  if (allow) {
    let feedCount
    try {
      const { groups: { address, limitCount } } = /\/manual_feed (?<address>[^ $]*) (?<limitCount>[^ $]*)/.exec(msg.text)
      feedCount = parseInt(limitCount)
    } catch {
      feedCount = 1
    }

    client.publish(`${address}/feed`, feedCount.toString(), { qos: 1 }, (err) => {
      console.log(err)
    })
    await bot.sendMessage(msg.chat.id, "ok")
  }
})

bot.onText(/^\/get_status/, async (msg) => {
  const chatId = msg.chat.id
  const allow = allowChatId.split(',').find(chatIdInString => parseInt(chatIdInString) === chatId) !== undefined
  try {
    const { groups: { address } } = /\/get_status (?<address>[^ $]*)/.exec(msg.text)
    if (allow)
      await bot.sendMessage(msg.chat.id, JSON.stringify(status[address]))
  } catch {
    return
  }
})

bot.onText(/^\/reconnect/, async (msg) => {
  const chatId = msg.chat.id
  const allow = allowChatId.split(',').find(chatIdInString => parseInt(chatIdInString) === chatId) !== undefined

  try {
    const { groups: { address } } = /\/reconnect (?<address>[^ $]*)/.exec(msg.text)
    if (allow)
      client.publish(`${address}/reconnect`, '', { qos: 1 }, (err) => {
        console.log(err)
      })
  } catch {
    return
  }
    
})