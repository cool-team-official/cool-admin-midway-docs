# 权限管理

cool-admin 采用是是一种无状态的权限校验方式。[jwt](https://jwt.io/introduction), 通俗地讲他就是把用户的一些信息经过处理生成一段加密的字符串，后端解密到信息进行校验。而且这个信息是带有时效的。

cool-admin 默认约定每个模块下的 `controller/admin`为后台编写接口，`controller/app`编写对外如app、小程序的接口。

- 框架会对路由前缀 `/admin/**` 开头的接口进行权限校验，校验逻辑写在`base`模块下的`middleware/authority.ts`中间件
- 框架会对路由前缀 `/app/**` 开头的接口进行权限校验，校验逻辑写在`user`模块下的`middleware/app.ts`中间件

::: tip
也就是说模块`controller/admin`与`controller/app`是需要进行token校验的，如果你不想token校验有两种方式：

- 使用路由标签的形式，忽略token校验，详细查看[路由标签](/admin/node/core/controller.html#路由标签)；

- 新建其他的文件夹比如：`controller/open`；

这样就不会提示登录失效~
:::

## 登录

查询校验用户信息，然后将用户信息用jwt的方式加密保存返回给客户端。

`src/app/modules/base/service/sys/login.ts`

```ts
/**
   * 登录
   * @param login
   */
  async login(login: LoginDTO) {
    const { username, captchaId, verifyCode, password } = login;
    // 校验验证码
    const checkV = await this.captchaCheck(captchaId, verifyCode);
    if (checkV) {
      const user = await this.baseSysUserEntity.findOne({ username });
      // 校验用户
      if (user) {
        // 校验用户状态及密码
        if (user.status === 0 || user.password !== md5(password)) {
          throw new CoolCommException('账户或密码不正确~');
        }
      } else {
        throw new CoolCommException('账户或密码不正确~');
      }
      // 校验角色
      const roleIds = await this.baseSysRoleService.getByUser(user.id);
      if (_.isEmpty(roleIds)) {
        throw new CoolCommException('该用户未设置任何角色，无法登录~');
      }

      // 生成token
      const { expire, refreshExpire } = this.coolConfig.jwt.token;
      const result = {
        expire,
        token: await this.generateToken(user, roleIds, expire),
        refreshExpire,
        refreshToken: await this.generateToken(
          user,
          roleIds,
          refreshExpire,
          true
        ),
      };

      // 将用户相关信息保存到缓存
      const perms = await this.baseSysMenuService.getPerms(roleIds);
      const departments = await this.baseSysDepartmentService.getByRoleIds(
        roleIds,
        user.username === 'admin'
      );
      await this.coolCache.set(
        `admin:department:${user.id}`,
        JSON.stringify(departments)
      );
      await this.coolCache.set(`admin:perms:${user.id}`, JSON.stringify(perms));
      await this.coolCache.set(`admin:token:${user.id}`, result.token);
      await this.coolCache.set(`admin:token:refresh:${user.id}`, result.token);

      return result;
    } else {
      throw new CoolCommException('验证码不正确');
    }
  }
```

## 权限配置

admin用户拥有所有的权限，无需配置，但是对于其他只拥有部分权限的用户，我们得选择他们的权限，在这之前我们得先录入我们的系统有哪些权限是可以配置的

可以登录后台管理系统，`系统管理/权限管理/菜单列表`

![authority](/admin/node/authority.png)

## 选择权限

新建一个角色，就可以为这个角色配置对应的权限，用户管理可以选择对应的角色，那么该用户就有对应的权限，一个用户可以选择多个角色

![authority](/admin/node/authority-role.png)


## 全局校验

通过一个全局的中间件，我们在全局统一处理，这样就无需在每个controller处理，显得有点多余。

`src/app/modules/base/middleware/authority.ts`

```ts
import { App, Config, Middleware } from '@midwayjs/decorator';
import * as _ from 'lodash';
import { RESCODE } from '@cool-midway/core';
import * as jwt from 'jsonwebtoken';
import { NextFunction, Context } from '@midwayjs/koa';
import { IMiddleware, IMidwayApplication } from '@midwayjs/core';

/**
 * 权限校验
 */
@Middleware()
export class BaseAuthorityMiddleware
  implements IMiddleware<Context, NextFunction>
{
  @Config('koa.globalPrefix')
  prefix;

  @Config('module.base')
  jwtConfig;

  coolCache;

  @App()
  app: IMidwayApplication;

  resolve() {
    return async (ctx: Context, next: NextFunction) => {
      let statusCode = 200;
      let { url } = ctx;
      url = url.replace(this.prefix, '');
      const token = ctx.get('Authorization');
      const adminUrl = '/admin/';
      // 路由地址为 admin前缀的 需要权限校验
      if (_.startsWith(url, adminUrl)) {
        try {
          ctx.admin = jwt.verify(token, this.jwtConfig.jwt.secret);
        } catch (err) {}
        // 不需要登录 无需权限校验
        if (new RegExp(`^${adminUrl}?.*/open/`).test(url)) {
          await next();
          return;
        }
        if (ctx.admin) {
          // 超管拥有所有权限
          if (ctx.admin.username == 'admin' && !ctx.admin.isRefresh) {
            await next();
            return;
          }
          // 要登录每个人都有权限的接口
          if (new RegExp(`^${adminUrl}?.*/comm/`).test(url)) {
            await next();
            return;
          }
          // 如果传的token是refreshToken则校验失败
          if (ctx.admin.isRefresh) {
            ctx.status = 401;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: '登录失效~',
            };
            return;
          }
          // 需要动态获得缓存
          this.coolCache = await ctx.requestContext.getAsync('cool:cache');
          // 判断密码版本是否正确
          const passwordV = await this.coolCache.get(
            `admin:passwordVersion:${ctx.admin.userId}`
          );
          if (passwordV != ctx.admin.passwordVersion) {
            ctx.status = 401;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: '登录失效~',
            };
            return;
          }
          const rToken = await this.coolCache.get(
            `admin:token:${ctx.admin.userId}`
          );
          if (!rToken) {
            ctx.status = 401;
            ctx.body = {
              code: RESCODE.COMMFAIL,
              message: '登录失效或无权限访问~',
            };
            return;
          }
          if (rToken !== token && this.jwtConfig.sso) {
            statusCode = 401;
          } else {
            let perms = await this.coolCache.get(
              `admin:perms:${ctx.admin.userId}`
            );
            if (!_.isEmpty(perms)) {
              perms = JSON.parse(perms).map(e => {
                return e.replace(/:/g, '/');
              });
              if (!perms.includes(url.split('?')[0].replace('/admin/', ''))) {
                statusCode = 403;
              }
            } else {
              statusCode = 403;
            }
          }
        } else {
          statusCode = 401;
        }
        if (statusCode > 200) {
          ctx.status = statusCode;
          ctx.body = {
            code: RESCODE.COMMFAIL,
            message: '登录失效或无权限访问~',
          };
          return;
        }
      }
      await next();
    };
  }
}
```

## 令牌续期

jwt加密完的字符串是有时效的，系统默认时效时间为2个小时。这期间就需要续期令牌才可以继续操作。

框架登录设置了一个refreshToken，默认过期时间为30天。可以使用这个去换取新的token，这时候又可以延长2个小时。

## 其他权限

你可以单独编写一个中间间来控制其他权限，如app、小程序及其他对外接口，但是可以参考后台管理系统权限过滤、token生成校验的实现方式



