# 1.这里有许多抽象代码

比如
```javascript
for (const name in eventLayer) {
    if (!((eventLayer as any)[name] instanceof Array)) continue;
    (eventLayer as any)[name] = utils.calculateRealTime(
        rawChart.BPMList, (eventLayer as any)[name]
    );
}
```
↑石

# 2.类型基本全他宝贝的是any *(不沾typescript)*
死因：javascript
# 3.没测试PEC和官铺的兼容
🥵🥵🥵

后续：PEC兼容炸了😡😡😡😡

死因：
```javascript
for (const name in judgeline.eventLayers[0]) {
    if (name == 'speed' || !(judgeline.eventLayers[0][name] instanceof Array)) continue;
    let newEvents: any[] = [];
    judgeline.eventLayers[0][name].forEach((event: any) => {
        utils.calculateEventEase(event, Easing)
            .forEach((newEvent) => {
                newEvents.push(newEvent);
            }
            );
    });
    judgeline.eventLayers[0][name] = newEvents;
}
```

续后：PEC兼容修好了😋😋😋，官铺兼容正常