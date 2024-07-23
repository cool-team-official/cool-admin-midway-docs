# SSE 返回数据

[视频教程](https://www.bilibili.com/video/BV1mx4y1v76w/)

随着 Ai 大模型流行，大模型的生成时间会很长，这时候我们可以采用 SSE 的方式返回数据，这样可以让用户看到生成的进度，下面是一个简单的例子：

**服务端**

```ts
import { CoolController, BaseController } from "@cool-midway/core";
import { Get, Inject } from "@midwayjs/core";
import { Context } from "koa";
import { PluginService } from "../../../plugin/service/info";
import { PassThrough } from "stream";

/**
 * 事件流 服务端主动推送
 */
@CoolController()
export class OpenDemoSSEController extends BaseController {
  @Inject()
  ctx: Context;

  @Inject()
  pluginService: PluginService;

  @Get("/call", { summary: "事件流 服务端主动推送" })
  async call() {
    // 设置响应头
    this.ctx.set("Content-Type", "text/event-stream");
    this.ctx.set("Cache-Control", "no-cache");
    this.ctx.set("Connection", "keep-alive");

    const stream = new PassThrough();

    // 发送数据
    const send = (data: any) => {
      stream.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // 获取插件实例
    const instance = await this.pluginService.getInstance("ollama");
    // 调用chat
    const messages = [
      { role: "system", content: "你叫小酷，是个编程助手" },
      { role: "user", content: "用js写个Hello World" },
    ];
    instance.chat(messages, { stream: true }, (res) => {
      send(res);
      if (res.isEnd) {
        this.ctx.res.end();
      }
    });

    this.ctx.status = 200;
    this.ctx.body = stream;
  }
}
```

**客户端**

```js
const axios = require("axios");

const url = "http://127.0.0.1:8001/open/demo/sse/call";

const eventSource = axios.get(url, {
  responseType: "stream",
});

eventSource.then((response) => {
  // 收到消息
  response.data.on("data", (event) => {
    console.log("Message received:", event.toString());
  });
  // 发送结束
  response.data.on("end", () => {
    console.log("Connection closed");
  });
});
```
