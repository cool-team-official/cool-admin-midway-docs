# 模板渲染

## 内置

框架内置的模板渲染引擎为[ejs](https://ejs.bootcss.com/)

::: tip 提示
目前较为流行的是前后端分离的方式，模板引擎更适用于有seo需求的应用
:::

#### ejs

访问[ejs](https://ejs.bootcss.com/)查看具体用法

`src/welcome.ts`

```ts
import { Controller, Get, Inject } from '@midwayjs/decorator';
import { Context } from '@midwayjs/koa';

/**
 * 欢迎界面
 */
@Controller('/')
export class WelcomeController {
  @Inject()
  ctx: Context;

  @Get('/')
  public async welcome() {
    await this.ctx.render('welcome', {
      text: 'HELLO COOL-ADMIN 5.x 一个项目只用COOL就够了！！！',
    });
  }
}

```

`src/app/view`

```html
<!DOCTYPE html>
<html lang="en">

<head>
	<meta charset="UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	<meta http-equiv="X-UA-Compatible" content="ie=edge" />
	<title>COOL-AMIND 一个很酷的后台权限管理系统</title>
	<meta name="keywords" content="cool-admin，后台管理系统，vue，element-ui，nodejs" />
	<meta name="description" content="element-ui、egg.js、midway.js、mysql、redis、node.js、前后端分离、权限管理、快速开发， COOL-AMIND 一个很酷的后台权限管理系统" />
	<link rel="stylesheet" href="public/css/welcome.css">

<body>
<div class="reveal"><%= text %></div>
<script src="public/js/welcome.js"></script>
</body>

</html>


```


## 其他

需要使用其他模板引擎，参考[midwayjs 模板渲染](http://www.midwayjs.org/docs/extensions/render)


