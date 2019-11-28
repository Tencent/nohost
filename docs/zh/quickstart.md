## 准备
安装 nohost 之前，建议先做好以下工作：

1. 准备一台服务器，假设IP为：10.1.2.3（以你自己的服务器为准，建议4核8G以上到配置）
2. 准备一个域名（以下假设为：imwebtest.oa.com），并把 DNS 指向上述服务器（10.1.2.3）
3. 收集涉及域名的证书对，只支持 `xxx.key` 和 `xxx.crt`（非必须，但建议用证书的证书，否则要么 nohost 里面无法查看 HTTPS 的内容，要么每个访问 nohost 的客户端都要安装一遍根证书）

> 申请域名的好处是可以直接用域名访问管理及账号页面，手机也可以通过域名设置代理访问 nohost，方便记忆及输入

## 安装
首先，需要安装Node（建议使用最新的LTS版本）：[Node](https://nodejs.org/en/)

Node安装成功后，通过npm安装 `nohost`：
``` sh
npm i -g @nohost/server --registry=https://r.npm.taobao.org
```
安装完成后执行启动命令：
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

重置管理员账号：
``` sh
n2 restart --reset
```

## 配置

安装启动成功后，打开管理员页面 `http://10.1.2.3:8080/admin.html#system/administrator`，输入默认用户名（`admin`）和密码（`123456`），打开系统配置后：
> 其中 `10.1.2.3` 表示nohost运行的服务器IP，具体根据实际 ServerIP 替换
1. 修改管理员的默认账号名和密码（**不建议使用默认账号及密码，如果忘记管理员账号名或密码，可以通过 `n2 restart --reset` 重置**）
2. 设置nohost的域名（将申请的域名填上，如果需要设置多个域名，可以通过逗号 `,` 分隔）
3. 上传涉及的 key 和证书（证书只支持 `.crt` 格式）

![admin](https://user-images.githubusercontent.com/11450939/69247822-0c010b00-0be6-11ea-8b03-5a0ae4b12c6e.gif)

## 访问
nohost 本身就是一个代理，可以直接配置浏览器或系统代理访问，也可以通过 Nginx反向代理访问，为方便大家使用，针对不同的人群可以使用不同的方案（以下用 `imwebtest.oa.com` 表示 nohost 的域名，具体域名需要自己申请及设置）。

#### 前端开发
前端开发建议使用最新版的 [whistle](https://github.com/avwo/whistle)，可以通过以下两种方式访问 nohost：

1. 直接在 whistle 上配置远程规则
    ``` txt
    @http://imwebtest.oa.com:8080/whistle.nohost/cgi-bin/plugin-rules
    ```
    > 上述配置表示 whistle 从 `http://imwebtest.oa.com:8080/whistle.nohost/cgi-bin/plugin-rules` 获取 nohost 的生成的入口规则，并且如果 nohost 规则有变会自动更新规则，这些规则是由 nohost 上传证书的域名及界面 `配置/入口配置` 配置的规则自动生成（具体参见后面的**配置**），这些规则可以自动过滤掉无关请求，只会把相关的请求转到nohost。

    当然这种直接手动配置在 whistle 上还不是最好的方式，更建议的方式是把这些规则集成到插件里面，这样开发者只需安装插件即可。
2. **【强烈推荐】** 集成 whistle 插件，具体参考：[https://github.com/nohosts/whistle.nohost-imweb/blob/master/dev.md](https://github.com/nohosts/whistle.nohost-imweb/blob/master/dev.md)

#### 后台开发
后台开发推荐使用 Chrome 的 [SwitchyOmega](https://chrome.google.com/webstore/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif) 配置代理规则 （如上述代理配置 `imwebtest.oa.com` + `8080`），如果不想所有请求都转到 nohost，可以配置 SwitchyOmega 的自动切换或者用PAC脚本代替，也可以参考 `nohost-client` 打包一个客户端：[https://github.com/nohosts/nohost-client](https://github.com/nohosts/nohost-client)。手机端可以直接配代理，或者通过 VPN App 设置代理，如 iPhone 可以用 `detour`。

#### 其他人员
非开发人员尽量使用客户端、APP、或通过外网转发的方式，减少他们的接入成本，如何打包客户端参考：[https://github.com/nohosts/nohost-client](https://github.com/nohosts/nohost-client)；手机等同后台开发的配置方式。

#### 外网访问
一般 nohost 是部署在公司内网，外网是不可以直接访问，需要通过接入层（如：Nginx）转发，如何配置转发参见详细文档：https://nohosts.github.io/nohost/
