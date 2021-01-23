# Rabbit 游戏引擎

> a simple, easy and lite h5 game engine
## 项目简介
Rabbit Game Engine是一款轻便，易用的H5游戏引擎，使用TypeScript语言编写，完全遵循Nodejs项目结构。我的目标是使其能轻松嵌入主流前端开发框架，如Vue，React，帮助前端程序开发者迅速开发嵌入前端项目的游戏应用。
## 路线图

第一阶段 - rabbit.core.js 开发包

可通过\<script\>标签直接引入html文件，进行快速嵌入式开发。

第二阶段 - Rabbit npm 应用

通过npm部署，拥有一个完整的基于Node.js的工具包，可打包出完整的html游戏应用。

第三阶段 - Rabbit Vue 模板

可通过npm下载基于Vue的Rabbit开发模板，亦可通过npm install的方式手动引入Vue项目。

第四阶段 - Rabbit Editor

基于网页的Rabbit可视化开发编辑器，可离线和在线使用，在线下可使用云服务随时保存项目。可部署于用户自己的服务器，随时打开网页进行游戏开发。

## 使用指南
### Install

在克隆仓库目录下，运行以下代码安装环境：

```bash
# 安装依赖
npm install
```

### Build

运行以下代码进行打包：

```bash
npm run build
```