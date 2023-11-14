from pymongo import MongoClient
import os
class MongoClientForWaasqDb: 

  def __init__(self):
    self.__dict__['account'] = os.getenv('MONGO_ACCOUNT')
    self.__dict__['password'] = os.getenv('MONGO_PASSWORD')
    self.client = MongoClient("mongodb://{}:{}}@mongo:27017/".format(**self.__dict__))
    self.db = self.client["waasq"]

  def get_all_machines(self):
    s = self.db.machines.find({})
    return list(s)