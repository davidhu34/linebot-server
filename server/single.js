const express = require('express')
const request = require('request')
const linebot = require('linebot')

// configurations
const configs = require('./configs')
const {	WEBHOOK, CHANNEL_ID, CHANNEL_SECRET, CHANNEL_ACCESS_TOKEN } = configs.linebot


const app = express()


// bot functions
const bot = linebot({
	channelId: CHANNEL_ID,
	channelSecret: CHANNEL_SECRET,
    channelAccessToken: CHANNEL_ACCESS_TOKEN
})

// echo function
const echoMsg = event => {
	// event -> webhook event object
	// one-time replyToken usage
	console.log('echo message:', event.message)

	event.reply(event.message.text)
		.then( data => {
			console.log('echo success')
		}).catch( err => {
			console.log('echo err')
		})
}


// user profile store
let profiles = {}

// reply function
const replyMsg = (message, profile) => {
	// profile -> user profile object
	
	let payload = message
	payload.user = profile.userId
	console.log('message:', payload)

	request.post({
		url: 'https://line-red.mybluemix.net/message',
		body: JSON.stringify(payload)
	}, (err, res, body) => {
		if (err) console.log(err)
		else {
			const data = JSON.parse(body)
			const userId = data.user
			const name = profiles[userId].displayName
			const reply = {
				'type': 'text',
				'text': name + ', ' + data.text
			}
			console.log('rely:', reply)
			bot.push(userId, reply)
		}
	})

}

bot.on('message', event => {

	// echo
	//echoMsg(event)
	
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

// create bot and apply express app middleware
app.post(WEBHOOK, bot.parser())	

app.listen(process.env.PORT || 8080);