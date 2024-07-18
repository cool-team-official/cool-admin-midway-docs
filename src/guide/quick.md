# 快速开始

## 开发工具

推荐使用[vscode](https://code.visualstudio.com/)，进行项目开发，`cool-admin`为其内置了一些代码片段，加快开发效率。

当然你也可以使用[webstrom](https://www.jetbrains.com/zh-cn/webstorm/)等其他适合开发 node 项目的工具。

## 代码片段

框架为[vscode](https://code.visualstudio.com/)内置了一些代码片段，加快开发效率

- `entity`，实体类(表结构)；
- `config`，模块配置；
- `controller`，控制器(API 接口)；
- `event`，事件监听；
- `middleware`，中间件，处理请求之前，请求之后的动作；
- `queue`，队列；
- `service`，服务(处理业务逻辑)；

只需输入对应的关键字即可快速生成代码，如：快速创建`entity`

![](/admin/node/code-snippets.gif)

## 拉取代码

**Github**

[https://github.com/cool-team-official/cool-admin-midway](https://github.com/cool-team-official/cool-admin-midway)

**Gitee**

如果你的网络不佳，推荐`gitee`拉取代码

[https://gitee.com/cool-team-official/cool-admin-midway](https://gitee.com/cool-team-official/cool-admin-midway)

```shell
git clone https://github.com/cool-team-official/cool-admin-midway.git

或

git clone https://gitee.com/cool-team-official/cool-admin-midway.git
```

## 代码目录

项目主要目录结构

```ts
 ├── .vscode(代码片段，根据关键字可以快速地生成代码)
 ├── public(静态资源文件，如js、css或者上传的文件)
 ├── src
 │   └── comm(通用库)
 │   └── modules(项目模块)
 │   └── config
 │   │    └── config.default.ts(默认配置，不区分环境，都生效)
 │   │    └── config.local.ts(本地开发配置，对应npm run dev)
 │   │    └── config.prod.ts(生产环境配置，对应npm run start)
 │   │    └── plugin.ts(插件配置)
 │   └── configuration.ts(midway的配置文件)
 │   └── welcome.ts(环境的controller)
 │   └── interface.ts(类型声明)
 ├── test
 ├── package.json(依赖管理，项目信息)
 ├── bootstrap.js(生产环境启动入口文件，可借助pm2等工具多进程启动)
 ├── server.js(生产环境cfork方式启动入口文件，多进程)
 └── tsconfig.json
```

模块目录，这是一个推荐的目录除了`controller`、`config.ts`、`init.sql`其他目录可自由定义

```ts
 ├── modules
 │   └── base(基础的权限管理系统)
 │   │    └── controller(api接口)
 │   │    └── dto(参数校验)
 │   │    └── entity(实体类)
 │   │    └── middleware(中间件)
 │   │    └── schedule(定时任务)
 │   │    └── service(服务，写业务逻辑)
 │   │    └── config.ts(必须，模块的配置)
 │   │    └── init.sql(可选，初始化该模块的sql)

```

::: tip 提示
编码时应该有你自己的编码规范，好的编码规范可以更好地合作以及避免一些莫名其妙的错误
:::

## 自动格式化

1、vscode 按照`EsLint`插件；
2、打开 vscode 的`setting.json`, 文件/首选项/设置/打开设置 json/, 配置保存自动格式化：

```json
// #每次保存的时候将代码按eslint格式进行修复
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
},

```

## 配置运行

### 环境要求

- [必须][node>=12.0.0](http://nodejs.cn/)，推荐使用[node>=16.x](http://nodejs.cn/)；
- [必须][mysql>=5.7](https://www.runoob.com/mysql/mysql-tutorial.html)，推荐使用[mysql>=8.x](https://www.runoob.com/mysql/mysql-tutorial.html)；
- [可选][redis>=5.x](https://redis.io/)，推荐[redis>=6.x](https://redis.io/)，当你需要使用分布式任务调度与队列功能，需要配置；

::: tip 提示
即使不配置[redis](https://redis.io/)，[midwayjs](https://www.midwayjs.org/)也自带本地[定时任务功能](https://www.midwayjs.org/docs/extensions/cron)，可以满足部分需求，只是无法使用 admin 的界面操作。
:::

### 数据库配置

支持`Mysql`、`PostgreSQL`、`Sqlite`三种数据库

#### Mysql

`src/config/config.local.ts`

```ts
import { CoolConfig } from "@cool-midway/core";
import { MidwayConfig } from "@midwayjs/core";

export default {
  typeorm: {
    dataSource: {
      default: {
        type: "mysql",
        host: "127.0.0.1",
        port: 3306,
        username: "root",
        password: "123456",
        database: "cool",
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // 字符集
        charset: "utf8mb4",
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ["**/modules/*/entity"],
      },
    },
  },
} as MidwayConfig;
```

#### PostgreSQL

需要先安装驱动

```shell
npm install pg --save
```

`src/config/config.local.ts`

```ts
import { CoolConfig } from "@cool-midway/core";
import { MidwayConfig } from "@midwayjs/core";

export default {
  typeorm: {
    dataSource: {
      default: {
        type: "postgres",
        host: "127.0.0.1",
        port: 5432,
        username: "postgres",
        password: "123456",
        database: "cool",
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // 字符集
        charset: "utf8mb4",
        // 是否开启缓存
        cache: true,
        // 实体路径
        entities: ["**/modules/*/entity"],
      },
    },
  },
} as MidwayConfig;
```

#### Sqlite

需要先安装驱动

```shell
npm install sqlite3 --save
```

`src/config/config.local.ts`

```ts
import { CoolConfig } from "@cool-midway/core";
import { MidwayConfig } from "@midwayjs/core";
import * as path from "path";

export default {
  typeorm: {
    dataSource: {
      default: {
        type: "sqlite",
        // 数据库文件地址
        database: path.join(__dirname, "../../cool.sqlite"),
        // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
        synchronize: true,
        // 打印日志
        logging: false,
        // 实体路径
        entities: ["**/modules/*/entity"],
      },
    },
  },
} as MidwayConfig;
```

### 运行后端

#### 安装依赖

切换到后端项目根目录，与`package.json`同级

::: code-group

```sh [pnpm]
pnpm i
```

```sh [npm]
npm install
```

```sh [yarn]
yarn
```

:::

::: details 安装遇到了网络问题？
如果你的网络不佳，安装依赖需要很长时间，可以切换为[阿里镜像源](https://npmmirror.com/)

```sh
# pnpm
pnpm config set registry https://registry.npmmirror.com/

# npm
npm config set registry https://registry.npmmirror.com/

# yarn
yarn config set registry https://registry.npmmirror.com/

```

:::

::: tip 小贴士
windows 下安装 cnpm 后，在 vscode 的终端运行有可能会出现如下错误：`xxx : 无法将“xxx”项识别为 cmdlet、函数、脚本文件或可运行程序的名称`

解决方法：

- 右击 VSCode 图标，选择以管理员身份运行；
- 在终端中执行 get-ExecutionPolicy，显示 Restricted，表示状态是禁止的；
- 这时执行 set-ExecutionPolicy RemoteSigned；
- 此时再执行 get-ExecutionPolicy，显示 RemoteSigned，则表示状态解禁，可以运行

:::

#### 启动

切换到项目根目录，与`package.json`同级

::: code-group

```sh [pnpm]
pnpm dev
```

```sh [npm]
npm run dev
```

```sh [yarn]
yarn dev
```

:::

<img src="/admin/node/run.gif" style="width:80%"/>

::: tip 提示
框架会自动导入数据库，无需手动导入
:::

访问[http://127.0.0.1:8001](http://127.0.0.1:8001)，出现以下界面代表运行成功

<img src="/admin/node/run-success.png" style="width:80%"/>

### 运行前端

[点击前往前端项目详细文档](https://vue.cool-admin.com)

在项目根目录下(跟 package.json 同级)执行命令：

::: code-group

```sh [pnpm]
# 安装依赖
pnpm i
# 运行
pnpm dev
```

```sh [npm]
# 安装依赖
npm install
# 运行
npm run dev
```

```sh [yarn]
# 安装依赖
yarn
# 运行
yarn dev
```

:::

访问[http://127.0.0.1:9000/](http://127.0.0.1:9000/)
默认账户密码

> 账户：admin  
> 密码：123456

![](/show/admin.png)

## 快速 CRUD

### Ai 编码

[从前端到页面的快速 CRUD 可以查看 Ai 编码](/src/guide/ai.html)

### 后端

大部分的后台管理系统，或者 API 服务都是对数据进行管理，所以可以看到大量的 CRUD 场景(增删改查)，cool-admin 对此进行了大量地封装，让这块的编码量变得极其地少。

#### 创建表

`src/modules/demo/entity/goods.ts`

```ts
import { EntityModel } from "@midwayjs/orm";
import { BaseEntity } from "@cool-midway/core";
import { Column } from "typeorm";

/**
 * 商品
 */
@EntityModel("demo_goods")
export class DemoGoodsEntity extends BaseEntity {
  @Column({ comment: "标题" })
  title: string;

  @Column({ comment: "图片" })
  pic: string;

  @Column({ comment: "价格", type: "decimal", precision: 5, scale: 2 })
  price: number;

  @Column({ comment: "分类", type: "tinyint", default: 0 })
  type: number;
}
```

::: tip 提示
运行代码框架会自动创建表，无需在数据库手动创建
:::

#### 编写接口

`src/modules/demo/controller/open/goods.ts`

```ts
import { DemoGoodsEntity } from "../../entity/goods";
import { BaseController, CoolController } from "@cool-midway/core";
import { DemoGoodsService } from "../../service/goods";

/**
 * 测试
 */
@CoolController({
  api: ["add", "delete", "update", "info", "page", "list"],
  entity: DemoGoodsEntity,
})
export class OpenDemoGoodsController extends BaseController {}
```

这样我们就完成了 6 个接口的编写，可以看到代码量是极少的，对应的接口如下：

- `POST /open/demo/goods/add` 新增
- `POST /open/demo/goods/delete` 删除
- `POST /open/demo/goods/update` 更新
- `GET /open/demo/goods/info` 单个信息
- `POST /open/demo/goods/list` 列表信息
- `POST /open/demo/goods/page` 分页查询(包含模糊查询、字段全匹配等)

**调用接口**

<img src="/admin/node/run-api.gif" style="width:80%"/>

:::tip 提示
POST 方法的参数都是放在请求 body 当中，格式是 JSON，GET 方法参数为 URL 参数

没有指定路由地址，是因为模块的 controller 路由是按照一定规则自动生成的，当然你也可以手动指定，但是我们并不建议你这么做
:::

### 前端

- 自动生成前端页面，通过管理后台菜单管理的快速创建即可生成

Ui 组件会根据字段智能选择

![](/admin/gen-vue.png)
