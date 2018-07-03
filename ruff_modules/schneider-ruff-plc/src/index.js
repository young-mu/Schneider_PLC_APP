var GPIO = require('rpi-gpio');
var util = require('util');
var events = require('events');
var async = require('async');

function PLC () {
    this.portTable = {
        "IN": [
            { "GPIO": 22, "LED": 92 },  // gpio0_22, gpio2_28
            { "GPIO": 23, "LED": 91 },  // gpio0_23, gpio2_27
            { "GPIO": 26, "LED": 90 },  // gpio0_26, gpio2_26
            { "GPIO": 27, "LED": 96 },  // gpio0_27, gpio3_0
            { "GPIO": 46, "LED": 114 }, // gpio1_14, gpio3_18
            { "GPIO": 44, "LED": 87 },  // gpio1_12, gpio2_23
            { "GPIO": 47, "LED": 86 },  // gpio1_15, gpio2_22
            { "GPIO": 45, "LED": 88 },  // gpio1_13, gpio2_24
            { "GPIO": 48, "LED": 101 }, // gpio1_16, gpio3_5
            { "GPIO": 52, "LED": 102 }, // gpio1_20, gpio3_6
        ],
        "OUT": [
            { "GPIO": 65, "LED": 105 }, // gpio2_01, gpio3_9
            { "GPIO": 64, "LED": 106 }, // gpio2_00, gpio3_10
            { "GPIO": 50, "LED": 82 },  // gpio1_18, gpio2_18
            { "GPIO": 60, "LED": 83 }   // gpio1_28, gpio2_19
        ]
    };

    this.portArray = [];
    this.objIn = [];
    this.objOut = [];

    var that = this;
    GPIO.on('change', function (channel, value) {
        for (var i = 0; i < that.portTable.IN.length; i++) {
            if (that.portTable.IN[i].GPIO === channel) {
                GPIO.write(that.portTable.IN[i].LED, value);
                if (that.objIn[i]) {
                    // convert negative logic to positive logic
                    that.objIn[i].emit(value === true ? 'falling' : 'rising');
                }
            }
        }
    });
}

PLC.prototype.init = function (callback) {
    var _inGPIO = [];
    var _inLED = []
    for (var i = 0; i < this.portTable.IN.length; i++) {
        _inGPIO[i] = {
            'channel': this.portTable.IN[i].GPIO,
            'type': 'gpio',
            'direction': GPIO.DIR_IN,
            'edge': GPIO.EDGE_BOTH
        };
        _inLED[i] = {
            'channel': this.portTable.IN[i].LED,
            'type': 'led',
            'direction': GPIO.DIR_HIGH, // out | high
            'edge': GPIO.EDGE_NONE
        };
    }

    // input value
    var _preOutGpio= [
        {channel: 55, 'type': 'gpio', direction: GPIO.DIR_HIGH, 'edge': GPIO.EDGE_NONE}, //24V enable
        {channel: 56, 'type': 'gpio', direction: GPIO.DIR_HIGH, 'edge': GPIO.EDGE_NONE}, //5V enable
    ];

    var _outGPIO = [];
    var _outLED = [];
    for (var i = 0; i < this.portTable.OUT.length; i++) {
        _outGPIO[i] = {
            'channel': this.portTable.OUT[i].GPIO,
            'type': 'gpio',
            'direction': GPIO.DIR_LOW, // out | low
            'edge': GPIO.EDGE_NONE
        };
        _outLED[i] = {
            'channel': this.portTable.OUT[i].LED,
            'type': 'led',
            'direction': GPIO.DIR_HIGH, // out | high
            'edge': GPIO.EDGE_NONE
        };
    }

    // build big array
    this.portArray = _inGPIO.concat(_inLED).concat(_outGPIO).concat(_outLED).concat(_preOutGpio);

    for (var i = 0; i < this.portTable.IN.length; i++) {
        this.objIn[i] = new plcGPIO(this.portTable.IN[i]);
    }
    for (var i = 0; i < this.portTable.OUT.length; i++) {
        this.objOut[i] = new plcGPIO(this.portTable.OUT[i]);
    }

    this.I0 = this.objIn[0];
    this.I1 = this.objIn[1];
    this.I2 = this.objIn[2];
    this.I3 = this.objIn[3];
    this.I4 = this.objIn[4];
    this.I5 = this.objIn[5];
    this.I6 = this.objIn[6];
    this.I7 = this.objIn[7];
    this.I8 = this.objIn[8];
    this.I9 = this.objIn[9];
    this.Q0 = this.objOut[0];
    this.Q1 = this.objOut[1];
    this.Q2 = this.objOut[2];
    this.Q3 = this.objOut[3];

    var that = this;
    async.map(this.portArray, function (port, callback) {
            GPIO.setup(port.channel, port.direction, port.edge, callback);
        }, function (err, result) {
            if (err) {
                console.log('PLC init failed due to', err);
                return callback(err);
            }

            // turn on all the input LEDs
            async.map(that.portTable.IN, function (port, callback) {
                    GPIO.read(port.GPIO, function (err, value) {
                        GPIO.write(port.LED, value, callback);
                    });
                }, function (err, result) {
                    if (err) {
                        console.log('PLC init2 failed due to', err);
                        return callback(err);
                    }
                    callback();
            });
    });
}

PLC.prototype.readAllValues = function (callback) {
    var gpioArray = this.portArray.filter(function (element) {
        return element.type === 'gpio';
    });

    async.map(gpioArray, function (gpio, callback) {
        GPIO.read(gpio.channel, function (err, value) {
            // convert negative logic to positive logic
            callback(err, gpio.direction === 'in' ? !value : value);
        });
    }, function (err, result) {
        if (err) {
            console.log('readAllValues failed due to', err);
            return callback(err);
        }

        // array to object
        var object = {
            'I0': result[0],
            'I1': result[1],
            'I2': result[2],
            'I3': result[3],
            'I4': result[4],
            'I5': result[5],
            'I6': result[6],
            'I7': result[7],
            'I8': result[8],
            'I9': result[9],
            'Q0': result[10],
            'Q1': result[11],
            'Q2': result[12],
            'Q3': result[13]
        };

        callback(undefined, object);
    });
}

function plcGPIO (options) {
    this.GPIO = options.GPIO;
    this.LED = options.LED;
}

util.inherits(plcGPIO, events);

plcGPIO.prototype.write = function (value, callback) {
    var that = this;

    GPIO.write(this.GPIO, value, function (error) {
        if (error) {
            callback && callback(error);
            return;
        }

        GPIO.write(that.LED, !value, function (error) {
            if (error) {
                callback && callback(error);
                return;
            }
        });
    });
};

plcGPIO.prototype.writeSync = function (value) {
    GPIO.writeSync(this.GPIO, value);
    GPIO.writeSync(this.LED, !value);
};

plcGPIO.prototype.read = function (callback) {
    GPIO.read(this.GPIO, function (error, value) {
        // convert negative logic to positive logic
        callback(error, !value);
    });
};

plcGPIO.prototype.readSync = function () {
    return !GPIO.readSync(this.GPIO);
};


module.exports = new PLC();
