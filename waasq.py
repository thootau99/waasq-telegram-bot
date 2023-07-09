import tinytuya


class Waasq(tinytuya.Device):
  def manual_feed(self, feed_count):
    payload = self.generate_payload(tinytuya.CONTROL, { '3': feed_count })
    self._send_receive(payload=payload)
  def get_status(self):
    result = {}
    try:
      status = self.status()
      dps = status['dps']
      dps_keys = dps.keys()
      if '3' in dps_keys:
        result['manual_feed'] = dps['3']
      if '4' in dps_keys:
        result['feed_state'] = dps['4']
      if '11' in dps_keys:
        result['battery_percentage'] = dps['11']
      if '14' in dps_keys:
        result['fault'] = dps['14']
      if '101' in dps_keys:
        result['power_mode'] = dps['101']
      if '113' in dps_keys:
        result['indicator'] = dps['113']
    except:
      pass
    return result