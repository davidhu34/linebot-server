const mqtt = require('mqtt')

const {
	type, organizationId, deviceType, deviceId, username, password 
} = require('./configs.js').mqtt

const clientId = [type, organizationId, deviceType, deviceId].join(':')
const iot_client = mqtt.connect('mqtt://'+organizationId+'.messaging.internetofthings.ibmcloud.com:1883', {
	"clientId" : clientId,
	"keepalive" : 30,
	"username" : username,
	"password" : password
})

iot_client.on('connect', () => {
	console.log('Client connected to IBM IoT Cloud.')
	iot_client.subscribe('iot-2/cmd/+/fmt/+', (err, granted) => {
		console.log('subscribed command, granted: '+ JSON.stringify(granted))
	})
})

module.exports = iot_client