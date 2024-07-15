# 大数据(Elasticsearch)

ElasticSearch 一般可以用来做`附近的人`、`日志`、`商品搜索`、`统计分析`等需求，亿级数据都能快速查询

cool-admin要求的`es>=8.x`

[官方文档](https://www.elastic.co/guide/en/elasticsearch/reference/index.html)

## 使用

### 安装

```shell
yarn add @cool-midway/es
```

### 配置

`config/config.xxx.ts`下

```ts
config.cool = {
	es: {
            // 集群模式下可以配置多个地址
            nodes: ["http://localhost:9200"],
            // 其他配置（可选）
            options?: ClientOptions
	}
};

```

`ClientOptions`， 具体配置可以查看[文档](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/client-connecting.html)
```ts
export interface ClientOptions {
    Connection?: typeof BaseConnection;
    ConnectionPool?: typeof BaseConnectionPool;
    Transport?: typeof Transport;
    Serializer?: typeof Serializer;
    maxRetries?: number;
    requestTimeout?: number;
    pingTimeout?: number;
    sniffInterval?: number | boolean;
    sniffOnStart?: boolean;
    sniffEndpoint?: string;
    sniffOnConnectionFault?: boolean;
    resurrectStrategy?: 'ping' | 'optimistic' | 'none';
    compression?: boolean;
    tls?: TlsConnectionOptions;
    agent?: HttpAgentOptions | UndiciAgentOptions | agentFn | false;
    nodeFilter?: nodeFilterFn;
    nodeSelector?: nodeSelectorFn;
    headers?: Record<string, any>;
    opaqueIdPrefix?: string;
    generateRequestId?: generateRequestIdFn;
    name?: string | symbol;
    auth?: BasicAuth | ApiKeyAuth | BearerAuth;
    context?: Context;
    proxy?: string | URL;
    enableMetaHeader?: boolean;
    cloud?: {
        id: string;
    };
    disablePrototypePoisoningProtection?: boolean | 'proto' | 'constructor';
    caFingerprint?: string;
    maxResponseSize?: number;
    maxCompressedResponseSize?: number;
}
```

### 启用

```ts
import * as es from "@cool-midway/es";

@Configuration({
	// 注意组件顺序 cool 有依赖orm组件， 所以必须放在，orm组件之后 cool的其他组件必须放在cool 核心组件之后
	imports: [es]
})
export class ContainerLifeCycle  {
	@App()
	app: Application;

	@Inject("cool:coolEventManager")
	coolEventManager: CoolEventManager;

	// 应用启动完成
	async onReady(container?: IMidwayContainer) {
		this.coolEventManager.emit("appReady");
	}
	// 应用停止
	async onStop() {}
}
```

## 用法

### 新建索引

数据类型可参考文档[data types](https://www.elastic.co/guide/en/elasticsearch/reference/7.16/mapping-types.html)

```ts
import { CoolEsIndex, ICoolEs, BaseEsIndex } from '@cool-midway/es';

/**
 * 测试索引
 */
@CoolEsIndex({ name: 'test', replicas: 0 })
export class TestEsIndex extends BaseEsIndex implements ICoolEs {
  indexInfo() {
    return {
      // 需要安装ik分词器 https://github.com/medcl/elasticsearch-analysis-ik
      name: {
        type: 'text',
        analyzer: 'ik_max_word',
        search_analyzer: 'ik_max_word',
        fields: {
          raw: {
            type: 'keyword',
          },
        },
      },
      age: {
        type: 'long',
      },
    };
  }
}

```

### 操作索引

[官方API文档](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/index.html)

```ts
// 新增与修改
await this.testEsIndex.upsert({ name: "啊平", age: 20 });
// 带ID的为修改
await this.testEsIndex.upsert({ id: "6y_W_nwBPH70UTxunOPD", name: "啊平", age: 22 });
// 根据ID修改
await this.testEsIndex.updateById({ id: "6y_W_nwBPH70UTxunOPD", name: "啊平", age: 22 });
// 根据条件更新
await this.testEsIndex.updateByQuery({
	script: {
		lang: "painless",
		source: 'ctx._source["name"] = "啊平2"'
	},
	query: {
		term: {
			age: 20
		}
	}
});
// 批量操作 第二个参数type： index、create、delete、update
await this.testEsIndex.batchIndex([{ id: "6y_W_nwBPH70UTxunOPD", name: "啊平2", age: 26 }]);
// 删除单个ID
await this.testEsIndex.deleteById("6y_W_nwBPH70UTxunOPD");
// 删除多个ID
await this.testEsIndex.deleteByIds(["6y_W_nwBPH70UTxunOPD", "cjLn_nwBPH70UTxubZEz"]);
// 根据条件删除
await this.testEsIndex.deleteByQuery({});
// 查询所有数据 默认最大返回10000条
await this.testEsIndex.find();
// 查询数量
await this.testEsIndex.findCount({});
// 分页查询
await this.testEsIndex.findPage();
// 查询单个ID
await this.testEsIndex.findById('cjLn_nwBPH70UTxubZEz');
// 查询多个ID
await this.testEsIndex.findByIds(["6y_W_nwBPH70UTxunOPD", "cjLn_nwBPH70UTxubZEz"]);
// 直接操作es客户端
await this.testEsIndex.client.xxx;
```

### 客户端实例

```ts
import { CoolElasticSearch } from "@cool-midway/es";

@Inject()
es: CoolElasticSearch;

// es 客户端实例
this.es.client;
```

## 事件

当Elasticsearch客户端初始化完成，会向框架发送一个`esReady`事件，我们可以在此处理客户端初始化完成之后的操作。

```ts
import { Inject, Logger, Provide, Scope, ScopeEnum } from '@midwayjs/decorator';
import { ILogger } from '@midwayjs/logger';
import { CoolEvent, Event } from '@cool-midway/core';
import { CommonDbService } from '../service/db';

/**
 * 接收事件
 */
@CoolEvent()
export class CommonEvent {
  @Inject()
  commonDbService: CommonDbService;

  @Logger()
  logger: ILogger;
  /**
   * es准备成功
   */
  @Event('esReady')
  async esReady() {
    this.logger.info('初始化云数据库');
    this.commonDbService.initDB();
  }
}

```

## 地理位置示例

开放过程中经常遇到需要计算距离并排序的场景，如附近的人等LBS应用

### 新建模型

```ts
import { CoolEsIndex, ICoolEs, BaseEsIndex } from '@cool-midway/es';

/**
 * 地理位置
 */
@CoolEsIndex({ name: 'geo', replicas: 0 })
export class GeoEsIndex extends BaseEsIndex implements ICoolEs {
  indexInfo() {
    return {
      // 名称
      name: {
        type: 'text',
        analyzer: 'ik_max_word',
        search_analyzer: 'ik_max_word',
        fields: {
          raw: {
            type: 'keyword',
          },
        },
      },
      // 位置
      location: {
        type: 'geo_point',
      },
    };
  }
}

```
### 添加数据

```ts
@Inject()
geoEsIndex: GeoEsIndex;

await this.geoEsIndex.upsert({
      name: '软二',
      location: {
        lat: 24.485762,
        lon: 118.178644,
      },
    });
      
    await this.geoEsIndex.upsert({
      name: '软三',
      location: {
        lat: 24.613348,
        lon: 118.047855,
      },
    });

    await this.geoEsIndex.upsert({
      name: '园博苑',
      location: {
        lat: 24.581997,
        lon: 118.072557,
      },
    });

    await this.geoEsIndex.upsert({
      name: '集美万达',
      location: {
        lat: 24.572943,
        lon: 118.092298,
      },
    });

    await this.geoEsIndex.upsert({
      name: '岛内万达',
      location: {
        lat: 24.503687,
        lon: 118.092298,
      },
    });
```

### 按距离查询

```ts
const body = {
      query: {
        bool: {
          must: {
            match_all: {},
          },
          filter: {
            geo_distance: {
              distance: '50km',
              location: {
                lat: 24.615493,
                lon: 118.04661,
              },
            },
          },
        },
      },
      sort: [
        {
          _geo_distance: {
            location: {
              lat: 24.615493,
              lon: 118.04661,
            },
            order: 'asc',
            unit: 'km',
          },
        },
      ],
    };
    const result = await this.geoEsIndex.findPage(body);
    console.log(result);
```

返回

```json
{
    "code": 1000,
    "message": "success",
    "data": {
        "list": [
            {
                "name": "软三",
                "location": {
                    "lat": 24.613348,
                    "lon": 118.047855
                },
                "id": "2oNozIEB3-P5Jg2TvGod",
                "sort": [
                    0.2696838222327856
                ]
            },
            {
                "name": "园博苑",
                "location": {
                    "lat": 24.581997,
                    "lon": 118.072557
                },
                "id": "24NozIEB3-P5Jg2TvGpN",
                "sort": [
                    4.555704969884185
                ]
            },
            {
                "name": "集美万达",
                "location": {
                    "lat": 24.572943,
                    "lon": 118.092298
                },
                "id": "3INozIEB3-P5Jg2TvGpx",
                "sort": [
                    6.612441108550741
                ]
            },
            {
                "name": "岛内万达",
                "location": {
                    "lat": 24.503687,
                    "lon": 118.092298
                },
                "id": "3YNozIEB3-P5Jg2TvGqb",
                "sort": [
                    13.263181575779093
                ]
            },
            {
                "name": "软二",
                "location": {
                    "lat": 24.485762,
                    "lon": 118.178644
                },
                "id": "2YNozIEB3-P5Jg2Tu2r1",
                "sort": [
                    19.65779976050527
                ]
            }
        ],
        "pagination": {
            "page": 1,
            "size": 20,
            "total": 5
        }
    }
}
```
