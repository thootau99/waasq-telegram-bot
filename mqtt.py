import waasq
import paho.mqtt.client as mqtt
import threading
import time
import os



class MqttClient:

  def __init__(self, dev_id, address, local_key, version):
    self.machine = waasq.Waasq(dev_id=dev_id, address=address, local_key=local_key, version=version)
    self.start()
    self.client = mqtt.Client()
    self.client.on_connect = self.on_connect
    self.client.on_message = self.on_message
    self.client.connect("mqtt", 1883, 60)
    self.client.loop_forever()
  
  def start(self):
    thread = threading.Thread(target=self.polling_waasq_data)
    thread.start()

    # thread.join()

  def polling_waasq_data(self):
    while True:
      status_result = self.machine.get_status()
      for key in status_result:
        self.client.publish(key, status_result[key])
      time.sleep(5)
  
  # 當地端程式連線伺服器得到回應時，要做的動作
  def on_connect(self, client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("feed")

  def on_message(self, client, userdata, msg):
    if msg.topic == 'feed':
      feed_count = msg.payload.decode('utf-8')
      self.machine.manual_feed(int(feed_count))



dev_id = os.environ.get("WAASQ_DEV_ID")
address = os.environ.get("WAASQ_ADDRESS")
local_key = os.environ.get("WAASQ_LOCAL_KEY")
version = os.environ.get("WAASQ_VERSION")


m = MqttClient(dev_id=dev_id, address=address, local_key=local_key, version=version)
m.polling_waasq_data()