# 微服务

微服务底层基于[moleculer](https://moleculer.services/)构建，一个 Node.js 快速、可扩展、容错的微服务框架

[cool-admin 微服务的基本用法视频教程](https://www.bilibili.com/video/BV1iu411r7EJ/)

#### 检出模板项目

[https://github.com/cool-team-official/cool-admin-midway-rpc](https://github.com/cool-team-official/cool-admin-midway-rpc)

```shell
git clone https://github.com/cool-team-official/cool-admin-midway-rpc.git
```

#### 开启微服务

admin 和 其他微服务都需要开启，可以把 admin 当成你的主服务，其他微服务相当于 admin 的 service，只是把这些 service 分离出去，而且每个 service 可以部署多个供 admin 调用。

configuration.ts

```ts
import * as rpc from "@cool-midway/rpc";

@Configuration({
	imports: [
		// rpc 微服务 远程调用
		rpc,
		{
			component: info,
			enabledEnvironment: ["local"]
		}
	],
	importConfigs: [join(__dirname, "./config")]
})
export class ContainerLifeCycle {
	@App()
	app: koa.Application;

	async onReady() {}
}
```

#### 编写微服务业务

`src/service/goods`

```ts
import { Provide } from "@midwayjs/decorator";
import { BaseRpcService, CoolRpcService, CoolRpcTransaction } from "@cool-midway/rpc";
import { InjectEntityModel } from "@midwayjs/orm";
import { QueryRunner, Repository } from "typeorm";
import { DemoGoodsEntity } from "../entity/goods";
import { CoolCommException } from "@cool-midway/core";

/**
 * 描述
 */
@Provide()
@CoolRpcService({
	entity: DemoGoodsEntity,
	method: ["add", "delete", "update", "info", "list", "page"]
})
export class DemoGoodsService extends BaseRpcService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 测试
	 */
	async test(params) {
		console.log(params);
		return params;
	}

	/**
	 * 分布式事务测试
	 * @param rpcTransactionId 事务ID
	 * @param queryRunner 事务执行器
	 */
	@CoolRpcTransaction()
	async transaction(params, rpcTransactionId?, queryRunner?: QueryRunner) {
		const data = {
			title: "商品标题",
			pic: "https://xxx",
			price: 99.0,
			type: 1
		};
		await queryRunner.manager.save(DemoGoodsEntity, data);
		throw new CoolCommException("测试抛出异常回滚事务");
	}
}
```

#### 修改配置文件

默认是以 redis 为服务之间的交流与事件传播，redis 版本建议 6.x

```ts
config.cool = {
	rpc: {
		name: "服务名称，服务名称整个集群确保唯一"
	},
	redis: {
		host: "127.0.0.1",
		password: "",
		port: 6379,
		db: 0
	}
};
```

#### 独立 redis

默认是以 redis 为服务之间的交流与事件传播

```ts
config.cool = {
	rpc: {
		name: "服务名称",
		//
		redis: {
			host: "192.168.10.14",
			password: "",
			port: 6379,
			db: 1
		}
	},
	// 缓存的redis
	redis: {
		host: "192.168.10.14",
		password: "",
		port: 6379,
		db: 0
	}
};
```

redis cluster 方式

```ts
[
	{
		host: "192.168.0.103",
		port: 7000
	},
	{
		host: "192.168.0.103",
		port: 7001
	},
	{
		host: "192.168.0.103",
		port: 7002
	},
	{
		host: "192.168.0.103",
		port: 7003
	},
	{
		host: "192.168.0.103",
		port: 7004
	},
	{
		host: "192.168.0.103",
		port: 7005
	}
];
```

#### 本地调试

POST http://127.0.0.1:8002/rpc/test

Body

```json
{
	"name": "goods", // 服务的名称
	"service": "goodsService", // 具体的service
	"method": "page", // 调用service的方法
	"params": {
		// 参数
	}
}
```

#### 远程调用

```ts
  @Inject()
  rpc: CoolRpc;

  await this.rpc.call('goods', 'demoGoodsService', 'test', { a: 1 })

```

## 集群事件

### 注册事件

```ts
import { CoolRpcEvent, CoolRpcEventHandler } from "@cool-midway/rpc";

@CoolRpcEvent()
export class TestRpcEvent {
	/**
	 * 监听事件
	 * @param params 事件参数
	 */
	@CoolRpcEventHandler()
	async test(params) {
		console.log("收到事件参数", params);
	}
}
```

### 事件类型

#### 普通事件

多个相同的服务，只会选择其中一个执行

![](/admin/node/rpc-balanced-event.gif)

发送事件

```ts
  @Inject()
  rpc: CoolRpc;

  this.rpc.event('test1', { a: 1 }, '选填，服务名称，多个传数组');

```

#### 广播事件

所有服务都会收到

![](/admin/node/rpc-broadcast-event.gif)

发送事件

```ts
  @Inject()
  rpc: CoolRpc;

  this.rpc.broadcastEvent('test', { a: 1 });

```

#### 本地事件

只有本服务才会收到

```ts
@Inject()
  rpc: CoolRpc;

  this.rpc.broadcastLocalEvent('test', { a: 1 });
}

```

## 分布式事务

在微服务场景下，有可能每个服务都是连接着不同的数据库，同时也是一个比较单独的服务，所以普通的处理单体事务的方式不再适用。

目前解决分布式事务的方法多种多样：`2PC(二段提交)`、`TCC`、`消息事务`等。

`cool-admin`微服务分布式事务基于`moleculer`的事件，采用二段提交方式，协调整个集群事务。

2PC（Two-phase commit protocol），中文叫二阶段提交。 二阶段提交是一种强一致性设计，2PC 引入一个事务协调者的角色来协调管理各参与者（也可称之为各本地资源）的提交和回滚，二阶段分别指的是准备（投票）和提交两个阶段。

#### 示例

```ts
import { App, Inject, Provide } from "@midwayjs/decorator";
import { DemoGoodsEntity } from "../entity/goods";
import { IMidwayApplication } from "@midwayjs/core";
import { BaseRpcService, CoolRpc, CoolRpcService, CoolRpcTransaction } from "@cool-midway/rpc";
import { QueryRunner } from "typeorm";

@Provide()
@CoolRpcService({
	entity: DemoGoodsEntity,
	method: ["info", "add", "page"]
})
export class DemoRpcService extends BaseRpcService {
	@App()
	app: IMidwayApplication;

	@Inject()
	rpc: CoolRpc;

	/**
	 * 分布式事务
	 * @param params 方法参数
	 * @param rpcTransactionId 无需调用者传参， 本次事务的ID，ID会自动注入无需调用者传参
	 * @param queryRunner 无需调用者传参，操作数据库，需要用queryRunner操作数据库，才能统一提交或回滚事务
	 */
	// 注解启用分布式事务，参数可以指定事务类型
	@CoolRpcTransaction()
	async transaction(params, rpcTransactionId?, queryRunner?: QueryRunner) {
		console.log("获得的参数", params);
		const data = {
			title: "商品标题",
			pic: "https://xxx",
			price: 99.0,
			type: 1
		};
		await queryRunner.manager.save(DemoGoodsEntity, data);

		// 将事务id传给调用的远程服务方法
		await this.rpc.call("goods", "demoGoodsService", "transaction", {
			rpcTransactionId
		});
	}

	async info(params) {
		return params;
	}
	async getUser() {
		return {
			uid: "123",
			username: "mockedName",
			phone: "12345678901",
			email: "xxx.xxx@xxx.com"
		};
	}
}
```

::: warning
使用异步操作有可能导致事务失效，`@CoolRpcTransaction`内部已经实现了异常捕获， `rpcTransactionId`、`queryRunner`、`commit`三个参数无需调用者传参
:::
