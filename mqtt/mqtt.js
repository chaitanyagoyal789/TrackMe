const mqtt = require('mqtt');
const dotenv = require('dotenv');
const express = require('express');
const mongoose = require('mongoose');
const Device = require('../Api/models/device');
const randomCoordinates = require('random-coordinates');
const rand = require('random-int');
mongoose.connect('mongodb+srv://goyalch:chaitanya123@cluster0.vbr64.mongodb.net', { useNewUrlParser: true, useUnifiedTopology: true });
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(express.static('public'));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-RequestedWith, Content-Type, Accept");
    next();
});

const client = mqtt.connect("mqtt://broker.hivemq.com:1883");
client.on('connect', () => {
    client.subscribe('/sensorData');
    console.log('mqtt connected');
});

app.post('/send-command', (req, res) => {
    const { deviceId, command } = req.body;
    const topic = `/218570712/command/${deviceId}`;
    client.publish(topic, command, () => {
        res.send('published new message');
    });
});

/**
 *  @api {post}/send-command AllDevices An array of all devices
 *  @apiGroup Device
 *  @apiSuccessExample {String} Success-Response:
 *  {
 *   published new message
 *  }
 *  @apiErrorExample {string} Error-Response:
 *  {
 *  null
 *  }
 * */

client.on('message', (topic, message) => {
    if (topic == '/sensorData') {
        const data = JSON.parse(message);

        Device.findOne({ "name": data.deviceId }, (err, device) => {
            if (err) {
                console.log(err)
            }

            const { sensorData } = device;
            const { ts, loc, temp } = data;
            sensorData.push({ ts, loc, temp });
            device.sensorData = sensorData;
            device.save(err => {
                if (err) {
                    console.log(err)
                }
            });
        });
    }
});

app.put('/sensor-data', (req, res) => {
    const { deviceId } = req.body;
    const [lat, lon] = randomCoordinates().split(", ");
    const ts = new Date().getTime();
    const loc = { lat, lon };
    const temp = rand(20, 50);
    const topic = `/sensorData`;
    const message = JSON.stringify({ deviceId, ts, loc, temp });
    client.publish(topic, message, () => {
        res.send('published new message');
    });
});

/**
 * @api {put}/sensor-data81* @apiGroup Device
 * @apiSuccessExample {string} Success-Response:
 * [
 *  {
 *   "deviceId": "apple"
 *  }
 *  published new message
 * ]
 *  @apiErrorExample {string} Error-Response:
 *  {
 *  null
 *  }
 * */

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
