# Ai 编码

## 1、全自动

通过微调大模型学习框架特有写法，实现简单功能从 Api 接口到前端页面的一键生成

![](/show/code.png){data-zoomable}

[演示地址](https://show.cool-admin.com/helper/ai-code)

[B 站视频教程](https://www.bilibili.com/video/BV1Hm421g7Br/?)

## 2、半自动

Cool Admin 框架本身的开发就非常便捷，不需要写太多代码，如创建一个 Entity 的 Crud

半自动开发过程

- 后端创建 Entity;
- 后端创建 Controller;
- 进入后台管理系统，系统管理-菜单管理，点击快速创建自动生成前端代码

::: tip 提示
自动生成前端代码的过程会调用大模型进行 UI 组件的自动选择，比如姓名用输入框组件，头像用图片组件。
:::

1. 创建 Entity

```ts
import { BaseEntity } from "../../base/entity/base";
import { Column, Entity, Index } from "typeorm";

/**
 * 商品模块-商品信息
 */
@Entity("demo_goods")
export class DemoGoodsEntity extends BaseEntity {
  @Index()
  @Column({ comment: "标题", length: 50 })
  title: string;

  @Column({ comment: "描述", nullable: true })
  description: string;

  ...
}
```

2. 创建 Controller

```ts
import { CoolController, BaseController } from "@cool-midway/core";
import { DemoGoodsEntity } from "../../entity/goods";

/**
 * 商品模块-商品信息
 */
@CoolController({
  api: ["add", "delete", "update", "info", "list", "page"],
  entity: DemoGoodsEntity,
})
export class AdminDemoGoodsController extends BaseController {}
```

3. 进入后台管理系统，系统管理-菜单管理，点击快速创建自动生成前端代码，选择后端对应的数据结构

![](/admin/node/menu-quick.png){data-zoomable}

## 3、Cursor 支持

Cool Admin 针对全球爆火的[Cursor](https://www.cursor.com)编辑器专门做了适配，支持在编辑器中直接调用大模型进行代码的编写，支持代码的自动补全、代码的自动生成、代码的自动优化等功能。

针对 Cursor 的配置`.cursor/rules` 文件夹和`.cursorrules` 文件。

- .cursor/rules 文件夹配置一些框架特有的写法还有注意事项，使用时 Agent 会自动根据需要调用（新玩意还存在一些问题）。
- .cursorrules 文件，总是会带到 Ai 的上下文。

### 示例

用 Cursor 打开后端项目，来到 Composer 功能，切换到 agent 模式，输入要求：

```txt
创建一个学生管理模块：student，包括学生信息，课程信息，老师信息
需要创建Controller、Entity、Service、config.ts
给page接口配置必要的关联查询
```

Cursor 会根据框架的特性，自动生成对应的代码，你可以根据需要让 Cursor 再为你调整。

注意一般不要想着一轮对话就能满足需求，大部分场景需要多轮对话，另外就是尽量描述清楚你的需求。

![](/admin/node/cursor.png){data-zoomable}

::: warning 注意

1. 使用该功能前需要将 Cursor 编辑器升级到最新版本，需要支持.cursor/rules 的配置才可以。

2. 还需要主要用 Cursor 单独打开后端项目，而不是和前端放在同一个目录，.cursor 文件夹和.cursorrules 需要保持在根目录才能被识别。

3. 需要使用 Cursor 的 Composer 功能，该功能需要付费，如果真能帮助提高开发效率，也还是值得的。

4. 以目前 Ai 的能力，还不能完全替代开发，但是可以大大提高开发效率，而且它还在不断进步，相信未来会有更多的可能。

5. 使用建议，尽量描述清楚需求，先生成一些基础的代码，通过多个步骤让 Ai 完善代码，然后再人为调整干预。

:::
