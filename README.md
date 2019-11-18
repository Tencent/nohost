# nohost
nohost 是基于 [whistle](https://github.com/avwo/whistle) 实现的多用户环境配置及抓包调试服务，不仅具备 whistle 的所有功能，而且支持多人多环境同时使用，主要用于部署在公共服务器上供整个部门或公司的人共同使用，实现：
1. 前端开发无需配后台环境，且可以随时切换任意环境
2. 后台开发无需配前端环境，且可以随时切换任意环境
3. 其他人无需手动配环境，可以随时切换任意测试环境
4. 远程实时抓包调试、分享抓包数据、插件扩展等功能

![效果图](https://user-images.githubusercontent.com/11450939/40436253-28a90f28-5ee5-11e8-97a5-fd598e32e0df.gif)

# 安装
首先，需要安装Node（建议使用最新的LTS版本）：[NodeJS](https://nodejs.org/en/)

Node安装成功后，通过npm安装 `nohost`：
``` sh
npm i -g @nohost/server
```
安装完成后在命令行执行以下命令启动 `nohost`：
``` sh
nohost start
```
> nohost 的默认端口为 8080，如果需要自定义端口，可以通过 `nohost start -p 80` 的方式修改。
> 如果命令行提示没有对应命令，检查下系统环境变量 `PATH` 配置，看看 nohost 安装后生成的命令所在目录是否已添加到 `PATH`。

重启 `nohost`：
``` sh
nohost restart
```

停止 `nohost`：
``` sh
nohost stop
```

# 配置
安装启动成功后，打开管理员页面 `http://10.66.53.11:8080/admin.html#system/administrator` 输入默认用户名（`admin`）和密码（`123456`），打开系统配置后：
> 其中 `10.66.53.11` 表示nohost运行的服务器IP，具体IP根据实际情况填写。
1. 修改管理员的用户名和密码
2. 设置nohost的域名（提前申请一个 DNS 指向nohost服务器 IP 的域名）
3. 上传涉及的证书（证书只支持 `.crt` 格式）
4. 给每个相关的同事添加一个账号

上述配置完成后可以开始使用 nohost 了，更多功能及如何使用 nohost 参见[帮助文档](https://nohosts.github.io/nohost/)。

# License
[MIT](./LICENSE)