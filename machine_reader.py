import os
import json

class MachineReader: 
  def get_all_machines(self):
    f = open('./devices.json')
    data = json.load(f)
    f.close()
    return data