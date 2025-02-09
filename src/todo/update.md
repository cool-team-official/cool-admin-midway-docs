# 更新

因为有你们的支持，cool-admin 会持续不断地更新，如果方便请点下 Star，这将会给我们带来更多的动力！！！

## v8.0.0(2025-02-10)

[7.x 升级方案](/src/todo/upgrade.html)

- 适配[Cursor](https://www.cursor.com/)，使其对 cool-admin 有更好的支持[详情](/src/guide/ai.html#_3、cursor-支持)；
- 支持多租户，全局动态注入查询条件[详情](/src/guide/core/tenant.html)；
- 支持多语言，基于大模型自动翻译，无需更改原有代码[详情](/src/guide/core/i18n.html)；
- 支持原生打包，打包成`exe`等安装包，打包完可以直接运行在`windows`、`mac`、`linux`等操作系统上[详情](/src/guide/core/pkg.html)；
- 后台任务管理，定时任务可以不依赖`redis`同时支持 `cluster`，功能一致；
- 新增 swagger 模块，支持自动生成接口文档[详情](/src/guide/core/swagger.html)；
- 优化`eps`，快速创建分页列表支持连表生成；
- 完善`@CoolController`注解，新增`fieldLike`支持区分字段模糊查询，新增`serviceApis`直接将 service 方法注册为接口[详情](/src/guide/core/controller.html#服务注册成-api)；
- Entity 字段支持配置字典和可选项[详情](/src/guide/core/db.html#配置字典和可选项-8-x-新增)；
- 优化了`本地文件上传`、`插件存储方式`、`typeorm的一些小坑`、`自动路由`、`混淆打包`、`Cursor提示优化`等等 N 多内容和细节；
- [开发中...]更强大的 Ai 代码自动编码，支持直接生成整个模块，包括前后端代码，更加智能可靠；

## v7.1.2(2024-12-28)

- 重写了自动路由的实现方式，更加高效可靠；
- 插件内容不再存在数据库，改为存文件，加载更快；
- 支持混淆打包，[使用方式](/src/guide/other/obfuscate.html)；
- 其它一些优化；

## v7.1.1(2024-07-01)

- 全新的 Ai 代码生成器
- 优化了若干代码

## ...

## v1.0.0(2018-05-16)

- Hello World
