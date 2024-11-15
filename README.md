<div align="center">
<img src="/assets/logo.gif">
  <h1>PhiChartRender</h1>
</div>
此项目是基于MisaLiu/phi-chart-render的改进版本

拥有基于[MDUI](https://www.mdui.org/)的界面，对各种格式铺面更好的支持(RPE,prpr的extra.json)

PS:这个模拟器只是因为我想在学校的希沃白板上玩Phigros的心愿 ~~(怨念)~~ 而诞生的，所以代码可能会有一些石。

<div align="center">
<h4>
Phira铺面搜索界面
</h4>
<img src="/assets/8aa4054e58ed44165069a20c63568f7.png">
<h4>
游玩
</h4>
<img src="/assets/9c41181996f645d79511cf72566d5d2.png">

</div>

如果你要使用本项目，请先看[这里](https://github.com/187J3X1-114514/PhiChartRender/tree/master#%E8%AE%B8%E5%8F%AF%E8%AF%81)

## 当前实现的功能
* 界面
    * Phira *(强制需要同意相关条款才可使用)* *(由于浏览器同源策略，部分数据会经过代理中转，具体在[这里](https://github.com/187J3X1-114514/PhiChartRender/blob/master/src/api/url.ts))*
        * [x] 浏览铺面 *(Phira的API不太稳定，会抽风)*
        * [x] 搜索铺面
        * [x] 登录 
        * [ ] 其它功能不计划支持
    * PhiZone
        * [ ] 浏览铺面
        * [ ] 搜索铺面
        * [ ] 登录
        * [ ] 其它功能不计划支持
    * 铺面录制
        * [ ] 基本UI
    * prpr的铺面拓展编辑
        * [ ] 基本UI
* 铺面
    * Official
        * [x] 完全支持

    * PhiEdit
        * [x] 基本支持
        * [x] BPMList 

    * Re:PhiEdit
        * [x] 基本支持
        * [x] BPMList 
        * [x] EventLayers
        * [x] 判定线zIndex 
        * [x] 贝塞尔(Bezier)事件缓动
        * [x] attachUI *(需要测试)*
        * Extend events
           * [x] X轴缩放
           * [x] Y轴缩放
           * [x] 文字
           * [x] 颜色
           * [x] 倾斜
           * [ ] Draw *(无计划)* *(怪东西)* ~~*(年轻人的第一款绘图软件)*~~
        * Note controls *(需要测试)*
           * [x] 不透明度
           * [x] 缩放
           * [ ] 倾斜 *(无计划)*
           * [x] X
           * [ ] Y *(未来可能会)*
        * note features
            * [x] 基本支持
            * [x] FakeNote支持
            * [x] 缩放
            * [x] 透明度
            * [x] yOffset
            * [x] 可视时间

    * prpr features
        * [x] 特效/着色器/异象 *(prpr自带着色器正常，其它着色器可能会出问题)*
        * [x] 视频 *(需要测试)*

* 功能
    * 新的铺面格式 *(26mb(rpe格式)->5.2mb)*
    * 录制铺面
    * prpr的铺面拓展编辑

## 更新日志

项目根目录下的[CHANGELOG.md](CHANGELOG.md)

## 相较于原项目的更改

* 由TypeScript编写
* pixi.js版本由v7.4.2升级到v8.x.x
* 更多功能
* UI变化
* UI框架重写
* 仿Phigros原版UI
* 等等 *~~懒得写了~~*

## 使用
### 本地使用
#### 开发
1. `git clone https://github.com/187J3X1-114514/PhiChartRender`
2. `pnpm install`
3. `pnpm run dev`
#### 构建
1. `git clone https://github.com/187J3X1-114514/PhiChartRender`
2. `pnpm install`
3. `pnpm run build`

### 在线使用
网址 [Cloudflare](https://phichartrender.pages.dev) *(尽量别用)* 或 [Netlify](https://phisimplus.netlify.app/)

## 感谢

* [@MisaLiu](https://github.com/MisaLiu) [*(原项目的维护者)*](https://github.com/MisaLiu/phi-chart-render)
* [pixijs](https://github.com/pixijs/pixijs) *(模拟器使用的框架)*
* [@lchzh3473](https://github.com/lchzh3473) *(使用了[模拟器](https://github.com/lchzh3473/sim-phi)相关文档)*
* [@Mivik](https://github.com/Mivik) *(借鉴Phira解析RPE铺面的相关代码)*
* [@TeamFlos](https://github.com/TeamFlos) *(使用了Phira的api接口)*
* 所有的贡献者 [*(原项目)*](https://github.com/MisaLiu/phi-chart-render/graphs/contributors) [*(此项目)*](https://github.com/187J3X1-114514/PhiChartRender/graphs/contributors)
* And you ~~(很难想象到你是怎么发现这个模拟器的)~~

## 许可证

此项目源码按 [GPL-3.0](LICENSE.txt) 协议开源；严禁任何形式的售卖。

此项目的代码部分与Phigros游戏本体无关。

你在使用本项目时造成的任何后果全部由你自己承担。

### 你可以
* 使用本项目录制视频并发布在视频平台 *(例如哔哩哔哩)* 上，不需要声明视频是由本项目录制的。
### 你不可以
* 将本项目的源代码及其构建后的产物二次发布在任何网站上。
* 利用本项目进行除录制视频并发布在视频平台 *(例如哔哩哔哩)* 上之外的任何商业用途。
* 利用本项目违反中华人民共和国的任何法律。

在使用本项目的过程中（仅在使用Phira相关功能时），此项目会把你的Phira账号相关信息（仅有电子邮箱和密码，非明文储存）加密储存在[LocalStorage](https://developer.mozilla.org/zh-CN/docs/Web/API/Window/localStorage)中，如果这造成了你的信息泄露，与TeamFlos和我无关，需要你自行承担损失。

在使用本项目的过程中，此项目不会把你的任何数据售卖给第三方。

此项目所使用的与Phigros游戏有关的任何资源文件，版权属于Pigeon Games公司，若Pigeon Games公司认为侵权可以通过在issues中留言，我会立即删除有关的资源。

此项目中与Phira相关的api使用未经TeamFlos直接允许，若TeamFlos不允许此项目调用相关api接口可以通过issues联系我，我会立即删除有关代码。

## TODO
* 迁移到Vue *(NO.1)*
* 修复WebGPU着色器错误 shockwave.wgsl *(NO.2)*
* 铺面缓存 *(已完成)*
* 新的铺面格式 *(已完成)*
* 录制铺面 *(NO.4)*
* prpr的铺面拓展编辑 *(NO.3)*

## 其它

这个模拟器其实2022年就有想法了，但是期间重构了许多次，最后还是选择[*phi-chart-render*](https://github.com/MisaLiu/phi-chart-render)这个项目，至于为什么做这个，主要因为在学校玩Phigros太麻烦了，希沃白板的Windows上的Phira不支持多指，但是安卓性能太低，lchzh3473的模拟器对RPE和PEC的铺面支持一言难尽，装安卓模拟器动静太大 *(而且我们学校的希沃白板I3-6100+4G内存能跑就有鬼了)*，最后还是选择自己做个 *(主要是闲)*，然后经过N年才做出了这个模拟器，终于可以在希沃上爽玩力

对了，顺便感谢下某位名字叫YHL的同学，感谢他每次下学都会“帮”我关白板 *(You're dead,duge)*

~~*(还有那个我玩白板时骂我的年级办)*~~

~~(九年级玩不了力)~~

PS：这个模拟器一共用过的框架 fabric.js -> konva.js -> fabric.js -> 原生CanvasRenderer -> fabric.js -> pixi.js v7 -> 现在 pixi.js v8

