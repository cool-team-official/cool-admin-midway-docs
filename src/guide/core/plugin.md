# 扩展插件(plugin)

为了丰富系统功能，我们提供了插件系统，可以通过插件的方式来扩展系统功能。而不用一味地堆功能，导致系统臃肿。你可以自己开发插件，也可以使用别人开发的插件。 或者通过官网[下载插件](https://cool-js.com/plugin/list.html)。

## 视频教程

- [1、插件开发](https://www.bilibili.com/video/BV1aa4y187jh/)

- [2、插件发布与使用](https://www.bilibili.com/video/BV1mw41157bx/)

## 使用插件

### 1、安装

首先下载插件包，然后在系统中安装插件包。插件包可以通过官网[下载插件](https://cool-js.com/plugin/list.html)。

打开后台管理系统，点击左侧菜单`扩展管理`->`插件管理`，点击`+`按钮，选择插件包进行安装。

![](/admin/node/plugin-install.gif)

### 2、调用

安装插件之后，就可以在代码中调用插件的方法了。

```ts
import { CoolController, BaseController } from "@cool-midway/core";
import { PluginService } from "../../../plugin/service/info";
import { Get, Inject } from "@midwayjs/core";

/**
 * 插件
 */
@CoolController()
export class OpenDemoPluginController extends BaseController {
  // 注入插件服务
  @Inject()
  pluginService: PluginService;

  @Get("/invoke", { summary: "调用插件" })
  async invoke() {
    // test 是插件的标识， show 是插件的方法， 1,2 是传给插件的参数
    const result = await this.pluginService.invoke("test", "show", 1, 2);
    return this.ok(result);
  }
}
```

对应插件内的方法

```ts
  /**
   * 展示插件信息
   * @param a 参数a
   * @param b 参数b
   * @returns 插件信息
   */
  async show(a, b)
```

### 3、配置

有时候开发时的配置和生产环境的配置是不一样的，我们可以通过配置文件来实现。

例如原本的配置文件是这样的

```json
{
  "appId": "xxxxx",
  "appSecret": "xxxxx",
  "filePath": "@baseDir/xxx.txt"
}
```

::: tip 提示
`@baseDir`是特殊的关键字符， 表示项目根目录/src，如果是开发的时候则是插件的根目录
:::

多环境，如果要区分开发和生产环境，可以这样配置

```json
{
  "@local": {
    "appId": "xxxxx",
    "appSecret": "xxxxx"
  },
  "@prod": {
    "appId": "xxxxx",
    "appSecret": "xxxxx"
  }
}
```

- @local 表示本地环境
- @prod 表示生产环境

### 4、事件

插件已就绪的事件，可以在需要监听此事件的模块中监听，例如：`xxx模块/event/plugin.ts`,

```ts
import { CoolEvent, Event } from "@cool-midway/core";
import { EVENT_PLUGIN_READY } from "../../plugin/service/center";

/**
 * 插件事件
 */
@CoolEvent()
export class PluginEvent {
  /**
   * 插件已就绪
   */
  @Event(EVENT_PLUGIN_READY)
  async onPluginReady() {
    // 这边写上你要处理的逻辑，例如：初始化插件(有一些插件需要初始化)
  }
}
```

### 5、其他

```ts
@Inject()
pluginService: PluginService;

// 获得插件的实例
const instance = await this.pluginService.getInstance("插件标识key");
const result = await instance['demo']();

// 获得插件的配置
const config = await this.pluginService.getConfig("插件标识key");
```

## 开发插件

### 1、脚手架

为了方便开发插件和统一插件开发规范，我们提供了插件脚手架，可以快速开发我们的插件。

```bash
# github
git clone https://github.com/cool-team-official/cool-admin-midway-plugin.git
# gitee 如果你的网络不好，可以使用
git clone https://gitee.com/cool-team-official/cool-admin-midway-plugin.git
```

### 2、目录结构

```ts
 ├── .vscode(vscode的一些配置)
 ├── assets(资源文件，如图片等)
 ├── dist(运行编译后的时候自动生成)
 ├── release(打包发布的时候自动生成)
 ├── src
 │   └── index.ts(入口文件，所有插件的功能统一集中到这个文件)
 │   └── other.ts(其他文件，可自定义，不是必须的)
 ├── test
 │   └── index.ts(开发时的测试文件)
 ├── .gitattributes(git的一些配置)
 ├── .gitignore(git忽略文件)
 ├── LICENSE(开源协议)
 ├── package.json(依赖管理，项目信息)
 ├── plugin.json(插件的配置信息)
 ├── README.md(插件的介绍，会展示在插件的详情中)
 └── tsconfig.json(Typescript的配置文件)

```

### 3、开发过程

- 配置插件信息(plugin.json)

```json
{
  "name": "测试",
  "key": "test",
  "hook": "",
  "singleton": false,
  "version": "1.0.0",
  "description": "插件描述",
  "author": "作者",
  "logo": "assets/logo.png",
  "readme": "README.md",
  "config": {
    "appId": "xxxxx",
    "filePath": "@baseDir/xxx.txt"
  }
}
```

::: tip 提示
`config` 是插件的配置信息，不同的插件有不同的配置，上面只是个例子，实际开发中可以根据自己的需求来配置

`@baseDir`是特殊的关键字符， 表示项目根目录/src，如果是开发的时候则是插件的根目录
:::

**字段解释**

| 字段        | 说明                                         |
| ----------- | -------------------------------------------- |
| name        | 插件名称                                     |
| key         | 插件标识(英文)，唯一, 调用插件的时候需要用到 |
| hook        | 插件钩子，比如替换系统的上传组件，upload     |
| singleton   | 是否是单例插件，单例插件只会被实例化一次     |
| version     | 版本号                                       |
| description | 插件描述                                     |
| author      | 作者                                         |
| logo        | 插件 logo，建议尺寸 256x256                  |
| readme      | 插件介绍，会展示在插件的详情中               |
| config      | 插件配置， 每个插件的配置各不相同            |

::: warning 注意
请谨慎选择是否为单例插件，单例插件里无法获得的请求上下文 ctx ，如果单需要获得当前请求的 ctx，请将在调用的方法中传入 ctx。
:::

- 开发插件功能(src/index.ts)

```ts
import { BasePlugin } from "@cool-midway/plugin-cli";
import axios from "axios";
import "./other";

/**
 * 描述
 */
export class CoolPlugin extends BasePlugin {
  /**
   * 展示插件信息
   * @param a 参数a
   * @param b 参数b
   * @returns 插件信息
   */
  async show(a, b) {
    console.log("传参", a, b);
    return this.pluginInfo;
  }

  /**
   * 请求网络示例
   */
  async demo() {
    const res = await axios.get("https://www.baidu.com");
    return res.data;
  }
}

// 导出插件实例， Plugin名称不可修改
export const Plugin = CoolPlugin;
```

- 测试插件(test/index.ts)

```ts
import { Plugin } from "../src/index";
import pluginInfo from "../plugin.json";

// 实例化插件
const indexInstance = new Plugin();
// 初始化插件
indexInstance.init(pluginInfo);

// 调用插件方法
indexInstance.demo();
```

执行测试

```bash
// 运行测试
npm run dev

// 此操作会先编译成js文件，然后执行测试
npm run test
```

- 打包发布

打包命令

```bash
npm run release
```

执行命令之后如果一切顺利的话你会在`release`目录下得到一个`.cool`后缀的插件包。

这个插件包你可以直接发给其他人安装使用，或者分享到[插件市场](https://cool-js.com/plugin/list.html)，您的插件将帮助到很多人，我们鼓励您分享您的插件。

### 4、插件源码

[一个智谱 AI 引擎插件源码示例](/admin/node/plugin-demo.zip)

### 5、使用缓存

插件继承框架的缓存，`this.cache`就是[MidwayCache](http://www.midwayjs.org/docs/extensions/caching)，使用方式看官方文档。

```ts
export class CoolPlugin extends BasePlugin {
  // 使用缓存
  async useCache() {
    this.cache.set("a", 1);
    console.log(this.cache.get("a"));
  }
}
```

### 6、生命周期

- 插件已就绪

插件初始化完成之后会触发`ready`方法，可以在这个方法中做一些初始化操作。

```ts
import { BasePlugin } from "@cool-midway/plugin-cli";
/**
 * 描述
 */
export class CoolPlugin extends BasePlugin {
  /**
   * 插件已就绪，注意：单例插件只会执行一次，非单例插件每次调用都会执行
   */
  async ready() {
    console.log("插件就绪");
  }
}

// 导出插件实例， Plugin名称不可修改
export const Plugin = CoolPlugin;
```

::: warning 注意
插件已就绪，注意：单例插件只会执行一次，非单例插件每次调用都会执行，单例插件每次修改完配置也会重新初始化插件，而触发该事件。
:::

### 7、调用其他插件

在插件中也可以调用其他插件，同样通过操作`pluginService`实现，`pluginService`跟 cool-admin 中的`pluginService`一致。

```ts
import { BasePlugin } from "@cool-midway/plugin-cli";

/**
 * 插件实例
 */
export class CoolPlugin extends BasePlugin {
  /**
   * 调用其他插件
   */
  async usePlugin() {
    // 获得其他插件，开发的时候无法调试，只有安装到cool-admin中才能调试
    const plugin = await this.pluginService.getInstance("xxx");
    console.log(plugin);
  }
}
```
