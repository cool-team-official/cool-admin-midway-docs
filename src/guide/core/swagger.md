# 接口文档（v8.0新增）

虽然`cool-admin`已经有了[Eps](/src/guide/core/eps.html)做前端端联动，后端写完接口前端直接调用。

但是，在实际开发中，我们还是需要一个接口文档来查看接口的，所以`cool-admin`新增了`swagger`模块，支持自动生成接口文档。

## 实现

基于`Eps`构建生成，所以需要开启`Eps`，位于项目单独的`swagger`模块中。

## 使用

### 开启Eps

在`src/config/config.local.ts`中开启`Eps`，默认开发环境是开启的，生产环境`config.prod.ts`是关闭的。

```ts
cool: {
    // 开启Eps
    eps: true,
}
```

### 访问

项目启动完成后，访问[http://127.0.0.1:8001/swagger/index.html](http://127.0.0.1:8001/swagger/index.html)，即可查看接口文档。

![](/admin/node/swagger.png)