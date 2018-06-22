'use strict';

var mqtt = require('mini-mqtt-client');

function DU (appConfig, options) {
    this._name = 'DU';

    this._appConfig = appConfig;
    this._debug = (options === undefined) ? false : options.debug;

    this._mqtt = this._getMqttOptions();

    // start connect right now
    this.start();
}

DU.prototype._log = function () {
    if (this._debug) {
        var args = Array.prototype.slice.call(arguments);
        args.unshift('[' + this._name + ']');
        console.log.apply(this, args);
    }
};

DU.prototype._getMqttOptions = function () {
    var mqttInfo = this._appConfig.du.moduleArgs;

    var mqtt = new Object(null);
    mqtt.topic = mqttInfo.topic;
    mqtt.connOptions = {
        protocol: mqttInfo.protocol || 'mqtt',
        host: mqttInfo.host,
        port: mqttInfo.port,
        clientId: mqttInfo.clientId,
        username: mqttInfo.username,
        password: mqttInfo.password,
        keepalive: 60,
        reconnectPeriod: 1000,
        protocolId: 'MQIsdp',
        protocolVersion: 3,
        clean: true,
        encoding: 'utf8'
    };
    mqtt.pubOptions = {
        qos: 0,
        retain: false
    };
    mqtt.pubCallback = function (pubType) {
        return function (error) {
            if (error) {
                console.log('Publish `' + pubType + '` failed');
                console.log(error);
                return;
            }
            console.log('Publish `' + pubType + '` successfully');
        };
    };

    return mqtt;
};

DU.prototype.publishMessage = function (message) {
    if (message.data && message.data.dName) {
        this._log('To publish message `' + message.data.dName + '`');
    } else {
        this._log('To publish alert message');
    }

    this._log(JSON.stringify(message, undefined, 4));

    this._mqttClient.publish(
        this._mqtt.topic,
        JSON.stringify(message),
        this._mqtt.pubOptions,
        this._mqtt.pubCallback('message')
    );
};

DU.prototype.start = function () {
    var that = this;

    this._mqttClient = mqtt.connect(this._mqtt.connOptions);

    this._mqttClient.on('connect', function () {
        console.log('[ MQTT connect ]');
    });

    this._mqttClient.on('error', function (error) {
        console.log('[ MQTT error ]');
        console.log('error', error);
    });

    this._mqttClient.on('close', function () {
        console.log('[ MQTT close ]');
    });
};

DU.prototype.upload = function (values) {
    var metadata = this._appConfig.metadata;

    var message = {
        'data': {
            'dName': metadata.data[0].dName,
            'dId': metadata.data[0].dId,
            'iData': []
        },
        'cId': metadata.cId,
        'gId': metadata.gId,
        'gSN': metadata.gSN
    }

    var iDataInput = metadata.data[0].iData;
    var iDataOutput = message.data.iData;
    for (var i = 0; i < iDataInput.length; i++) {
        var iCode = iDataInput[i].iCode;
        if (values[iCode] !== undefined) {
            var iData = {
                'i': iDataInput[i].iCode,
                'iId': iDataInput[i].iId,
                'v': values[iCode] === true ? 1 : 0,
                't': Date.now()
            }
            iDataOutput.push(iData);
        }
    }

    this.publishMessage(message);
};

module.exports = DU;
