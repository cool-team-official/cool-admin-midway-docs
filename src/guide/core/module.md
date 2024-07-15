# 模块开发(module)

对于一个应用开发，我们应该更加有规划，`cool-admin`提供了模块开发的概念。

建议模块目录`src/modules/模块名`

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
 │   │    └── db.json(可选，初始化该模块的sql)
 │   │    └── menu.json(可选(7.x新增，配合模块市场使用)，初始化该模块的菜单)

```

## 模块配置

#### config.ts

```ts
import { ModuleConfig } from '@cool-midway/core';

/**
 * 模块配置
 */
export default () => {
  return {
    // 必须，模块名称
    name: '聊天模块',
    // 必须，模块描述
    description: '基于socket.io提供即时通讯聊天功能',
    // 可选，中间件，只对本模块有效
    middlewares: [],
    // 可选，全局中间件
    globalMiddlewares: [],
    // 可选，模块加载顺序，默认为0，值越大越优先加载
    order: 1;
    // 其他配置，jwt配置
    jwt: 'IUFHOFNIWI',
  } as ModuleConfig;
};

```

::: warning
config.ts 的配置文件是必须的，有几个必填项描述着模块的功能，当然除此之外，你还可以设置模块的一些特有配置
:::

#### 引入配置

```ts

  @Config('module.模块名，模块文件夹名称，如demo')
  config;

```

## 数据导入

在模块中预设要导入的数据，位于`模块/db.json`

1、向`dict_type`表导入数据

```json
{
	"dict_type": [
		{
			"name": "升级类型",
			"key": "upgradeType"
		}
	]
}
```

2、导入有层级的数据，比如`dict_info`表需要先插入`dict_type`拿到`id`，再插入`dict_info`

```json
{
	"dict_type": [
		{
			"name": "升级类型",
			"key": "upgradeType",
			"@childDatas": {
				"dict_info": [
					{
						"typeId": "@id",
						"name": "安卓",
						"orderNum": 1,
						"remark": null,
						"parentId": null,
						"value": "0"
					},
					{
						"typeId": "@id",
						"name": "IOS",
						"orderNum": 1,
						"remark": null,
						"parentId": null,
						"value": "1"
					}
				]
			}
		}
	]
}
```

`@childDatas`是一个特殊的字段，表示该字段下的数据需要先插入父级表，再插入子级表，`@id`表示父级表的`id`，`@id`是一个特殊的字段，表示插入父级表后，会返回`id`，然后插入子级表

## 菜单导入

在模块中预设要导入的菜单，位于`模块/menu.json`，菜单数据可以通过后台管理系统的菜单管理导出，不需要手动编写

```json
[
	{
		"name": "应用管理",
		"router": null,
		"perms": null,
		"type": 0,
		"icon": "icon-app",
		"orderNum": 2,
		"viewPath": null,
		"keepAlive": true,
		"isShow": true,
		"childMenus": [
			{
				"name": "套餐管理",
				"router": "/app/goods",
				"perms": null,
				"type": 1,
				"icon": "icon-goods",
				"orderNum": 0,
				"viewPath": "modules/app/views/goods.vue",
				"keepAlive": true,
				"isShow": true
			}
		]
	}
]
```

#### 关闭自动导入

通过该配置开启自动初始化模块数据库脚本

```ts
cool: {
    // 是否自动导入数据库
    initDB: false,
  } as CoolConfig,
```

::: warning
我们不建议在生产环境使用该功能，生产环境是数据库请通过本地导入与同步数据库结构
:::

#### 重新初始化

首次启动会初始化模块数据库，初始化完成会在项目根目录生成`.lock`文件，下次启动就不会重复导入，如果需要重新导入，删除该文件夹即可

```ts
 ├── lock
 │   ├── db
 │        └── base.db.lock(base模块)
 │        └── task.db.lock(task模块)
 │   ├── menu
 │        └── base.menu.lock(base模块)
 │        └── task.menu.lock(task模块)
 │──package.json
```
