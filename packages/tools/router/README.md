# router
> 以下需要使用最新版的 nohost：https://github.com/nohosts/nohost

nohost 集群部署时，用来分发请求到各个节点的路由器。

# 安装
``` sh
npm i --save @nohost/router
```

# 使用

``` js
const Router = require('@nohost/router');

const {
  SPACE_NAME,
  GROUP_NAME,
  ENV_NAME,
  NOHOST_RULE,
  NOHOST_VALUE,
  CLIENT_ID,
  CLIENT_ID_FILTER,
  writeHead,
  writeError,
} = Router;
// 初始化传人部署的 nohost 服务器列表
const router = new Router([
    {
      host: '10.11.12.13',
      port: 8080
    },
    ...
  ]);

// 更新服务器列表


// 支持http、websocket、tunnel
try {
  const svrRes = await router.proxy(req, res);
  writeHead(res, svrRes);
  svrRes.pipe(res);
} catch (err) {
  writeError(res, err);
}

// 查看抓包请求
router.proxyUI(req, res);
```

#### 更新服务器列表
``` js
router.update([
  {
    host: '10.11.12.13',
    port: 8080
  },
  {
    host: '10.31.32.33',
    port: 8080
  },
  ...
]);
```
> router 每 12s 会检测一遍所有服务，并剔除不可用的

#### 转发正常请求
``` js
const getOptions = (req) => {
  const { headers } = req;
  const spaceName = 'imweb';
  let gruopName;
  let envName;
  if (headers.host === 'km.oa2.com') {
    gruopName = 'avenwu';
    envName = '测试'; // 可选
  } else if (req.headers.host !== 'km.oa.com') {
    gruopName = 'avenwu2';
    envName = '测试2'; // 可选
  }

  return {
    rules: 'file://{test.html} km.oa2.com www.test2.com',
    values: { 'test.html': 'hell world.' },
    spaceName,
    gruopName,
    envName,
    callback: console.log, // 可选
    // clientId: 'test', // 如果从外网转发过来的带登录态请求，设置下 clientId 方便插件当前用户的请求抓包
  };
};

router.proxy(req, res, getOptions(req));

// 或自己处理响应
// const svrRes = await router.proxy(req);

```
#### 查看抓包数据
``` js
router.proxyUI(req, res, getOptions(req));
```

### 只转发到指定 Nohost 服务
``` js
const Router = require('@nohost/router');

const router = new Router({
    host: '10.x.x.x',
    port: 8080,
});

router.proxy(req, res); // 同测试用例，无需设置 space / group，env 按需设置
router.proxyUI(req, res); // 同测试用例，无需设置 space / group，env 按需设置
```

具体实现参考：[测试用例](./test/README.md)

