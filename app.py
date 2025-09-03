import os
import MetaTrader5 as mt5
from telegram.ext import Updater, CommandHandler

# Load ENV
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
MT5_LOGIN = os.getenv("MT5_LOGIN")
MT5_PASSWORD = os.getenv("MT5_PASSWORD")
MT5_SERVER = os.getenv("MT5_SERVER")

# Connect MT5
def connect_mt5():
    if not mt5.initialize(login=int(MT5_LOGIN), password=MT5_PASSWORD, server=MT5_SERVER):
        return "MT5 connection failed"
    return "MT5 connected successfully"

# Telegram command
def start(update, context):
    update.message.reply_text(connect_mt5())

def main():
    updater = Updater(BOT_TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
