# 控制器(Controller)

为了实现`快速CRUD`与`自动路由`功能，框架基于[midwayjs controller](https://www.midwayjs.org/docs/controller)，进行改造加强

完全继承[midwayjs controller](https://www.midwayjs.org/docs/controller)的所有功能

`快速CRUD`与`自动路由`，大大提高编码效率与编码量

## 路由前缀

虽然可以手动设置，但是我们并不推荐，cool-admin 在全局权限校验包含一定的规则，

如果你没有很了解框架原理手动设置可能产生部分功能失效的问题

### 手动

`/api/other`

无通用 CRUD 设置方法

```ts
import { Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";

/**
 * 商品
 */
@Provide()
@CoolController("/api")
export class AppDemoGoodsController extends BaseController {
	/**
	 * 其他接口
	 */
	@Get("/other")
	async other() {
		return this.ok("hello, cool-admin!!!");
	}
}
```

含通用 CRUD 配置方法

```ts
import { Get, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { DemoGoodsEntity } from "../../entity/goods";

/**
 * 商品
 */
@Provide()
@CoolController({
	prefix: "/api",
	api: ["add", "delete", "update", "info", "list", "page"],
	entity: DemoGoodsEntity
})
export class AppDemoGoodsController extends BaseController {
	/**
	 * 其他接口
	 */
	@Get("/other")
	async other() {
		return this.ok("hello, cool-admin!!!");
	}
}
```

### 自动

大多数情况下你无需指定自己的路由前缀，路由前缀将根据规则自动生成。

::: warning 警告
自动路由只影响模块中的 controller，其他位置建议不要使用
:::

`src/modules/demo/controller/app/goods.ts`

路由前缀是根据文件目录文件名按照[规则](/admin/node/core/controller.html#规则)生成的，上述示例生成的路由为

`http://127.0.0.1:8001/app/demo/goods/xxx`

`xxx`代表具体的方法，如： `add`、`page`、`other`

```ts
import { Get, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { DemoGoodsEntity } from "../../entity/goods";

/**
 * 商品
 */
@Provide()
@CoolController({
	api: ["add", "delete", "update", "info", "list", "page"],
	entity: DemoGoodsEntity
})
export class AppDemoGoodsController extends BaseController {
	/**
	 * 其他接口
	 */
	@Get("/other")
	async other() {
		return this.ok("hello, cool-admin!!!");
	}
}
```

### 规则

/controller 文件夹下的文件夹名或者文件名/模块文件夹名/方法名

#### 举例

```ts
 // 模块目录
 ├── modules
 │   └── demo(模块名)
 │   │    └── controller(api接口)
 │   │    │     └── app(参数校验)
 │   │    │     │     └── goods.ts(商品的controller)
 │   │    │     └── pay.ts(支付的controller)
 │   │    └── config.ts(必须，模块的配置)
 │   │    └── init.sql(可选，初始化该模块的sql)

```

生成的路由前缀为：
`/pay/demo/xxx(具体的方法)`与`/app/demo/goods/xxx(具体的方法)`

## CRUD

### 参数配置(CurdOption)

通用增删改查配置参数

| 参数               | 类型     | 说明                                                          | 备注 |
| ------------------ | -------- | ------------------------------------------------------------- | ---- |
| prefix             | String   | 手动设置路由前缀                                              |      |
| api                | Array    | 快速 API 接口可选`add` `delete` `update` `info` `list` `page` |      |
| pageQueryOp        | QueryOp  | 分页查询设置                                                  |      |
| listQueryOp        | QueryOp  | 列表查询设置                                                  |      |
| insertParam        | Function | 请求插入参数，如新增的时候需要插入当前登录用户的 ID           |      |
| infoIgnoreProperty | Array    | `info`接口忽略返回的参数，如用户信息不想返回密码              |      |

### 查询配置(QueryOp)

分页查询与列表查询配置参数

| 参数              | 类型     | 说明                                                                                | 备注 |
| ----------------- | -------- | ----------------------------------------------------------------------------------- | ---- |
| keyWordLikeFields | Array    | 支持模糊查询的字段，如一个表中的`name`字段需要模糊查询                              |      |
| where             | Function | 其他查询条件                                                                        |      |
| select            | Array    | 选择查询字段                                                                        |      |
| fieldEq           | Array    | 筛选字段，字符串数组或者对象数组{ column: string, requestParam: string }，如 type=1 |      |
| addOrderBy        | Object   | 排序                                                                                |      |
| join              | JoinOp[] | 关联表查询                                                                          |      |

### 关联表(JoinOp)

关联表查询配置参数

| 参数      | 类型   | 说明                                                               |
| --------- | ------ | ------------------------------------------------------------------ |
| entity    | Class  | 实体类                                                             |
| alias     | String | 别名，如果有关联表默认主表的别名为`a`, 其他表一般按 b、c、d...设置 |
| condition | String | 关联条件                                                           |
| type      | String | 内关联： 'innerJoin', 左关联：'leftJoin'                           |

### 完整示例

```ts
import { Get, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { BaseSysUserEntity } from "../../../base/entity/sys/user";
import { DemoAppGoodsEntity } from "../../entity/goods";

/**
 * 商品
 */
@Provide()
@CoolController({
	// 添加通用CRUD接口
	api: ["add", "delete", "update", "info", "list", "page"],
	// 设置表实体
	entity: DemoAppGoodsEntity,
	// 向表插入当前登录用户ID
	insertParam: (ctx) => {
		return {
			// 获得当前登录的后台用户ID，需要请求头传Authorization参数
			userId: ctx.admin.userId
		};
	},
	// 操作crud之前做的事情 @cool-midway/core@3.2.14 新增
	before: (ctx) => {
		// 将前端的数据转JSON格式存数据库
		const { data } = ctx.request.body;
		ctx.request.body.data = JSON.stringify(data);
	},
	// info接口忽略价格字段
	infoIgnoreProperty: ["price"],
	// 分页查询配置
	pageQueryOp: {
		// 让title字段支持模糊查询
		keyWordLikeFields: ["title"],
		// 让type字段支持筛选，请求筛选字段与表字段一致是情况
		fieldEq: ["type"],
		// 多表关联，请求筛选字段与表字段不一致的情况
		fieldEq: [{ column: "a.id", requestParam: "id" }],
		// 指定返回字段，注意多表查询这个是必要的，否则会出现重复字段的问题
		select: ["a.*", "b.name", "a.name AS userName"],
		// 4.x置为过时 改用 join 关联表用户表
		leftJoin: [
			{
				entity: BaseSysUserEntity,
				alias: "b",
				condition: "a.userId = b.id"
			}
		],
		// 4.x新增
		join: [
			{
				entity: BaseSysUserEntity,
				alias: "b",
				condition: "a.userId = b.id",
				type: "innerJoin"
			}
		],
		// 4.x 新增 追加其他条件
		extend: async (find: SelectQueryBuilder<DemoGoodsEntity>) => {
			find.groupBy("a.id");
		},
		// 增加其他条件
		where: async (ctx) => {
			// 获取body参数
			const { a } = ctx.request.body;
			return [
				// 价格大于90
				["a.price > :price", { price: 90.0 }],
				// 满足条件才会执行
				["a.price > :price", { price: 90.0 }, "条件"],
				// 多个条件一起
				[
					"(a.price = :price or a.userId = :userId)",
					{ price: 90.0, userId: ctx.admin.userId }
				]
			];
		},
		// 添加排序
		addOrderBy: {
			price: "desc"
		}
	}
})
export class DemoAppGoodsController extends BaseController {
	/**
	 * 其他接口
	 */
	@Get("/other")
	async other() {
		return this.ok("hello, cool-admin!!!");
	}
}
```

::: warning
如果是多表查询，必须设置 select 参数，否则会出现重复字段的错误，因为每个表都继承了 BaseEntity，至少都有 id、createTime、updateTime 三个相同的字段。
:::

通过这一波操作之后，我们的商品接口的功能已经很强大了，除了通用的 CRUD，我们的接口还支持多种方式的数据筛选

### 获得 ctx 对象

```ts
@CoolController(
  {
    api: ['add', 'delete', 'update', 'info', 'list', 'page'],
    entity: DemoAppGoodsEntity,
    // 获得ctx对象
    listQueryOp: ctx => {
      return new Promise<QueryOp>(res => {
        res({
          fieldEq: [],
        });
      });
    },
    // 获得ctx对象
    pageQueryOp: ctx => {
      return new Promise<QueryOp>(res => {
        res({
          fieldEq: [],
        });
      });
    },
  },
  {
    middleware: [],
  }
)
```

### 接口调用

`add` `delete` `update` `info` 等接口可以用法[参照快速开始](/admin/node/quick.html#接口调用)

这里详细说明下`page` `list`两个接口的调用方式，这两个接口调用方式差不多，一个是分页一个是非分页。
以`page`接口为例

#### 分页

POST `/admin/demo/goods/page` 分页数据

**请求**
Url: http://localhost:8001/admin/demo/goods/page

Method: POST

#### Body

```json
{
	"keyWord": "商品标题", // 模糊搜索，搜索的字段对应keyWordLikeFields
	"type": 1, // 全等于筛选，对应fieldEq
	"page": 2, // 第几页
	"size": 1, // 每页返回个数
	"sort": "desc", // 排序方向
	"order": "id" // 排序字段
}
```

**返回**

```json
{
	"code": 1000,
	"message": "success",
	"data": {
		"list": [
			{
				"id": 4,
				"createTime": "2021-03-12 16:23:46",
				"updateTime": "2021-03-12 16:23:46",
				"title": "这是一个商品2",
				"pic": "https://show.cool-admin.com/uploads/20210311/2e393000-8226-11eb-abcf-fd7ae6caeb70.png",
				"price": "99.00",
				"userId": 1,
				"type": 1,
				"name": "超级管理员"
			}
		],
		"pagination": {
			"page": 2,
			"size": 1,
			"total": 4
		}
	}
}
```

### 重写 CRUD 实现

在实际开发过程中，除了这些通用的接口可以满足大部分的需求，但是也有一些特殊的需求无法满足用户要求，这个时候也可以重写`add` `delete` `update` `info` `list` `page` 的实现

#### 编写 service

在模块新建 service 文件夹(名称非强制性)，再新建一个`service`实现，继承框架的`BaseService`

```ts
import { Inject, Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/orm";
import { Repository } from "typeorm";
import { BaseSysMenuEntity } from "../../entity/sys/menu";
import * as _ from "lodash";
import { BaseSysPermsService } from "./perms";

/**
 * 菜单
 */
@Provide()
export class BaseSysMenuService extends BaseService {
	@Inject()
	ctx;

	@InjectEntityModel(BaseSysMenuEntity)
	baseSysMenuEntity: Repository<BaseSysMenuEntity>;

	@Inject()
	baseSysPermsService: BaseSysPermsService;

	/**
	 * 重写list实现
	 */
	async list() {
		const menus = await this.getMenus(
			this.ctx.admin.roleIds,
			this.ctx.admin.username === "admin"
		);
		if (!_.isEmpty(menus)) {
			menus.forEach((e) => {
				const parentMenu = menus.filter((m) => {
					e.parentId = parseInt(e.parentId);
					if (e.parentId == m.id) {
						return m.name;
					}
				});
				if (!_.isEmpty(parentMenu)) {
					e.parentName = parentMenu[0].name;
				}
			});
		}
		return menus;
	}
}
```

#### 设置服务实现

`CoolController`设置自己的服务实现

```ts
import { Inject, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { BaseSysMenuEntity } from "../../../entity/sys/menu";
import { BaseSysMenuService } from "../../../service/sys/menu";

/**
 * 菜单
 */
@Provide()
@CoolController({
	api: ["add", "delete", "update", "info", "list", "page"],
	entity: BaseSysMenuEntity,
	service: BaseSysMenuService
})
export class BaseSysMenuController extends BaseController {
	@Inject()
	baseSysMenuService: BaseSysMenuService;
}
```

## 路由标签

我们经常有这样的需求：给某个请求地址打上标记，如忽略 token，忽略签名等。

```ts
import { Get, Inject, Provide } from "@midwayjs/decorator";
import {
	CoolController,
	BaseController,
	CoolUrlTag,
	TagTypes,
	CoolUrlTagData
} from "@cool-midway/core";

/**
 * 测试给URL打标签
 */
@Provide()
@CoolController({
	api: [],
	entity: "",
	pageQueryOp: () => {}
})
// add 接口忽略token
@CoolUrlTag({
	key: TagTypes.IGNORE_TOKEN,
	value: ["add"]
})
export class DemoAppTagController extends BaseController {
	@Inject()
	tag: CoolUrlTagData;

	/**
	 * 获得标签数据， 如可以标记忽略token的url，然后在中间件判断
	 * @returns
	 */
	// 这是6.x支持的，可以直接标记这个接口忽略token，更加灵活优雅，但是记得配合@CoolUrlTag()一起使用，也就是Controller上要有这个注解，@CoolTag才会生效
	@CoolTag(TagTypes.IGNORE_TOKEN)
	@Get("/data")
	async data() {
		return this.ok(this.tag.byKey(TagTypes.IGNORE_TOKEN));
	}
}
```

#### 中间件

```ts
import { CoolUrlTagData, TagTypes } from "@cool-midway/core";
import { IMiddleware } from "@midwayjs/core";
import { Inject, Middleware } from "@midwayjs/decorator";
import { NextFunction, Context } from "@midwayjs/koa";

@Middleware()
export class DemoMiddleware implements IMiddleware<Context, NextFunction> {
	@Inject()
	tag: CoolUrlTagData;

	resolve() {
		return async (ctx: Context, next: NextFunction) => {
			const urls = this.tag.byKey(TagTypes.IGNORE_TOKEN);
			console.log("忽略token的URL数组", urls);
			// 这里可以拿到下一个中间件或者控制器的返回值
			const result = await next();
			// 控制器之后执行的逻辑
			// 返回给上一个中间件的结果
			return result;
		};
	}
}
```
