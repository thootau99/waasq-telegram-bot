import waasq
import mongo
import atexit
import paho.mqtt.client as mqtt
import threading
import time
import os


def exit_handler():
  os._exit(1)

atexit.register(exit_handler)
class MqttClient:

  def __init__(self, dev_id, address, local_key, version):
    self.dev_id = dev_id
    self.address = address
    self.local_key = local_key
    self.version = version
    self.connectToWaasq()
    self.start()
    self.client = mqtt.Client()
    self.client.on_connect = self.on_connect
    self.client.on_message = self.on_message
    self.client.connect("mqtt", 1883, 60)
    print('connected to mqtt')
    self.client.loop_forever()

  def connectToWaasq(self):
    print('reconnect to', self.address)
    self.machine = waasq.Waasq(dev_id=self.dev_id, address=self.address, local_key=self.local_key, version=self.version)
  
  def start(self):
    thread = threading.Thread(target=self.polling_waasq_data)
    thread.start()

    # thread.join()

  def polling_waasq_data(self):
    while True:
      status_result = self.machine.get_status()
      is_result_empty = not any(status_result)
      if is_result_empty:
        self.client.publish( self.address + '/error', 'status_result is empty', 1, True)
      for key in status_result:
        self.client.publish( self.address + '/' + key, status_result[key], 1, True)
      time.sleep(5)
  
  def on_connect(self, client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe( self.address + "/feed")
    client.subscribe( self.address + "/reconnect")

  def on_message(self, client, userdata, msg):
    print('received message')

    print(msg.topic)
    if msg.topic == self.address + '/feed':
      feed_count = 1
      try:
        feed_count = msg.payload.decode('utf-8')
      except:
        pass
      print(feed_count)
      self.machine.manual_feed(int(feed_count))
    elif msg.topic == self.address + '/reconnect':
      self.connectToWaasq()


mongo = mongo.MongoClientForWaasqDb()
machines = mongo.get_all_machines()
mqtt_for_machines = []
for machine in machines:
  print(machine)
  mqtt_for_machines.append(MqttClient(dev_id=machine['dev_id'], address=machine['address'], local_key=machine['local_key'], version=machine['version']))
