import { MongoClient } from 'mongodb'
export class Mongo {

  /** @type {MongoClient} */
  client
  constructor() {
    this.client = new MongoClient(`mongodb://${process.env.MONGO_ACCOUNT}:${process.env.MONGO_PASSWORD}}@mongo:27017/`)
  }

  async start() {
    await this.client.connect();
  }

  async getAllMachines() {
    return this.client.db('waasq').collection('machines').find({}).toArray()
  }
}