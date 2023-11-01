# Waasq-telegram-bot
中華系Tuyaベースの自動給餌器を操作するTelegram Bot

## 作る動機
* Tuyaのアプリを使いたくない
* 中華系製品のネット環境を隔離したい

## Requirement
* Docker
* Docker-compose
* Tuya Waasq Device (自動給餌器)


## Usage
1. Telegram Bot / WEB API
  * `/get_status` -> デバイスの状態をゲット (WEB APIの場合はGET)
  * `/manual_feed [count]` -> 何猫前(?)の餌をする (WEB APIの場合はPOST -> Request body は JSON で 例：`{ count: 1 }` みたいです 

## Install
1.`docker-compose.yml` なかには `.env.` を参考しているので、以下の変数を全部揃って `.env` を作ってください
   1. `TELEGRAM_BOT_KEY` -> bot fatherへ
   2. `WAASQ_DEV_ID` -> 一旦Tuya製品を自分のアカウントにバインドしたあと、DevToolsで見つける
   3. `WAASQ_ADDRESS` -> Tuya製品の内部IP
   4. `WAASQ_LOCAL_KEY` -> [これを使ってもらえる](https://github.com/make-all/tuya-local)
   5. `WAASQ_VERSION` -> 同上
   6. `ALLOW_CHAT_ID` -> TelegramBotはリンクがあれば誰もアクセスできるので、ここで制限する
  
2. このプログラムは PORT `1883`(MQTT), `30080`(WEBAPI) を使うので、この2つのポートを開いて置いてください。
3. 状況に応じて docker-compose と Dockerfile を変わりましょう。



