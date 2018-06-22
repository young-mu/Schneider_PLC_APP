# Ruff Application

### 部署并执行

```shell
> rap deploy --source --start <IP 地址>
> ./deploy.sh （默认 IP 地址为 192.168.1.100）
```

### 查看日志

```shell
> rap log <IP 地址>
> ./log.sh （默认 IP 地址为 192.168.1.100）
```

### 停止应用
```shell
> rap stop <IP 地址>
```

## 总结

1. IQ 口标识
 - PLC 输入口为 10 个，即 I0，I1，...，I8 和 I9
 - PLC 输出口为 4 个，即 Q0，Q1，Q2 和 Q3
2. 电平
 - PLC 高电平为 24V
 - PLC 低电平为 0V
3. IQ 口和 LED
 - 正常情况，输出或输入为高，对应 LED 亮，这应该由硬件电路实现的。但在该 PLC 中，此逻辑是由应用软件控制的（即应用若不在运行状态，外部给 24V 输入，对应的 LED 不会亮）

## API Reference 

### schneider-ruff-plc

- **初始化 `PLC.init(callback)`**

There is no parameters of `callback`.

Initiate PLC resouces. The method must be called first before using all the other attributes or methods.

- **异步输出（写） `PLC.Qx.write(value, callback)`**

Asynchronous version write.

The parameter `value` can be `true`/`1` or `false`/`0`, the parameter of `callback` is `(error)`

There are four outputs, namely x can be 0, 1, 2 and 3.

If the value is `true`, the output port will be 24V, vice versa.

- **同步输出（写） `PLC.Qx.writeSync(value)`**

Synchronous version write. There is no return values.

- **异步输入（读） `PLC.Ix.read(callback)`**

Asynchronous version read.

The parameters of `callback` is `(error, value)`, the return value can be `true` or `false`.

There are ten inputs, namely x can be 0, 1, ..., 8 and 9.

If the external input is 24V, the value will be `true`, vice versa.

- **同步输入（读） `PLC.Ix.readSync()`**

Synchronous version read. The return value can be `true` or `false`.

- **读全部输入／输出口数据 `PLC.readAllValues(callback)`**

The parameter of `callback` is `(values)`, which is an object whose keys are `I0`, `I1`, ..., `I9` and `Q0`, ..., `Q3`.

read all the values of IQ ports.

- **中断（上升沿） `PLC.Ix.on('rising', callback)`**

There is no parameters of `callback`.

If the external input becomes 24V from 0V, the event will be triggered.

- **中断（下降沿） `PLC.Ix.on('falling', callback)`**

There is no parameters of `callback`.

If the external value becomes 0V from 24V, the event will be triggered.

#### Example

```js
var PLC = require('schneider-ruff-plc');

PLC.init(function () {
    var value = 0;
    setInterval(function () {
        // toggle PLC Q0 output
        PLC.Q0.write(value); // async
        PLC.Q1.writeSync(value); // sync
        value = !value;

        // read PLC I0 input
        PLC.I0.read(function (err, i0Value) {  // async
            if (err) {
                console.log(err);
                return;
            }
            console.log('(async) I0 value is ' + i0Value);
        });
        var i0Value = PLC.I0.readSync(); // sync
        console.log('(sync) I0 value is ' + i0Value);

        // read PLC all I/Q ports
        PLC.readAllValues(function (values) {
            console.log(JSON.stringify(values, false, 4));
        });
    }, 1000);

    PLC.I0.on('rising', function () {
        console.log('I0 rising');
    });

    PLC.I0.on('falling', function () {
        console.log('I0 falling');
    });
});
```

### schneider-data-upload

- **构造函数 `construtor(config, options)`**

If constructor is called, this module will connect Baidu IoT server and keep this connection status.

The parameter `config` is object type, which is imported by an JSON file called `metadata.json` under src/ directory. This JSON file includes two fileds, **upload data metadata information** (have been recorded in Baidu IoT server) and **mqtt connection information** (connect to Baidu IoT service) respectively. **Note: please do NOT modify this file.**

The parameter `options` is an object with only one key `debug` whose value can be boolean type (false as default). If `debug` is `true`, the module will print some debug logs.

- **上报数据 `upload(values)`**

Upload values to Baidu IoT server right now.

The parameter `values` is object type, in which keys can be `Ix` (x can be 0, 1, ... 9) and `Qx` (x can be 0, 1, 2, 3). Typically. when you call `PLC.readAllValues`, the return values is just like below, you can just pass it into this API.

```js
{
    "I0": true, // I0 - I9 (10 inputs)
    "I1": false,
    ...
    "I9": true,
    "Q0": true, // Q0 - Q3 (4 outputs)
    ...
    "Q3": false
}
```

#### Example

```js
var PLC = require('schneider-ruff-plc');

var _DU = require('schneider-data-upload');
var duMetadata = require('./metadata.json');
var DU = new _DU(duMetadata, { debug: false });

PLC.init(function () {
    // upload all the values of PLC ports every 10 seconds
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
```

## 接线方法

- 输出

V- 接 0V，V+ 接 24V

![PLC 输出](https://ruffdoc.blob.core.chinacloudapi.cn/pictures/plc_output.png)

- 输入

COM 口接 0V，I 接 0V／24V／Q

![PLC 输入1](https://ruffdoc.blob.core.chinacloudapi.cn/pictures/plc_input1.png)

![PLC 输入2](https://ruffdoc.blob.core.chinacloudapi.cn/pictures/plc_input2.png)
