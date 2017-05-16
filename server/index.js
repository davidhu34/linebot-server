const express = require('express')
const linebot = require('./linebot')

const app = express()
const bot = linebot(app)

app.listen(process.env.PORT || 8080);

//line-messaging
/*
const linebot = require('./linebot')
const app = express()
app.get('/', function (req, res) {
	res.send('Hello World!')
})
const server = linebot(app)
server.listen(process.env.PORT || 3000);
*/

//debugging
/*
app.use(function(req, res, next) {
	console.log(req.body)
	next()
})

app.listen(process.env.PORT || 3000, function () {
	console.log('listening on port env||3000')
})
*/