const linebot = require('linebot')
const conversation = require('./conversation')

const { CHANNEL_ID, CHANNEL_SECRET, CHANNEL_ACCESS_TOKEN } = require('./configs').linebot

const bot = linebot({
	channelid: CHANNEL_ID,
	channelSecret: CHANNEL_SECRET,
    channelAccessToken: CHANNEL_ACCESS_TOKEN
})

bot.on('message', event => {
	//echo
	event.reply(event.message.text)
		.then( data => {
			console.log('reply success')
		}).catch( err => {
			console.log('reply err')
		})

})
module.exports = bot