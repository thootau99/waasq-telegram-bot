import {promises} from 'fs'
export class MachineReader {
  async getAllMachines() {
    const file = await promises.readFile('./devices.json')
    return JSON.parse(file)
  }
}