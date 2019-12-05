# 安装插件
nohost 兼容所有 whistle 插件（如何开发 whistle 插件直接参考 [GitHub 文档](https://github.com/avwo/whistle)），并支持把插件安装在全局的 whistle，或只对所有账号生效，也可以只对某个账号生效。

## 安装全局插件
通过 `npm` 或其它 `xnpm` 全局安装即可：
``` sh
npm i -g whistle.xxxx
```
> 或 `npm i -g @org/whistle.xxx`

安装后可以通过设置对 nohost 域名及端口访问：`http://imwebtest.oa.com:8080/whistle.xxx/`

## 安装所有账号的插件
安装只针对所有账号生效对局部插件，可以先进入系统目录 `~/whistle-plugins/whistle.nohost` 再用 `npm` 或其它 `xnpm` 本地安装即可：
``` sh
[~/whistle-plugins/whistle.nohost] # npm i whistle.xxx
```
> 记住不能加 <del>`-g`</del>
安装后可以通过 `http://imwebtest.oa.com:8080/account/account-name/whistle.xxx/`，`account-name` 表示某个账号的名称

## 安装指定账号的插件
只对某个账号生效对插件，只需进入 `~/whistle-plugins/whistle.nohost/account-name` 目录再按上述方法安装即可。
