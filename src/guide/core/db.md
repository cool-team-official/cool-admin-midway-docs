# 数据库(db)

数据库使用的是`typeorm`库

中文文档：[https://typeorm.biunav.com](https://typeorm.biunav.com)

官方文档：[https://typeorm.io](https://typeorm.io)，国外网站有可能打不开，打不开看上面的中文文档

midway 数据库文档：[https://www.midwayjs.org/docs/extensions/orm](https://www.midwayjs.org/docs/extensions/orm)

## 数据库配置

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

## 事务示例

`cool-admin`封装了自己事务，让代码更简洁

#### 示例

```ts
import { Inject, Provide } from "@midwayjs/decorator";
import { BaseService, CoolTransaction } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/orm";
import { Repository, QueryRunner } from "typeorm";
import { DemoAppGoodsEntity } from "../entity/goods";

/**
 * 商品
 */
@Provide()
export class DemoGoodsService extends BaseService {
  @InjectEntityModel(DemoAppGoodsEntity)
  demoAppGoodsEntity: Repository<DemoAppGoodsEntity>;

  /**
   * 事务
   * @param params
   * @param queryRunner 无需调用者传参, 自动注入，最后一个参数
   */
  @CoolTransaction({ isolation: "SERIALIZABLE" })
  async testTransaction(params: any, queryRunner?: QueryRunner) {
    await queryRunner.manager.insert<DemoAppGoodsEntity>(DemoAppGoodsEntity, {
      title: "这是个商品",
      pic: "商品图",
      price: 99.0,
      type: 1,
    });
  }
}
```

::: tip
`CoolTransaction`中已经做了异常捕获，所以方法内部无需捕获异常，必须使用`queryRunner`做数据库操作，
而且不能是异步的，否则事务无效，
`queryRunner`会注入到被注解的方法最后一个参数中, 无需调用者传参
:::

## 虚拟字段

虚拟字段是指数据库中没有实际存储的字段，而是通过其他字段计算得到的字段，这种字段在查询时可以直接使用，但是不能进行更新操作

```ts
import { BaseEntity } from "@cool-midway/core";
import { Column, Entity, Index } from "typeorm";

/**
 * 数据实体
 */
@Entity("xxx_xxx")
export class XxxEntity extends BaseEntity {
  @Index()
  @Column({
    type: "varchar",
    length: 7,
    asExpression: "DATE_FORMAT(createTime, '%Y-%m')",
    generatedType: "VIRTUAL",
    comment: "月份",
  })
  month: string;

  @Index()
  @Column({
    type: "varchar",
    length: 4,
    asExpression: "DATE_FORMAT(createTime, '%Y')",
    generatedType: "VIRTUAL",
    comment: "年份",
  })
  year: string;

  @Index()
  @Column({
    type: "varchar",
    length: 10,
    asExpression: "DATE_FORMAT(createTime, '%Y-%m-%d')",
    generatedType: "VIRTUAL",
    comment: "日期",
  })
  date: string;

  @Column({ comment: "退款", type: "json", nullable: true })
  refund: {
    // 退款单号
    orderNum: string;
    // 金额
    amount: number;
    // 实际退款金额
    realAmount: number;
    // 状态 0-申请中 1-已退款 2-拒绝
    status: number;
    // 申请时间
    applyTime: Date;
    // 退款时间
    time: Date;
    // 退款原因
    reason: string;
    // 拒绝原因
    refuseReason: string;
  };

  // 将退款状态提取出来，方便查询
  @Index()
  @Column({
    asExpression: "JSON_EXTRACT(refund, '$.status')",
    generatedType: "VIRTUAL",
    comment: "退款状态",
    nullable: true,
  })
  refundStatus: number;
}
```

## 不使用外键

typeorm 有很多 OneToMany, ManyToOne, ManyToMany 等关联关系，这种都会生成外键，但是在实际生产开发中，不推荐使用外键：

- 性能影响：外键会在插入、更新或删除操作时增加额外的开销。数据库需要检查外键约束是否满足，这可能会降低数据库的性能，特别是在大规模数据操作时更为明显。

- 复杂性增加：随着系统的发展，数据库结构可能会变得越来越复杂。外键约束增加了数据库结构的复杂性，使得数据库的维护和理解变得更加困难。

- 可扩展性问题：在分布式数据库系统中，数据可能分布在不同的服务器上。外键约束会影响数据的分片和分布，限制了数据库的可扩展性。

- 迁移和备份困难：带有外键约束的数据库迁移或备份可能会变得更加复杂。迁移时需要保证数据的完整性和约束的一致性，这可能会增加迁移的难度和时间。

- 业务逻辑耦合：过多依赖数据库的外键约束可能会导致业务逻辑过度耦合于数据库层。这可能会限制应用程序的灵活性和后期的业务逻辑调整。

- 并发操作问题：在高并发的场景下，外键约束可能会导致锁的竞争，增加死锁的风险，影响系统的稳定性和响应速度。

尽管外键提供了数据完整性保障，但在某些场景下，特别是在高性能和高可扩展性要求的系统中，可能会选择在应用层实现相应的完整性检查和约束逻辑，以避免上述问题。这需要在设计系统时根据实际需求和环境来权衡利弊，做出合适的决策。

## 多表关联查询

cool-admin 有三种方式的联表查询：

1、controller 上配置

特别注意要配置 select, 不然会报重复字段错误

```ts
@CoolController({
  // 添加通用CRUD接口
  api: ['add', 'delete', 'update', 'info', 'list', 'page'],
  // 设置表实体
  entity: DemoAppGoodsEntity,
  // 分页查询配置
  pageQueryOp: {
    // 指定返回字段，注意多表查询这个是必要的，否则会出现重复字段的问题
    select: ['a.*', 'b.name', 'a.name AS userName'],
    // 联表查询
    join: [
      {
        entity: BaseSysUserEntity,
        alias: 'b',
        condition: 'a.userId = b.id'
      },
    ]
})
```

2、service 中

通过`this.nativeQuery`或者`this.sqlRenderPage`两种方法执行自定义 sql

- nativeQuery：执行原生 sql，返回数组
- sqlRenderPage：执行原生 sql，返回分页对象

模板 sql 示例，方便动态传入参数，千万不要直接拼接 sql，有 sql 注入风险，以下方法 cool-admin 内部已经做了防注入处理

- setSql：第一个参数是条件，第二个参数是 sql，第三个参数是参数数组

```ts
this.nativeQuery(
      `SELECT
        a.*,
        b.nickName
      FROM
        demo_goods a
        LEFT JOIN user_info b ON a.userId = b.id
      ${this.setSql(true, 'and b.userId = ?', [userId])}`
```

3、通过 typeorm 原生的写法

示例

```ts
const find = this.demoGoodsEntity
  .createQueryBuilder("a")
  .select(["a.*", "b.nickName as userName"])
  .leftJoin(UserInfoEntity, "b", "a.id = b.id")
  .getRawMany();
```
