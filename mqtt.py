import waasq
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
        self.client.publish('error', 'status_result is empty', 1, True)
      for key in status_result:
        self.client.publish(key, status_result[key], 1, True)
      time.sleep(5)
  
  # 當地端程式連線伺服器得到回應時，要做的動作
  def on_connect(self, client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("feed")
    client.subscribe("reconnect")

  def on_message(self, client, userdata, msg):
    print('received message')

    print(msg.topic)
    if msg.topic == 'feed':
      feed_count = 1
      try:
        feed_count = msg.payload.decode('utf-8')
      except:
        pass
      print(feed_count)
      self.machine.manual_feed(int(feed_count))
    elif msg.topic == 'reconnect':
      self.connectToWaasq()



dev_id = os.environ.get("WAASQ_DEV_ID")
address = os.environ.get("WAASQ_ADDRESS")
local_key = os.environ.get("WAASQ_LOCAL_KEY")
version = os.environ.get("WAASQ_VERSION")


m = MqttClient(dev_id=dev_id, address=address, local_key=local_key, version=version)
m.polling_waasq_data()
