const express = require('express')

const bot = require('./bot')

const app = express()
bot.listen('/linewebhook', 3000)
app.post('/linewebhook', bot.parser())

app.get('/', function (req, res) {
	res.send('Hello World!')
})

app.listen(4000, function () {
	console.log('listening on port 4000')
})