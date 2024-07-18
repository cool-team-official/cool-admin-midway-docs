# 文件上传

::: warning 注意
以下方式是旧版本的支付方式，不建议使用，新版本已经插件化了，可以直接到插件市场下载对应的插件，插件的使用方式请参考插件市场对应插件的文档

[阿里云 OSS 插件](https://cool-js.com/plugin/36)

[腾讯云 COS 插件](https://cool-js.com/plugin/37)

[七牛云 QINIU 插件](https://cool-js.com/plugin/38)

[亚马逊云 AWS s3 插件](https://cool-js.com/plugin/39)
:::

新版本本地文件上传前缀地址配置位于 `src/modules/plugin/config.ts`，如果有安装云存储插件，本地上传会自动切换为云存储上传

```ts
/**
 * 模块配置
 */
export default (options) => {
  return {
    // 模块名称
    name: "插件模块",
    // 模块描述
    description: "插件查看、安装、卸载、配置等",
    // 中间件，只对本模块有效
    middlewares: [],
    // 中间件，全局有效
    globalMiddlewares: [],
    // 模块加载顺序，默认为0，值越大越优先加载
    order: 0,
    // 基础插件配置
    hooks: {
      // 文件上传
      upload: {
        // 地址前缀
        domain: `http://127.0.0.1:${options?.app?.getConfig("koa.port")}`,
      },
    },
  } as ModuleConfig;
};
```

<br>

<br>

**----------------------旧版本-------------------------**

文件上传基于[midwayjs 文件上传](http://www.midwayjs.org/docs/extensions/upload)，[midwayjs 文件上传](http://www.midwayjs.org/docs/extensions/upload)提供了多种形式的上传方式如：[阿里云 oss](http://www.midwayjs.org/docs/extensions/oss)、[腾讯云 cos](http://www.midwayjs.org/docs/extensions/cos)等，为了更好地与前端配合，cool-admin 封装了四种上传方式

- 本地文件上传；
- 阿里云 OSS 前端直传；
- 腾讯云 COS 前端直传；
- 七牛云 QINIU 前端直传；
- 亚马逊云 AWS s3 前端直传；

::: tip 提示
框架默认为本地上传，但是我们并不推荐这种形式，条件允许尽量使用云存储，使用云存储有多种好处：

- 动静分离，不占用服务带宽；
- 便于分布式部署；
- 方便的功能，如大小图、打水印等；
- 有利于安全；
- ...
  :::

## 配置插件

安装插件[@cool-midway/file](https://www.npmjs.com/package/@cool-midway/file)，该插件包已经包含了四种上传方式，无需引入其他包

<CodeGroup>
  <CodeGroupItem title="YARN" active>

```bash
yarn add @cool-midway/file
```

  </CodeGroupItem>

  <CodeGroupItem title="NPM">
  
```bash
npm install @cool-midway/file --save
```

  </CodeGroupItem>
</CodeGroup>

`src/configuration.ts`

```ts
import { Configuration, App } from "@midwayjs/decorator";
import { join } from "path";
import * as file from "@cool-midway/file";

@Configuration({
  imports: [file],
  importConfigs: [join(__dirname, "./config")],
})
export class ContainerLifeCycle {
  @App()
  app: koa.Application;

  async onReady() {}
}
```

## 上传模式

前端需要根据服务端配置的上传模式，切换自己的上传方式，获得上传模式

```ts
import { Get, Inject, Post, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { Context } from "koa";
import { CoolFile } from "@cool-midway/file";

/**
 * 文件上传
 */
@Provide()
@CoolController()
export class AppDemoFileController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  file: CoolFile;

  @Get("/uploadMode", { summary: "获得上传模式" })
  async uploadMode() {
    return this.ok(await this.file.getMode());
  }
}
```

## 本地上传

基于[midwayjs 文件上传](http://www.midwayjs.org/docs/extensions/upload)

### 配置

`src/config/config.default.ts`

```ts
import { CoolFileConfig, MODETYPE } from "@cool-midway/file";
import { MidwayConfig } from "@midwayjs/core";
import * as fsStore from "cache-manager-fs-hash";

export default {
  // 修改成你自己独有的key
  keys: "cool-admin for node",
  koa: {
    port: 8001,
  },
  // cool配置
  cool: {
    file: {
      // 上传模式 本地上传或云存储
      mode: MODETYPE.LOCAL,
      // 本地上传 文件地址前缀
      domain: "http://127.0.0.1:8001",
    } as CoolFileConfig,
  },
} as unknown as MidwayConfig;
```

::: warning 警告
必须配置正确的文件地址前缀，这样才能保住文件可以正常被访问
:::

### 上传

`src/modules/demo/controller/app/file.ts`

```ts
import { Get, Inject, Post, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { Context } from "koa";
import { CoolFile } from "@cool-midway/file";

/**
 * 文件上传
 */
@Provide()
@CoolController()
export class AppDemoFileController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  file: CoolFile;

  @Post("/upload", { summary: "文件上传" })
  async uplod() {
    return this.ok(await this.file.upload(this.ctx));
  }
}
```

<img src="/admin/node/file.gif" style="width:80%"/>

## 阿里云 oss

### 配置

`src/config/config.default.ts`

```ts
import { CoolFileConfig, MODETYPE } from "@cool-midway/file";
import { MidwayConfig } from "@midwayjs/core";
import * as fsStore from "cache-manager-fs-hash";

