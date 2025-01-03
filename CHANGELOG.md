## v0.1.3
* 修改RPE故事板贴图大小计算方式
* 修复手机渲染分辨率低的问题
* 添加全局设置系统 (没做UI)
* 修改渲染逻辑
* 优化英文翻译
* 优化界面
* 优化性能
* 添加phira铺面id搜索
* 更改性能信息显示
* 删除无用代码
* 修复一堆bug

## v0.1.2
* 优化拆分缓动时的性能
* Tauri：大幅更改界面，添加云母效果背景
* 兼容gif文件的加载与播放 (暂不支持相关事件)
* 添加bad判定效果
* 更换phira服务器地址
* 修复PEC铺面加载炸掉的问题
* 修复着色器的某些bug
* 修复一堆bug
* 修复国际化问题

## v0.1.1
* 修复了特定情况下无法正常加载铺面的问题
* 兼容RPE的attachUI中的bar
* 更改界面的动画


## v0.1.0
* UI重构
* 迁移至VUE框架
* 国际化
* 添加FXAA抗锯齿
* 添加缓存铺面功能
* 优化Phira在线铺面的下载
* 添加WebGPU着色器
* 优化性能
* 更改暂停按钮特效
* 更改UI淡入方式
* 优化Phira某些协议同意的流程
* 修复亿些bug
* 添加了更多加载压缩包的方法 *(目前有：jszip 7z-wasm Libarchivejs)*

## v0.0.3
* 重磅更新： 暂  停  按  钮  回  来  了
* 修复了无法加载部分压缩包的问题 *(因为7z-wasm的文件系统的权限😅)*
* 修复了文件扩展名错误时无法加载文件的BUG *(.json的文件里面是PEC格式的铺面 ~~难绷)~~*
* 修复prpr的某些特效属性 *(除了float类型都有问题)* 无法正常 更新/解析 的问题
* 准备更新录制铺面功能 *(目前只能录视频)*

## v0.0.2
* 文件加载系统大改 JS7z -> [7z-wasm](https://github.com/use-strict/7z-wasm)(网页版7-zip，你甚至可以上传.iso)
* 压缩文件加载速度提升114514% (得益于7z-wasm)
* 修复无法加载没有特效的铺面 (我nt导致的，悲)

## v0.0.1
* prpr的extra.json加载系统大改
* 修复特定情况下特效显示异常
* 支持使用prpr的video
* 添加新的内置着色器: bloom

## v0.0.0
* 最初