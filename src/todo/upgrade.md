# 升级方案（v8.x）

以下是7.x=>8.x的升级方案

::: danger 警告！！！
我们始终不建议将你现有的已经在运营的项目升级到最新的大版本，因为往往有一些无法预知的问题。
:::

## 方案

### 1、备份数据库和项目

这点是非常重要的，因为升级过程中可能会出现一些问题，如果出现问题，还有挽救的余地。

### 2、代码迁移

- 拉取最新的代码；
- 复制原有项目你特有的模块（非框架自带的模块）；
- 利用vscode等工具，全局搜索`@midwayjs/decorator`，替换为`@midwayjs/core`；
- 检查原有项目框架中的模块的改动，比如base模块，如若有做修改，根据改动内容进行调整；
- [可选]从v8.0开始BaseEntity从`@cool-midway/core`迁移到`base`模块的`entity/base.ts`中， 原本的`@cool-midway/core`也保留了， 你可以根据需要选择使用；
```ts
import { BaseEntity } from '../../base/entity/base';
```

::: warning 注意

如果修改了BaseEntity，由于`createTime`和`updateTime`的类型改为了`varchar`，由于`typeorm`的同步机制，有可能会导致`createTime`和`updateTime`的数据丢失。解决方案可以先去数据库中将`createTime`和`updateTime`的类型改为`varchar`，然后再执行代码，这样类型一致，就不会删除字段再重建了。

:::
