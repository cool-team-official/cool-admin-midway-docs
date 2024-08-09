# 简介

![](/show/admin.png){data-zoomable}

## 技术选型

- [midwayjs](https://www.midwayjs.org/)，基础框架；
- [bullmq](https://github.com/OptimalBits/bull)，基于[redis](https://redis.io/)的任务与队列框架；
- [typeorm](https://github.com/typeorm/typeorm)，node 的 orm 框架，[中文文档](https://typeorm.biunav.com/)；
- [mysql](https://www.runoob.com/mysql/mysql-tutorial.html)，最流行的关系型数据库管理系统；
- [elasticsearch](https://www.elastic.co/cn/)，大数据处理；
- [moleculer](https://moleculer.services/)，一个 Node.js 快速、可扩展、容错的微服务框架；

## 为什么选择 Cool Admin？

随着技术不断地发展，特别是最近 Ai 相关的技术发展，以往的框架已经越来越不能满足现代化的开发需求。

Cool Admin 做为后来者有后发优势，主要特点：

- Ai 编码，从页面到后端代码，部分功能实现零代码；
- Ai 流程编排，专门为 Ai 开发设计的，Ai 开发几乎不用写代码，只需拖一拖即可；
- 扩展插件，可插拔，如支付、短信这类功能的插件可以通过后台动态安装卸载，灵活又不臃肿；
- 代码简洁，不像一般代码生成器生成一堆冗余代码，Cool 只需极少编码即可实现大部分需求；
- ......

![](/show/admin.png){data-zoomable}

![](/show/flow.png){data-zoomable}

## 内置功能

- 用户管理：呈现公司组织部门树形结构，用户是系统操作者，该功能主要完成系统用户配置。
- 菜单管理：配置系统菜单，操作权限标识等。
- 角色管理：角色菜单权限分配、设置角色按机构进行数据范围权限划分。
- 参数管理：对系统动态配置常用参数。
- 字典管理：对系统中经常使用的一些较为固定的数据进行维护。
- 请求日志：接口的请求入参日志，便于问题排查。
- 操作日志：系统正常操作日志记录和查询；系统异常信息日志记录和查询。
- 定时任务：在线（添加、修改、删除）任务调度包含执行结果日志。
- 文件管理：支持静态资源文件上传云端进行云管理。
- 数据回收站：数据有 30 天的保留，支持回滚操作。
- 前后端插件：支持动态安装、卸载插件，实现功能可插拔。
