# 支付

::: warning 注意
以下方式是旧版本的支付方式，不建议使用，新版本已经插件化了，可以直接到插件市场下载对应的插件，插件的使用方式请参考插件市场对应插件的文档

[前往微信支付插件](https://cool-js.com/plugin/detail.html?id=33)

[前往支付宝支付插件](https://cool-js.com/plugin/detail.html?id=34)
:::

cool-admin 自带封装了微信和支付宝支付

## 微信支付

适用微信支付接口 v3

#### 1、安装插件

```shell
npm install @cool-midway/pay
```

#### 2、引入插件

`src/configuration.ts`

```ts
import { App, Configuration } from "@midwayjs/decorator";
import { ILifeCycle, IMidwayContainer } from "@midwayjs/core";
import { Application } from "egg";
import * as orm from "@midwayjs/orm";
import * as cool from "@cool-midway/core";
import * as pay from "@cool-midway/pay";

@Configuration({
  // 注意组件顺序 cool 有依赖orm组件， 所以必须放在，orm组件之后 cool的其他组件必须放在cool 核心组件之后
  imports: [pay],
})
export class ContainerLifeCycle {
  @App()
  app: Application;
  // 应用启动完成
  async onReady(container?: IMidwayContainer) {}
  // 应用停止
  async onStop() {}
}
```

#### 3、配置

也可以在`src/config/xxx.ts`配置(两种配置都存在，此种方式优先)

```ts
config.cool = {
  pay: {
    wx: {
      appid: "公众号ID",
      mchid: "微信商户号",
      publicKey: require("fs").readFileSync("公钥证书文件路径"),
      privateKey: require("fs").readFileSync("私钥证书文件路径"),
      notify_url: "支付回调地址",
      key: "可选参数 APIv3密钥",
    },
  },
};
```

#### 4、API

其他支付方式可以参考[wechatpay-node-v3](https://www.npmjs.com/package/wechatpay-node-v3)

## 支付宝支付

#### 1、安装插件

```shell
@cool-midway/pay
```

#### 2、引入插件

`src/configuration.ts`

```ts
import { App, Configuration } from "@midwayjs/decorator";
import { ILifeCycle, IMidwayContainer } from "@midwayjs/core";
import { Application } from "egg";
import * as orm from "@midwayjs/orm";
import * as cool from "@cool-midway/core";
import * as pay from "@cool-midway/pay";

@Configuration({
  // 注意组件顺序 cool 有依赖orm组件， 所以必须放在，orm组件之后 cool的其他组件必须放在cool 核心组件之后
  imports: [pay],
})
export class ContainerLifeCycle {
  @App()
  app: Application;
  // 应用启动完成
  async onReady(container?: IMidwayContainer) {}
  // 应用停止
  async onStop() {}
}
```

#### 3、配置

也可以在`src/config/xxx.ts`配置(两种配置都存在，此种方式优先)

```ts
config.cool = {
  pay: {
    ali: {
      notifyUrl: "https://xxx/app/order/pay/aliNotify",
      appId: "xxxxxx",
      privateKey: fs.readFileSync(
        path.resolve("./src/modules/order/pem/ali/privateKey.pem"),
        "ascii"
      ),
      keyType: "PKCS1",
      appCertPath: path.resolve(
        "./src/modules/order/pem/ali/appCertPublicKey.crt"
      ),
      alipayRootCertPath: path.resolve(
        "./src/modules/order/pem/ali/alipayRootCert.crt"
      ),
      alipayPublicCertPath: path.resolve(
        "./src/modules/order/pem/ali/alipayCertPublicKey_RSA2.crt"
      ),
    },
  },
};
```

::: warning
注意私钥需要用支付宝密钥工具转成 PKCS1 格式
:::

#### 4、API

其他支付方式可以参考[alipay-sdk](https://www.npmjs.com/package/alipay-sdk)

## DEMO 示例

`Controller`，需要注意开放回调接口，不要对其进行 token 校验

```ts
import {
  CoolController,
  BaseController,
  CoolUrlTag,
  TagTypes,
} from "@cool-midway/core";
import { Body, Inject, Post } from "@midwayjs/core";
import { OrderPayService } from "../../service/pay";

/**
 * 支付
 */
@CoolUrlTag({
  key: TagTypes.IGNORE_TOKEN,
  value: ["wxNotify", "aliNotify"],
})
@CoolController()
export class AppOrderPayController extends BaseController {
  @Inject()
  orderPayService: OrderPayService;

  @Post("/aliNotify", { summary: "支付宝支付回调通知" })
  async aliNotify(@Body() body) {
    this.orderPayService.aliNotify(body);
    return "success";
  }

  @Post("/aliQrcode", { summary: "支付宝扫码支付" })
  async aliQrcode(
    @Body("orderId") orderId: number,
    @Body("width") width: number
  ) {
    return this.ok(await this.orderPayService.aliQrcode(orderId, width));
  }

  @Post("/aliApp", { summary: "支付宝APP支付" })
  async aliApp(@Body("orderId") orderId: number) {
    return this.ok(await this.orderPayService.aliApp(orderId));
  }

  @Post("/wxApp", { summary: "微信APP支付" })
  async wxApp(@Body("orderId") orderId: number) {
    return this.ok(await this.orderPayService.wxApp(orderId));
  }

  @Post("/wxNotify", { summary: "微信支付回调" })
  async wxNotify(@Body() body) {
    await this.orderPayService.wxNotify(body);
    return "success";
  }

  @Post("/wxQrcode", { summary: "微信扫码支付" })
  async wxQrcode(@Body() body) {
    await this.orderPayService.wxQrcode(body);
    return "success";
  }
}
```

`Service`

```ts
import { Config, Inject, Provide } from "@midwayjs/decorator";
import { BaseService, CoolCommException } from "@cool-midway/core";
import { InjectEntityModel } from "@midwayjs/typeorm";
import { Repository } from "typeorm";
import { OrderInfoEntity } from "../entity/info";
// @ts-ignore
import { sign } from "alipay-sdk/lib/util";
import { CoolWxPay, CoolAliPay } from "@cool-midway/pay";
// @ts-ignore
import AlipayFormData from "alipay-sdk/lib/form";
// @ts-ignore
import { Decimal } from "decimal.js";
import { UserVipService } from "../../user/service/vip";
import { SeesionSocketService } from "../../session/service/socket";

/**
 * 支付
 */
@Provide()
export class OrderPayService extends BaseService {
  @InjectEntityModel(OrderInfoEntity)
  orderInfoEntity: Repository<OrderInfoEntity>;

  @Config("appName")
  appName: string;

  // 微信支付
  @Inject()
  wxPay: CoolWxPay;

  // 支付宝支付
  @Inject()
  aliPay: CoolAliPay;

  @Inject()
  userVipService: UserVipService;

  @Inject()
  seesionSocketService: SeesionSocketService;

  @Inject()
  ctx;

  /**
   * 微信APP支付
   * @param orderId
   * @returns
   */
  async wxApp(orderId: number) {
    const info = await this.orderInfo(orderId);
    const params = {
      description: `${this.appName}-订单`,
      out_trade_no: info?.orderNum,
      notify_url: this.wxPay.coolWxPay.notify_url,
      amount: {
        total: new Decimal(info.price).times(100).toNumber(),
      },
    };
    const result = await this.wxPay.getInstance().transactions_app(params);
    return result;
  }

  /**
   * 微信二维码支付
   * @param orderId
   */
  async wxQrcode(orderId: number) {
    const info = await this.orderInfo(orderId);
    const params = {
      description: `${this.appName}-订单`,
      out_trade_no: info?.orderNum,
      notify_url: this.wxPay.coolWxPay.notify_url,
      amount: {
        total: new Decimal(info.price).times(100).toNumber(),
      },
    };
    const result = await this.wxPay.getInstance().transactions_native(params);
    return result;
  }

  /**
   * 微信退款
   * @param order
   */
  async wxRefund(order: OrderInfoEntity) {
    const params = {
      description: `${this.appName}-订单`,
      out_trade_no: order.orderNum,
      notify_url: this.wxPay.coolWxPay.notify_url,
      amount: {
        refund: new Decimal(order.refundAmount).times(100).toNumber(),
        total: new Decimal(order.price).times(100).toNumber(),
      },
    };
    const result = await this.wxPay.getInstance().transactions_app(params);
    return result.status == "SUCCESS";
  }

  /**
   * 订单信息
   * @param orderId
   */
  async orderInfo(orderId: number) {
    const info = await this.orderInfoEntity.findOneBy({ id: orderId });
    if (!info && info?.payStatus != 0) {
      throw new CoolCommException("订单不存在或不是可支付的状态");
    }
    return info;
  }

  /**
   * 支付宝App支付
   * @param orderId
   */
  async aliApp(orderId: number) {
    const info = await this.orderInfo(orderId);
    // 返回支付链接
    const data = sign(
      "alipay.trade.app.pay",
      {
        notifyUrl: this.aliPay.coolAlipay.notifyUrl,
        bizContent: {
          subject: `${this.appName}-订单`,
          totalAmount: info.price,
          outTradeNo: info.orderNum,
          productCode: "QUICK_MSECURITY_PAY",
          body: {},
        },
      },
      this.aliPay.getInstance().config
    );
    const payInfo = new URLSearchParams(data).toString();
    return payInfo;
  }

  /**
   * 支付宝扫码支付
   * @param orderId
   */
  async aliQrcode(orderId: number, width = 400): Promise<any> {
    const info = await this.orderInfo(orderId);
    const formData = new AlipayFormData();
    // 调用 setMethod 并传入 get，会返回可以跳转到支付页面的 url
    formData.setMethod("get");
    formData.addField("notifyUrl", this.aliPay.coolAlipay.notifyUrl);
    formData.addField("bizContent", {
      outTradeNo: info.orderNum,
      productCode: "FAST_INSTANT_TRADE_PAY",
      totalAmount: info.price,
      subject: `${this.appName}-订单`,
      qrPayMode: 4,
      qrcodeWidth: width,
      body: JSON.stringify({
        orderId,
      }),
    });
    // 返回支付链接
    const result = await this.aliPay
      .getInstance()
      .exec("alipay.trade.page.pay", {}, { formData });
    return result;
  }

  /**
   * 支付宝支付回调通知
   * @param data
   */
  async aliNotify(data: any) {
    // 检查签名
    const check = await this.aliPay.signVerify(data);
    if (check && data.trade_status == "TRADE_SUCCESS") {
      await this.paySuccess(data.out_trade_no, 1);
    }
  }

  /**
   * 微信支付回调通知
   */
  async wxNotify(body: any) {
    const { ciphertext, associated_data, nonce } = body.resource;
    const data: any = this.wxPay
      .getInstance()
      .decipher_gcm(ciphertext, associated_data, nonce);
    const check = await this.wxPay.signVerify(this.ctx);
    // 验签通过，处理业务逻辑
    if (check && data.trade_state == "SUCCESS") {
      await this.paySuccess(data.out_trade_no, 0);
    }
  }

  /**
   * 支付成功
   * @param orderNum
   * @param payWay
   */
  async paySuccess(orderNum: string, payWay: number) {
    await this.orderInfoEntity.update(
      { orderNum },
      { payStatus: 1, payWay, payTime: new Date() }
    );
    await this.userVipService.paySuccess(orderNum);

    const order = await this.orderInfoEntity.findOneBy({ orderNum });

    this.seesionSocketService.sendByUserId(order.userId, "paySuccess", order);
  }

  /**
   * 订单号
   * @param order
   */
  async aliRefund(order: OrderInfoEntity) {
    const result = await this.aliPay.getInstance().exec("alipay.trade.refund", {
      bizContent: {
        out_trade_no: order.orderNum,
        refund_amount: order.price,
        refund_reason: order.refundReason,
      },
    });
    return result.code == "10000";
  }
}
```
