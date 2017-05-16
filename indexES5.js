'use strict';

var express = require('express');
var linebot = require('linebot');
var mqtt = require('mqtt');

// configurations
var configs = require('./configs');
var _configs$linebot = configs.linebot,
    WEBHOOK = _configs$linebot.WEBHOOK,
    CHANNEL_ID = _configs$linebot.CHANNEL_ID,
    CHANNEL_SECRET = _configs$linebot.CHANNEL_SECRET,
    CHANNEL_ACCESS_TOKEN = _configs$linebot.CHANNEL_ACCESS_TOKEN;
var _configs$mqtt = configs.mqtt,
    type = _configs$mqtt.type,
    organizationId = _configs$mqtt.organizationId,
    deviceType = _configs$mqtt.deviceType,
    deviceId = _configs$mqtt.deviceId,
    username = _configs$mqtt.username,
    password = _configs$mqtt.password;


var app = express();

// MQTT connection to IBM Bluemix IoT Platform
var clientId = [type, organizationId, deviceType, deviceId].join(':');
var iot = mqtt.connect('mqtt://' + organizationId + '.messaging.internetofthings.ibmcloud.com:1883', {
	"clientId": clientId,
	"keepalive": 30,
	"username": username,
	"password": password
});
iot.on('connect', function () {
	console.log('Client connected to IBM IoT Cloud.');

	iot.subscribe('iot-2/cmd/+/fmt/json', function (err, granted) {
		console.log('subscribed command, granted: ' + JSON.stringify(granted));
	});
	iot.publish('iot-2/evt/init/fmt/string', JSON.stringify({ text: 'connected' }));
});

// bot functions
var bot = linebot({
	channelId: CHANNEL_ID,
	channelSecret: CHANNEL_SECRET,
	channelAccessToken: CHANNEL_ACCESS_TOKEN
});

// echo function
var echoMsg = function echoMsg(event) {
	// event -> webhook event object
	// one-time replyToken usage
	console.log('echo message:', event.message);

	event.reply(event.message.text).then(function (data) {
		console.log('reply success');
	}).catch(function (err) {
		console.log('reply err');
	});
};
// reply function
var replyMsg = function replyMsg(message, profile) {
	// profile -> user profile object
	console.log('reply message:', message);

	var payload = message;
	payload.user = profile.userId;
	iot.publish('iot-2/evt/text/fmt/json', JSON.stringify(payload));
};
// payload from Node-RED
iot.on('message', function (topic, payload) {
	var data = JSON.parse(payload);
	var userId = data.message.user;
	var reply = profiles[userId].displayName + ', ' + data.reply.text;

	console.log('to reply:', userId, reply);
	bot.push(userId, {
		"type": 'text',
		"text": reply
	});
});

// user profile store
var profiles = {};
bot.on('message', function (event) {

	// echo
	//echoMsg(event)

	// reply via push
	var userId = event.source.userId;
	var message = event.message;
	if (profiles[userId]) {
		replyMsg(message, profiles[userId]);
	} else {
		// first-time user
		event.source.profile().then(function (profile) {
			console.log('user profile get:', profile);
			profiles[userId] = profile;
			replyMsg(message, profile);
		}).catch(function (err) {
			console.log('get user profile error:', err);
		});
	}
});

// create bot and apply express app middleware
app.post(WEBHOOK, bot.parser());

app.listen(process.env.PORT || 8080);
