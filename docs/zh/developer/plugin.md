# 安装插件
Nohost 兼容所有 Whistle 插件（如何开发 Whistle 插件直接参考 [GitHub 文档](https://github.com/avwo/whistle)），并支持把插件安装在全局的 Whistle，或只对所有账号生效，也可以只对某个账号生效。

## 安装全局插件
通过 `npm` 或其它 `xnpm` 全局安装即可：
``` sh
npm i -g whistle.xxxx
```
> 或 `npm i -g @org/whistle.xxx`

安装后可以通过设置对 Nohost 域名及端口访问：`http://imwebtest.test.com:8080/whistle.xxx/`

## 安装所有账号的插件（要求 `v0.3.5` 及以上版本）
安装只针对所有账号生效对局部插件：
``` sh
n2 i whistle.xxx @tnpm/whistle.yyy
```
> 如果使用 tnpm 或 cnpm 等第三方命令，可以用 `n2 ti whistle.xxx @tnpm/whistle.yyy` 或 `n2 ci whistle.xxx @tnpm/whistle.yyy`
安装后可以通过 `http://imwebtest.test.com:8080/account/account-name/whistle.xxx/`，`account-name` 表示某个账号的名称

## 安装指定账号的插件（要求 `v0.3.5` 及以上版本）
只对某个账号生效对插件：
``` sh
n2 i whistle.xxx @tnpm/whistle.yyy -a account-name
```