export default {
  // 修改成你自己独有的key
  keys: "cool-admin for node",
  koa: {
    port: 8001,
  },
  // cool配置
  cool: {
    file: {
      // 上传模式 本地上传或云存储
      mode: MODETYPE.CLOUD,
      oss: {
        accessKeyId: "your access key",
        accessKeySecret: "your access secret",
        bucket: "your bucket name",
        endpoint: "oss-cn-hongkong.aliyuncs.com 换成你自己的",
        timeout: "3600s",
      } as OSSConfig,
    } as CoolFileConfig,
  },
} as unknown as MidwayConfig;
```

### 跨域

前端签名直传用于浏览器安全限制，在传输的时候会有跨域访问的情况，因此需要到阿里云 oss 管理，添加跨域规则。

![](/admin/node/file-osscross.png)

::: warning 警告

authorization 这一项不可省略，严格按照截图所示配置，替换成自己的域名即可

:::

### 获得签名参数

前端是采用签名直传的方式，上传不经过服务端，文件直接从前端上传到 OSS，因此我们调用上传接口会获得一些签名所需的参数，然后再上传文件

`src/modules/demo/controller/app/file.ts`

```ts
import { Get, Inject, Post, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { Context } from "koa";
import { CoolFile } from "@cool-midway/file";

/**
 * 文件上传
 */
@Provide()
@CoolController()
export class AppDemoFileController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  file: CoolFile;

  @Post("/upload", { summary: "文件上传" })
  async uplod() {
    return this.ok(await this.file.upload(this.ctx));
  }
}
```

<img src="/admin/node/file-oss.gif" style="width:80%"/>

## 腾讯云 cos

配置方式参考[阿里云 oss](/src/guide/core/file.html#阿里云oss)

配置：

```ts
cool: {
	file: {
		mode: MODETYPE.CLOUD,
		cos:{
			accessKeyId: string;
			accessKeySecret: string;
			bucket: string;
			region: string;
			publicDomain: string;
		}
	}
}
```

...

## 七牛云 qiniu

配置方式参考[阿里云 oss](/src/guide/core/file.html#阿里云oss)

配置：

```ts
cool: {
	file: {
		mode: MODETYPE.CLOUD,
		qiniu:{
			accessKeyId: string;
			accessKeySecret: string;
			bucket: string;
			region: string;
			publicDomain: string;
		}
	}
}
```

...

示例

```ts
 cool: {
    // 是否自动导入数据库
    file: {
      // 上传模式 本地上传或云存储
      mode: MODETYPE.CLOUD,
      qiniu: {
        accessKeyId: 'accessKeyId',
        accessKeySecret: 'accessKeySecret',
        bucket: 'bucket',
        region: 'z0',
        publicDomain: 'http://qiniu.cool-js.com',
      },
    },
  } as CoolConfig,
```

## 亚马逊云 AWS s3 (7.0 新增)

配置方式参考[阿里云 oss](/src/guide/core/file.html#阿里云oss)

配置：

```ts
cool: {
	file: {
		mode: MODETYPE.CLOUD,
		aws: {
			/** accessKeyId */
			accessKeyId: string;
			/** secretAccessKey */
			secretAccessKey: string;
			/** bucket */
			bucket: string;
			/** region */
			region: string;
			/** fields */
			fields?: any;
			/** conditions */
			conditions?: any[];
			/** expires */
			expires?: number;
		},
	}
}
```

示例

```ts
 cool: {
    // 是否自动导入数据库
    file: {
      // 上传模式 本地上传或云存储
      mode: MODETYPE.CLOUD,
      aws: {
        accessKeyId: 'accessKeyId',
        secretAccessKey: 'accessKeySecret',
        bucket: 'bucket',
        region: 'ap-northeast-1',
      },
    },
  } as CoolConfig,
```

跨域配置

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:9000", "http://127.0.0.1:9000"],
    "ExposeHeaders": []
  }
]
```

## 下载并上传到云存储

有时候我们需要下载文件并上传到云存储，如：微信授权登录的时候获得的微信头像链接是会失效的，我们需要下载并保存。

`src/modules/demo/controller/app/file.ts`

```ts
import { Get, Inject, Post, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController } from "@cool-midway/core";
import { Context } from "koa";
import { CoolFile } from "@cool-midway/file";

/**
 * 文件上传
 */
@Provide()
@CoolController()
export class AppDemoFileController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  file: CoolFile;

  @Post("/downAndUpload", { summary: "下载并上传" })
  async downAndUpload() {
    return this.ok(
      await this.file.downAndUpload("https://cool-js.com/notice.png")
    );
  }
}
```

::: tip 提示
微信授权登录保存图片，建议做成异步下载，下载完成后再更新用户信息。
:::
