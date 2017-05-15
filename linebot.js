const linebot = require('linebot')
const conversation = require('./conversation')

const { WEBHOOK, CHANNEL_ID, CHANNEL_SECRET, CHANNEL_ACCESS_TOKEN } = require('./configs').linebot

const bot = linebot({
	channelId: CHANNEL_ID,
	channelSecret: CHANNEL_SECRET,
    channelAccessToken: CHANNEL_ACCESS_TOKEN
})

const echoMsg = event => {
	// one-time replyToken usage
	console.log('echo message:', event.message)
	event.reply(event.message.text)
		.then( data => {
			console.log('reply success')
		}).catch( err => {
			console.log('reply err')
		})
}

// event -> webhook event object
// profile -> user profile object
const replyMsg = (message, profile) => {
	console.log('reply message:', message)
	let payload = message
	payload.user = profile.userId
	converstation.publish('iot-2/evt/text/fmt/json', JSON.stringify(payload))
}

conversation.on('message', (topic, payload) => {
	const data = JSON.parse(payload)
	const userId = data.message.user
	const reply = profiles[userId].displayName + ', ' + data.reply.text
	console.log('to reply:', reply)
	bot.push( userId, reply )
})


let profiles = {}
bot.on('message', event => {

	// echo
	echoMsg(event)
	
	// reply via push
	const userId = event.source.userId
	const message = event.message
	if (profiles[userId]) {
		replyMsg( message, profiles[userId] )
	} else {
		// first-time user
		event.source.profile()
			.then( profile => {
				console.log('user profile get:', profile)
				profiles[userId] = profile
				replyMsg( message, profile )
			}).catch( err => {
				console.log('get user profile error:', err)
			})
	}

})

module.exports = app => app.post(WEBHOOK, bot.parser())	
