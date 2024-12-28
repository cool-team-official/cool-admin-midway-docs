# 混淆打包

应很多用户要求，cool-admin 支持混淆打包，可以有效防止别人反编译你的代码。

## 使用

请确保更新到最新版本（`package.json` 中 `scirpts` 包含 `build:obfuscate`命令），然后执行以下命令：

```bash
npm run build:obfuscate
```

::: tip 提示

只是对代码进行混淆，部署方式不变，混淆后代码体积会变大，但是对安全性提升很大。

:::
