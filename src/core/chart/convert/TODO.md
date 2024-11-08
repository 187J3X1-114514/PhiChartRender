# 1.这里有许多我看了都绷不住的代码

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
