const LINEBot = require('line-messaging')
const http = require('http')

const conversation = require('./conversation')
const { CHANNEL_ID, CHANNEL_SECRET, CHANNEL_ACCESS_TOKEN, WEBHOOK } = require('./configs').linebot

const { MESSAGE } = LINEBot.Events

module.exports = app => {

	const server = http.Server(app)
	const bot = linebot(server)
	app.use(bot.webhook(WEBHOOK));
	
	const bot = LINEBot.create({
		channelID: CHANNEL_ID,
		channelSecret: CHANNEL_SECRET,
	    channelToken: CHANNEL_ACCESS_TOKEN
	}, server)
	
	bot.on( MESSAGE, (replyToken, message) => {
		console.log(message)
	})

	return server
}
