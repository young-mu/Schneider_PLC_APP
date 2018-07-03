'use strict';

$.ready(function (error) {
    if (error) {
        console.error(error);
        return;
    }

    console.log('Hello, Schneider PLC');

    var PLC = require('schneider-ruff-plc');

    var _DU = require('schneider-data-upload');
    var duMetadata = require('./metadata.json');
    var DU = new _DU(duMetadata, { debug: false });

    PLC.init(function (error) {
        if (error) {
            console.log(error);
            return;
        }

        console.log('PLC init succesfully');

        var value = false;
        setInterval(function () {
            // toggle all the output ports
            PLC.Q0.write(value);
            PLC.Q1.write(value);
            PLC.Q2.writeSync(value);
            PLC.Q3.writeSync(value);
            value = !value;

            // read I4 port (async)
            PLC.I4.read(function (err, value) {
                if (err) {
                    console.log(err);
                    return;
                }

                console.log('(async) I4 value is ' + value);
            });

            // read I4 port (sync)
            var i4 = PLC.I4.readSync();
            console.log('(sync) I4 value is ' + i4);
        }, 3000);

        PLC.I7.on('rising', function () {
            console.log('I7 rising');
        });

        PLC.I7.on('falling', function () {
            console.log('I7 falling');
        });

        // data upload
        setInterval(function () {
            PLC.readAllValues(function (err, values) {
                DU.upload(values, function (err) {
                    if (err) {
                        console.log('data upload failed due to', err);
                        return;
                    }
                    console.log('data upload successfully');
                })
            });
        }, 10000);
    });
});

$.end(function () {
    console.log('Ruff application exits');
});
