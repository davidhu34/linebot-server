'use strict';

var express = require('express');
var request = require('request');
var linebot = require('linebot');

// configurations
var configs = require('./configs');
var _configs$linebot = configs.linebot,
    WEBHOOK = _configs$linebot.WEBHOOK,
    CHANNEL_ID = _configs$linebot.CHANNEL_ID,
    CHANNEL_SECRET = _configs$linebot.CHANNEL_SECRET,
    CHANNEL_ACCESS_TOKEN = _configs$linebot.CHANNEL_ACCESS_TOKEN;


var app = express();

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
		console.log('echo success');
	}).catch(function (err) {
		console.log('echo err');
	});
};

// user profile store
var profiles = {};

// reply function
var replyMsg = function replyMsg(message, profile) {
	// profile -> user profile object

	var payload = message;
	payload.user = profile.userId;
	console.log('message:', payload);

	request.post({
		url: 'https://line-red.mybluemix.net/message',
		body: JSON.stringify(payload)
	}, function (err, res, body) {
		if (err) console.log(err);else {
			var data = JSON.parse(body);
			var userId = data.user;
			var name = profiles[userId].displayName;
			var reply = {
				'type': 'text',
				'text': name + ', ' + data.text
			};
			console.log('rely:', reply);
			bot.push(userId, reply);
		}
	});
};

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
