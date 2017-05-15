const express = require('express')
const bodyParser = require('body-parser')
const LINEBot = require('line-messaging')

const app = express()
const server = require('http').Server(app)
//const bot = require('./linebot')(server)

app.use(function(req, res, next) {
	 console.log(req.body)
	 next()
})
/*
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
*/
app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.get('/linewebhook', function (req, res) {
	res.send('hook get!')
})

var bot = LINEBot.create({
		channelID: 1515143595,
		channelSecret: 'ebdbe2970afb5d1f1d1dd970129ede6f',
	    channelToken: 'HflfgbEBvv29j61Xs7e3WZwE07UbRpLafwDxbAFmNkIbdmzyOYHCu44k8Cyhi4zMZtofcyrlOtx5eJSydbLoBqSn9kEUI8NveibrsiJMdFOgHpFmxrRVfyXi33v4zb3k980eL1OJIGwbbf8XtUkyngdB04t89/1O/w1cDnyilFU='
	}, server);
app.use(bot.webhook('/linewebhook'));
bot.on(LINEBot.Events.MESSAGE, function(replyToken, message) {
  console.log(message)
});
server.listen(process.env.PORT || 3000);
/*
app.listen(process.env.PORT || 3000, function () {
	console.log('listening on port env||3000')
})
*/




/*
const httpsServer = https.createServer({}, app)
httpsServer.listen(process.env.PORT || 3000)
*/