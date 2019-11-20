# nohost
nohost 是基于 [whistle](https://github.com/avwo/whistle) 实现的多用户多环境配置及抓包调试服务，不仅具备 whistle 的所有功能，而且支持多人多环境同时使用，用于部署在公共服务器上供整个部门（公司）的同事一起使用，具有有以下功能：
1. 环境共享：前端无需配后台环境，后台无需配前端环境，其他人无需配任何环境
2. 抓包调试：远程实时抓包调试，支持各种 whistle 规则，以及通过链接分享抓包数据
3. 历史记录：可以把环境配置及抓包数据沉淀下来，供后续随时切换查看
4. 插件扩展：可以通过插件扩展实现诸如 [inspect](https://github.com/whistle-plugins/whistle.inspect)，[vase](https://github.com/whistle-plugins/whistle.vase)，[autosave](https://github.com/whistle-plugins/whistle.autosave) 等功能
5. 对外接口：提供对外接口，可供发布系统、CI等工具操作，实现自动化增删查改环境配置

![效果图](https://user-images.githubusercontent.com/11450939/40436253-28a90f28-5ee5-11e8-97a5-fd598e32e0df.gif)

# 一. 准备
安装 nohost 之前，建议先做好以下工作：

1. 准备一台服务器，假设IP为：10.222.2.200（以你自己的服务器为准）
2. 准备一个域名（以下假设为：imwebtest.oa.com），并把 DNS 指向上述服务器（10.222.2.200）
3. 收集涉及域名的证书对，只支持 `xxx.key` 和 `xxx.crt`（非必须，但建议用证书的证书，否则要么 nohost 里面无法查看 HTTPS 的内容，要么每个访问 nohost 的客户端都要安装一遍根证书）

> 申请域名的好处是可以直接用域名访问管理及账号页面，手机也可以通过域名设置代理访问 nohost，方便记忆及输入

# 二. 安装
首先，需要安装Node（建议使用最新的LTS版本）：[NodeJS](https://nodejs.org/en/)

Node安装成功后，通过npm安装 `nohost`：
``` sh
npm i -g @nohost/server --registry=https://r.npm.taobao.org
```
安装完成后在命令行执行以下命令启动 `nohost`：
``` sh
n2 start
```
> nohost 的默认端口为 8080，如果需要自定义端口，可以通过 `n2 restart -p 80` 设置。
> 如果命令行提示没有对应命令，检查下系统环境变量 `PATH` 配置，看看 nohost 安装后生成的命令所在目录是否已添加到 `PATH`。

重启 `nohost`：
``` sh
n2 restart
```

停止 `nohost`：
``` sh
n2 stop
```

# 三. 配置
安装启动成功后，打开管理员页面 `http://10.222.2.200:8080/admin.html#system/administrator`，输入默认用户名（`admin`）和密码（`123456`），打开系统配置后：
> 其中 `10.222.2.200` 表示nohost运行的服务器IP，具体根据实际 ServerIP 替换
1. 修改管理员的默认账号名和密码（**不建议使用默认账号及密码，如果忘记管理员账号名或密码，可以通过 `n2 restart --reset` 重置**）
2. 设置nohost的域名（将准备工作申请对域名填上，如果需要设置多个域名，可以通过逗号 `,` 分隔）
3. 上传涉及的 key 和证书（证书只支持 `.crt` 格式）

![admin](https://user-images.githubusercontent.com/11450939/69247822-0c010b00-0be6-11ea-8b03-5a0ae4b12c6e.gif)

**Note: 设置的域名 DNS 一定要指向该IP，否则可能出现不可用状态**

# 四. 访问

# 五. 账号

# 六. 配置

# 七. 规则

**更多功能参见详细文档：https://nohosts.github.io/nohost/**ß

# License
[MIT](./LICENSE)