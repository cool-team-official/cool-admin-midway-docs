# 多租户（v8.0新增）

多租户（Multi-tenancy）是一种软件架构模式，允许单个应用实例服务多个租户（客户组织）。每个租户的数据是相互隔离的，但共享同一个应用程序代码和基础设施。


## 主要特点

- **数据隔离**: 确保不同租户之间的数据严格分离，互不可见
- **资源共享**: 多个租户共享同一套应用程序代码和基础设施
- **独立配置**: 每个租户可以有自己的个性化配置和定制化需求
- **成本优化**: 通过资源共享降低运营和维护成本

## 实现

### 1、数据隔离

多租户的数据隔离有许多种方案，但最为常见的是以列进行隔离的方式。Cool Admin 通过在`BaseEntity`中加入指定的列（租户ID `tenantId`）对数据进行隔离。

如果登录的用户`token`信息有携带`tenantId`，则框架会自动注入`tenantId`。

`src/modules/base/service/sys/login.ts`
```ts
/**
 * 生成token
 * @param user 用户对象
 * @param roleIds 角色集合
 * @param expire 过期
 * @param isRefresh 是否是刷新
 */
async generateToken(user, roleIds, expire, isRefresh?) {
  await this.midwayCache.set(
    `admin:passwordVersion:${user.id}`,
    user.passwordV
  );
  const tokenInfo = {
    isRefresh: false,
    roleIds,
    username: user.username,
    userId: user.id,
    passwordVersion: user.passwordV,
    tenantId: user['tenantId'],
  };
  if (isRefresh) {
    tokenInfo.isRefresh = true;
  }
  return jwt.sign(tokenInfo, this.coolConfig.jwt.secret, {
    expiresIn: expire,
  });
}
```

::: tip 小贴士

v8.0之后，`BaseEntity`已经从`cool-midway/core`中移动至`src/modules/base/entity/base.ts`，方便开发者扩展定制

:::


`src/modules/base/entity/base.ts`
```ts
import {
  Index,
  UpdateDateColumn,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  Column,
} from 'typeorm';
import { CoolBaseEntity } from '@cool-midway/core';

/**
 * 实体基类
 */
export abstract class BaseEntity extends CoolBaseEntity {
  // 默认自增
  @PrimaryGeneratedColumn('increment', {
    comment: 'ID',
  })
  id: number;

  @Index()
  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Index()
  @UpdateDateColumn({ comment: '更新时间' })
  updateTime: Date;

  @Index()
  @Column({ comment: '租户ID', nullable: true })
  tenantId: number;
}

```

### 2、条件注入

Cool 改造了 `typeorm`的 `Subscriber`，新增了以下四种监听：

```ts
/**
 * 当进行select的QueryBuilder构建之后触发
 */
afterSelectQueryBuilder?(queryBuilder: SelectQueryBuilder<any>): void;

/**
 * 当进行insert的QueryBuilder构建之后触发
 */
afterInsertQueryBuilder?(queryBuilder: InsertQueryBuilder<any>): void;

/**
 * 当进行update的QueryBuilder构建之后触发
 */
afterUpdateQueryBuilder?(queryBuilder: UpdateQueryBuilder<any>): void;

/**
 * 当进行delete的QueryBuilder构建之后触发
 */
afterDeleteQueryBuilder?(queryBuilder: DeleteQueryBuilder<any>): void;
```

在`src/modules/base/db/tenant.ts`中，通过`tenantId`进行条件注入，从而实现数据隔离。

## 使用

### 1、开启多租户

框架默认关闭多租户，需要手动开启，在`src/config/config.default.ts`中开启多租户

```ts
cool: {
    // 是否开启多租户
    tenant: {
      // 是否开启多租户
      enable: true,
      // 需要过滤多租户的url， 支持通配符，如/admin/**/* 表示admin模块下的所有接口都进行多租户过滤
      urls: [],
    },
  }
```
tenant
### 2、代码中使用

只要开启了多租户，并配置了`urls`，那么框架会自动注入`tenantId`，开发者原本的代码不需要做任何修改，框架会自动进行数据隔离。

#### Controller

@CoolController的`add`、`delete`、`update`、`info`、`list`、`page`方法都支持过滤多租户。


#### Service

`Service`中使用多租户，以下是一个完整的示例，包含有效和无效的情况，开发者需要结合实际业务进行选择。

```ts
import { Inject, Provide } from '@midwayjs/core';
import { BaseService } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import { DemoGoodsEntity } from '../entity/goods';
import { UserInfoEntity } from '../../user/entity/info';
import { noTenant } from '../../base/db/tenant';

/**
 * 商品服务
 */
@Provide()
export class DemoTenantService extends BaseService {
  @InjectEntityModel(DemoGoodsEntity)
  demoGoodsEntity: Repository<DemoGoodsEntity>;

  @Inject()
  ctx;

  /**
   * 使用多租户
   */
  async use() {
    await this.demoGoodsEntity.createQueryBuilder().getMany();
    await this.demoGoodsEntity.find();
  }

  /**
   * 不使用多租户(局部不使用)
   */
  async noUse() {
    // 过滤多租户
    await this.demoGoodsEntity.createQueryBuilder().getMany();
    // 被noTenant包裹，不会过滤多租户
    await noTenant(this.ctx, async () => {
      return await this.demoGoodsEntity.createQueryBuilder().getMany();
    });
    // 过滤多租户
    await this.demoGoodsEntity.find();
  }

  /**
   * 无效多租户
   */
  async invalid() {
    // 自定义sql，不进行多租户过滤
    await this.nativeQuery('select * from demo_goods');
    // 自定义分页sql，进行多租户过滤
    await this.sqlRenderPage('select * from demo_goods', {});
  }
}

```

### 3、忽略url和用户

::: tip 小贴士

默认以下url和用户不会进行多租户过滤(具体前往`src/modules/base/db/tenant.ts`查看)

url：
- /admin/base/open/login
- /admin/base/comm/person
- /admin/base/comm/permmenu
- /admin/dict/info/data

用户：
- admin

:::

