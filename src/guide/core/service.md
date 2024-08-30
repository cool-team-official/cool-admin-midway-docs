# 服务(Service)

我们一般将业务逻辑写在`Service`层，`Controller`层只做参数校验、数据转换等操作，`Service`层做具体的业务逻辑处理。

`cool-admin`对基本的`Service`进行封装；

## 重写 CRUD

`Controller`的六个快速方法，`add`、`update`、`delete`、`info`、`list`、`page`，是通过调用一个通用的`BaseService`的方法实现，所以我们可以重写`Service`的方法来实现自己的业务逻辑。

**示例**

重写 add 方法

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 新增
	 * @param param
	 * @returns
	 */
	async add(param: any) {
		// 调用原本的add，如果不需要可以不用这样写，完全按照自己的新增逻辑写
		const result = await super.add(param);
		// 你自己的业务逻辑
		return result;
	}
}
```

记得在`Controller`上配置对应的`Service`才会使其生效

```ts
import { DemoGoodsService } from "../../service/goods";
import { DemoGoodsEntity } from "../../entity/goods";
import { Body, Inject, Post, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 测试
 */
@Provide()
@CoolController({
	api: ["add", "delete", "update", "info", "list", "page"],
	entity: DemoGoodsEntity,
	service: DemoGoodsService
})
export class AppDemoGoodsController extends BaseController {}
```

## 普通查询(TypeOrm)

普通查询基于[TypeOrm](https://typeorm.io/)，点击查看官方详细文档

**示例**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { In, Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	async typeorm() {
		// 新增单个，传入的参数字段在数据库中一定要存在
		await this.demoGoodsEntity.insert({ title: "xxx" });
		// 新增单个，传入的参数字段在数据库中可以不存在
		await this.demoGoodsEntity.save({ title: "xxx" });
		// 新增多个
		await this.demoGoodsEntity.save([{ title: "xxx" }]);
		// 查找单个
		await this.demoGoodsEntity.findOneBy({ id: 1 });
		// 查找多个
		await this.demoGoodsEntity.findBy({ id: In([1, 2]) });
		// 删除单个
		await this.demoGoodsEntity.delete(1);
		// 删除多个
		await this.demoGoodsEntity.delete([1]);
		// 根据ID更新
		await this.demoGoodsEntity.update(1, { title: "xxx" });
		// 根据条件更新
		await this.demoGoodsEntity.update({ price: 20 }, { title: "xxx" });
		// 多条件操作
		await this.demoGoodsEntity
			.createQueryBuilder()
			.where("id = :id", { id: 1 })
			.andWhere("price = :price", { price: 20 })
			.getOne();
	}
}
```

## 高级查询(SQL)

**1、普通 SQL 查询**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行sql
	 */
	async sql(query) {
		return this.nativeQuery("select * from demo_goods a where a.id = ?", [query.id]);
	}
}
```

**2、分页 SQL 查询**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行分页sql
	 */
	async sqlPage(query) {
		return this.sqlRenderPage("select * from demo_goods ORDER BY id ASC", query, false);
	}
}
```

**3、非 SQL 的分页查询**

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { In, Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行entity分页
	 */
	async entityPage(query) {
		const find = this.demoGoodsEntity.createQueryBuilder();
		find.where("id = :id", { id: 1 });
		return this.entityRenderPage(find, query);
	}
}
```

**4、SQL 动态条件**

分页查询和普通的 SQL 查询都支持动态条件，通过`this.setSql(条件,sql语句,参数)`来配置

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 执行sql
	 */
	async sql(query) {
		return this.nativeQuery(`
    select * from demo_goods a
      WHERE 1=1
      ${this.setSql(query.id, "and a.id = ?", [query.id])}
    ORDER BY id ASC
    `);
	}
}
```

## 修改之前(modifyBefore)

有时候我们需要在数据进行修改动作之前，对它进行一些处理，比如：修改密码时，需要对密码进行加密，这时候我们可以使用`modifyBefore`方法来实现

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import * as md5 from "md5";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 修改之前
	 * @param data
	 * @param type
	 */
	async modifyBefore(data: any, type: "delete" | "update" | "add") {
		if (type == "update") {
			data.password = md5(data.password);
		}
	}
}
```

## 修改之后(modifyAfter)

有时候我们需要在数据进行修改动作之后，对它进行一些处理，比如：修改完数据之后将它放入队列或者 ElasticSearch

```ts
import { DemoGoodsEntity } from "./../entity/goods";
import { Provide } from "@midwayjs/decorator";
import { BaseService } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import * as md5 from "md5";

/**
 * 商品示例
 */
@Provide()
export class DemoGoodsService extends BaseService {
	@InjectEntityModel(DemoGoodsEntity)
	demoGoodsEntity: Repository<DemoGoodsEntity>;

	/**
	 * 修改之后
	 * @param data
	 * @param type
	 */
	async modifyAfter(data: any, type: "delete" | "update" | "add") {
		// 你想做的其他事情
	}
}
```

## 设置实体

`Service`与`Service`之间相互调用`BaseService`里的方法，有可能出现“未设置操作实体”的问题可以通过以下方式设置实体

::: warning 建议
但是一般不建议这样做，因为这样会导致`Service`与`Service`耦合，不利于代码的维护，如果要操作对应的表直接在当前的`Service`注入对应的表操作即可
:::

```ts
@Provide()
export class XxxService extends BaseService {
	@InjectEntityModel(XxxEntity)
	xxxEntity: Repository<XxxEntity>;

	@Init()
	async init() {
		await super.init();
		// 设置实体
		this.setEntity(this.xxxEntity);
	}
}
```
