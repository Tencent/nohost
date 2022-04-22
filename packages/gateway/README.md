# gateway
Nohost 网关是一个用于集群部署的请求接入层，可以接收以下 5 种请求：
1. HTTP 代理请求
2. HTTPS 代理请求
3. Socks v5 代理请求
4. HTTP & HTTPS 直接请求
5. Nginx 网关反向代理请求等

并支持：
1. 异步加载证书将 HTTPS 请求转成普通 HTTP 请求
2. 设置 Whistle 规则
3. 将请求转到指定代理

支持以下几种代理服务：
1. 普通代理，如 Whistle、Fiddler、Charles 等
2. Nohost 单实例（单机部署）
3. Nohost Cluster（多机部署）

也可以直接将请求转到后台 Server 等。

![架构图](https://user-images.githubusercontent.com/11450939/146495077-987ac90f-5f04-411f-97ea-a9919f048ab7.png)

# 用法
在项目中引入 npm 包：
``` sh
npm i --save @nohost/gateway
```

自定义启动文件 `dispatch.js`：
``` js
const startGateway = require('@nohost/gateway');

startGateway({
  sniCallback, //【可选】加载证书方法的路径
  port, //【可选】代理端口，默认 8080 端口，也可以通过 `"host:port"` 指定网卡
  workers, //【可选】启动的 Worker 数，默认为系统 CPU 核数
  socksPort, //【可选】设置 Socks v5 代理端口，设置后会自动启一个 Socks v5 服务，默认关闭，也可以通过 `"host:port"` 指定网卡
  httpsPort, //【可选】设置 HTTPS Server 端口，设置后会自动启一个 HTTPS 服务，默认关闭，也可以通过 `"host:port"` 指定网卡（用户无需通过代理请求）
  httpPort, //【可选】设置 HTTP Server 端口，设置后会自动启一个 HTTP 服务，默认关闭，也可以通过 `"host:port"` 指定网卡（用户无需通过代理请求）
  mode, //【可选】同 https://github.com/avwo/whistle/blob/master/lib/config.js#L720
  handleRequest(req, res), //【可选】处理 HTTP 请求
  handleUpgrade(req, socket), //【可选】处理 WebSocket 请求
  handleConnect(req, socket), //【可选】处理隧道代理（Tunnel）请求
});
```

以上参数也可以通过命令行和环境变量 `process.env` 设置，优先级 `命令行 > 环境变量 > 代码参数`:

### 命令行
例子（修改启动端口）：
``` sh
node dispatch --port 8888
```

支持以下参数：
1. `--sniCallback [sniCallback]`：同 `sniCallback` 参数
2. `--port [port]`：同 `port` 参数
3. `--workers [workers]`：同 `workers` 参数
4. `--socksPort [socksPort]`：同 `socksPort` 参数
5. `--httpsPort [httpsPort]`：同 `httpsPort` 参数
6. `--httpPort [httpPort]`：同 `httpPort` 参数
7. `--mode [mode]`：同 `mode` 参数
8. `--debug`：**启用调试模式（调试模式下只会启一个 Worker）可以查看抓包，默认关闭**
> 命令行参数多了 `--debug` 选项，其它类型参数不支持

### 环境变量
支持以下环境变量：
1. `process.env.NOHOST_SNI_CALLBACK`：同 `sniCallback` 参数
2. `process.env.NOHOST_PORT`：同 `port` 参数
3. `process.env.NOHOST_WORKERS`：同 `workers` 参数
4. `process.env.NOHOST_SOCKS_PORT`：同 `socksPort` 参数
5. `process.env.NOHOST_HTTPS_PORT`：同 `httpsPort` 参数
6. `process.env.NOHOST_HTTP_PORT`：同 `httpPort` 参数
7. `process.env.NOHOST_MODE`：同 `mode` 参数


# 例子
1. 代理到 Whistle
2. 代理到 Nohost
3. 代理到 Nohost 集群

### 代理到 Whistle
1. 部署 Whistle
    - 安装 Whistle：`npm i -g whistle`
    - 启动 Whistle：`w2 start`（默认端口 `8899`）
    - 如果用 Docker，可以通过 `w2 run -M prod` 启动
2. 转发普通请求：[test/whistle/gateway/dispatch.js](test/whistle/gateway/dispatch.js)
3. 查看抓包请求：[test/whistle/admin/dispatch.js](test/whistle/admin/dispatch.js)

### 代理到 Nohost
1. 部署 Nohost
    - 安装 Nohost`npm i -g nohost`
    - 启动 Nohost`n2 start`（默认端口 `8080`）
    - 如果用 Docker，可以通过 `n2 run -M prod` 启动
2. 转发普通请求：[test/nohost/gateway/dispatch.js](test/whistle/gateway/dispatch.js)
3. 查看抓包请求：[test/nohost/admin/dispatch.js](test/whistle/admin/dispatch.js)

### 代理到 Nohost 集群
1. 部署 Nohost 集群
    - 安装 Nohost`npm i -g nohost`
    - 启动 Nohost`n2 start`（默认端口 `8080`，需要在多个机器上起多个实例）
    - 如果用 Docker，可以通过 `n2 run -M prod` 启动
2. 转发普通请求：[test/cluster/gateway/dispatch.js](test/whistle/gateway/dispatch.js)
3. 查看抓包请求：[test/cluster/admin/dispatch.js](test/whistle/admin/dispatch.js)

# License
[MIT](./LICENSE)
