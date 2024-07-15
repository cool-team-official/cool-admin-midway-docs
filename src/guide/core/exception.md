

# 异常处理

框架自带有： `CoolCommException`、`CoolCoreException`、`CoolValidateException`

## 通用异常

CoolCommException

返回码： 1001

返回消息：comm fail

用法：

```ts
// 可以自定义返回消息
throw new CoolCommException('用户不存在~');
```

## 验证异常

CoolValidateException

返回码： 1002

返回消息：validate fail

用法：

```ts
// 可以自定义返回消息
throw new CoolValidateException('验证码不正确~');
```

## 核心异常

CoolCoreException

返回码： 1003

返回消息：core fail

用法：

```ts
// 可以自定义返回消息
throw new CoolCoreException('模块缺少配置文件~');
```

## 全局异常

在系统中抛出异常都会被框架全局捕获，并返回消息：

```json
{
    "code": 1001,
    "message": "用户不存在"
}
```