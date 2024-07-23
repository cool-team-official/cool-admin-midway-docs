# redis 集群

redis 集群有多种方式，主从、代理(proxy)、哨兵等，cool-admin 任务、队列、微服务包括 socket 的分布式都基于 redis 实现，cluster 方案对 cool-admin 是最兼容的方案。

## cluster 集群

1、每个服务器都安装好 redis，建议通过宝塔一键安装方便配置；

2、开放端口 6379 及集群总线端口 10000+客户端端口(6379) = 16379；

3、修改配置文件

```json
bind 本机ip

cluster-enabled yes  #开启集群
cluster-config-file nodes-6379.conf   #集群节点配置文件，这个文件是不能手动编辑的。确保每一个集群节点的配置文件不通
cluster-node-timeout 15000   #集群节点的超时时间，单位：ms，超时后集群会认为该节点失败
appendonly yes  #持久化
daemonize yes   #守护进程
```

4、创建集群

创建 3 主 3 从的集群

```shell
redis-cli --cluster create ip1:6379 ip2:6379 ip3:6379 ip4:6379 ip5:6379 ip6:6379 --cluster-replicas 1
```

::: warning
注意开放端口，安全组也需要配置
:::
