# 事件

事件是开发过程中经常使用到的功能，我们经常利用它来做一些解耦的操作。如：更新了用户信息，其他需要更新相关信息的操作自行监听更新等

## 新建监听

```ts
import { Provide, Scope, ScopeEnum } from "@midwayjs/decorator";
import { CoolEvent, Event } from "@cool-midway/core";

/**
 * 接收事件
 */
@CoolEvent()
export class DemoEvent {
	/**
	 * 根据事件名接收事件
	 * @param msg
	 * @param a
	 */
	@Event("updateUser")
	async updateUser(msg, a) {
		console.log("ImEvent", "updateUser", msg, a);
	}
}
```

## 发送事件

```ts
import { Get, Inject, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController, CoolEventManager } from "@cool-midway/core";

/**
 * 事件
 */
@CoolController()
export class DemoEventController extends BaseController {
	@Inject()
	coolEventManager: CoolEventManager;

	/**
	 * 发送事件
	 */
	@Get("/send")
	public async send() {
		this.coolEventManager.emit("updateUser", { a: 1 }, 12);
	}
}
```

## 多进程通信

当你的项目利用如`pm2`等工具部署为 cluster 模式的时候，你的项目会有多个进程，这时候你的事件监听和发送只会在当前进程内有效，如果你需要触发到所有或者随机一个进程，需要使用多进程通信，这里我们提供了一个简单的方式来实现多进程通信。

需要根据你的业务需求来使用该功能！！！

```ts
import { Get, Inject, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController, CoolEventManager } from "@cool-midway/core";

/**
 * 事件
 */
@Provide()
@CoolController()
export class DemoEventController extends BaseController {
	@Inject()
	coolEventManager: CoolEventManager;

	@Post("/global", { summary: "全局事件，多进程都有效" })
	async global() {
		await this.coolEventManager.globalEmit("demo", false, { a: 2 }, 1);
		return this.ok();
	}
}
```

**globalEmit**

```ts
/**
 * 发送全局事件
 * @param event 事件
 * @param random 是否随机一个
 * @param args 参数
 * @returns
 */
globalEmit(event: string, random?: boolean, ...args: any[])
```
