# excel 导入导出

以下为后端导入导出的方式，但是我们更为建议使用前端导入导出，这样不仅可以减少服务器压力，还可以减少网络传输时间。

[前端导入导出文档](https://vue.cool-admin.com/src/guide/plugins/excel.html)

#### 相关文档

[midwayjs 文件上传](https://www.midwayjs.org/docs/extensions/upload)

[node-xlsx 模块](https://www.npmjs.com/package/node-xlsx)

#### DEMO 示例

```ts
import { Get, Inject, Post, Provide } from "@midwayjs/decorator";
import { CoolController, BaseController, Files } from "@cool-midway/core";
import xlsx from "node-xlsx";
import * as XLSX from "xlsx";
import * as fs from "fs";

/**
 * 导入导出
 */
@Provide()
@CoolController()
export class DemoExcelController extends BaseController {
  @Inject()
  ctx;

  /**
   * 导入
   */
  @Post("/import")
  async import(@Files() files) {
    // 读取上传上来的文件
    const file = files[0];
    try {
      // 解析文件
      const data = xlsx.parse(file.filepath);
      console.log(data);

      // xlsx包使用方式
      //  const data = XLSX.readFile(file.filepath, {});
      //  const json = XLSX.utils.sheet_to_json(data.Sheets['Sheet1']);
    } finally {
      fs.unlinkSync(file.filepath);
    }
    return this.ok();
  }

  /**
   * 导出
   */
  @Get("/export")
  async export() {
    const data = [
      ["姓名", "年龄"],
      ["啊平", 18],
      ["江帅", 19],
    ];
    const buffer = xlsx.build([{ name: "成员", data: data }]);
    const fileName = "导出.xlsx";
    this.ctx.attachment(fileName);
    this.ctx.status = 200;
    this.ctx.body = buffer;
  }
}
```
