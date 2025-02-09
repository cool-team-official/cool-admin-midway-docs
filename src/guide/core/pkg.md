# 原生打包（v8.0 新增）

可以将`cool-admin`前后端一起打包成一个可执行文件，支持打包成`windows`、`mac`、`linux`等。

## 打包步骤

### 1. 前端打包

首先需要打包前端项目：

```bash
# 在前端项目目录下执行
npm run build-static
```

打包完成后，将生成的 `dist` 目录复制到后端项目的 `public` 目录下。

### 2. 后端打包

在后端项目目录下执行：

```bash
// 如果使用pnpm命令遇到问题，建议使用npm命令
npm run pkg
```

打包后的文件将生成在 `build` 目录下。

## 打包配置说明

在 `package.json` 中，通过 `pkg` 字段配置打包参数：

```json
{
  "pkg": {
    "scripts": [
      "dist/**/*", // 需要打包的源码文件
      "node_modules/axios/dist/node/*" // 需要打包的依赖
    ],
    "assets": [
      "public/**/*", // 静态资源文件
      "typings/**/*" // 类型定义文件
    ],
    "targets": [
      "node20-macos-x64" // 目标平台
    ],
    "outputPath": "build" // 输出目录
  }
}
```

### 配置说明

- `scripts`: 指定需要打包的源码文件和依赖
- `assets`: 指定需要打包的静态资源文件
- `targets`: 指定打包的目标平台，支持：
  - `node20-macos-x64`: MacOS x64 架构
  - `node20-macos-arm64`: MacOS arm64 架构 M1、M2 等芯片
  - `node20-linux-x64`: Linux x64 架构
  - `node20-win-x64`: Windows x64 架构
  - ...
- `outputPath`: 指定打包后的输出目录

具体查看[pkg 文档](https://github.com/yao-pkg/pkg)

## 注意事项

1. 确保 Node.js 版本 >= 18.0.0
2. 打包前请先执行 `npm run build` 生成 dist 目录
3. 打包过程中会自动处理依赖，无需手动处理
4. 打包日志会保存在 `build/pkg.log` 文件中
5. 生成的可执行文件可以直接运行，无需安装 Node.js 环境

## 常见问题

### pkg 下载卡住问题

在打包过程中，如果发现进度卡住，通常是因为 pkg 在下载对应的 Node.js 二进制文件时出现网络问题。解决方案如下：

1. 访问 [pkg-fetch releases](https://github.com/yao-pkg/pkg-fetch/releases) 页面
2. 下载对应版本和平台的二进制文件
3. 将下载的文件放到 `.pkg-cache` 目录下（目录通常在用户目录下）
   - Mac/Linux: `~/.pkg-cache`
   - Windows: `C:\Users\你的用户名\.pkg-cache`

例如，如果你要打包 node v20 版本的 macOS x64 平台的程序：

1. 下载 `node-v20.11.0-macos-x64` 文件
2. 将文件放到 `~/.pkg-cache/v3.5/fetched-v20.11.0-macos-x64`

::: warning 特别注意

1. 请确保文件名称完全对应，包括版本号和平台标识。文件存放路径中的 v3.5 是 pkg-fetch 的版本号。
2. `config/config.prod.ts`数据库配置的`entities`不能配置为`['**/modules/*/entity']`，否则无法识别。

正确配置：

```ts
import { entities } from '../entities';

{
  type: 'mysql',
  entities,
  // 订阅者
  subscribers: [TenantSubscriber],
}
```

:::

::: tip 小贴士
如果不需要部署服务器，可以将数据库改成`sqlite`[配置方法](/src/guide/core/db.html#数据库配置)，然后再打包，这样整个系统就能直接在本地运行了。

注意 sqlite 的路径改为 `pSqlitePath()`，同时打开自动导入数据，自动导入菜单。

```ts
import { pSqlitePath } from '../comm/path';

{
  type: 'sqlite',
  // 数据库文件地址
  database: pSqlitePath(),
  // 自动建表 注意：线上部署的时候不要使用，有可能导致数据丢失
  synchronize: true,
  // 打印日志
  logging: false,
  // 实体路径
  entities: ['**/modules/*/entity'],
  // 订阅者
  subscribers: [TenantSubscriber],
}
```

:::
