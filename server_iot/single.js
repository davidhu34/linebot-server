const express = require('express')
const linebot = require('linebot')
const mqtt = require('mqtt')

// configurations
const configs = require('./configs')
const {	WEBHOOK, CHANNEL_ID, CHANNEL_SECRET, CHANNEL_ACCESS_TOKEN } = configs.linebot
const {	type, organizationId, deviceType, deviceId, username, password } = configs.mqtt


const app = express()


// MQTT connection to IBM Bluemix IoT Platform
const clientId = [type, organizationId, deviceType, deviceId].join(':')
const iot = mqtt.connect('mqtt://'+organizationId+'.messaging.internetofthings.ibmcloud.com:1883', {
	"clientId" : clientId,
	"keepalive" : 30,
	"username" : username,
	"password" : password
})
iot.on('connect', () => {
	console.log('Client connected to IBM IoT Cloud.')

	iot.subscribe('iot-2/cmd/+/fmt/json', (err, granted) => {
		console.log('subscribed command, granted: '+ JSON.stringify(granted))
	})
	iot.publish('iot-2/evt/init/fmt/string', JSON.stringify({text: 'connected'}))
})


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
			console.log('reply success')
		}).catch( err => {
			console.log('reply err')
		})
}
// reply function
const replyMsg = (message, profile) => {
	// profile -> user profile object
	console.log('reply message:', message)

	let payload = message
	payload.user = profile.userId
	iot.publish('iot-2/evt/text/fmt/json', JSON.stringify(payload))
}
// payload from Node-RED
iot.on('message', (topic, payload) => {
	const data = JSON.parse(payload)
	const userId = data.message.user
	const reply = profiles[userId].displayName + ', ' + data.reply.text

	console.log('to reply:',userId, reply)
	bot.push( userId, {
		"type": 'text',
		"text": reply
	})
})

// user profile store
let profiles = {}
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