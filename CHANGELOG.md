# v0.1.9
1. style: 支持一键清除所有不可用证书
2. refactor: 优化连接异常处理

# v0.1.8
# v0.1.7
1. refactor: 优化异常处理

# v0.1.6
1. refactor: 手动销毁异常连接

# v0.1.5
1. refactor: 更好支持访问插件的配置界面
  - `http://nohost.domain.com:8080/p/name/`
  - `http://nohost.domain.com:8080/whistle.name/`
  - 在管理员的 Whistle 里面配置规则：`xxx.oa.com http://local.whistlejs.com/pluign.name/`

# v0.1.4
1. refactor: 添加全局日志，及处理未知异常

# v0.1.3
1. refactor: 通过 `n2 restart --reset` 重置密码后，再用 `n2 restart` 重启时不带上 `--reset` 参数

# v0.1.2
1. fix: iOS无法访问的问题

# V0.1.1
1. refactor: 兼容插件版通过 `http://domain:port/user/account.html` 访问抓包配置页面

# v0.1.0
1. 正式可用版本

# v0.0.x
1. 非正式版本，请使用 `0.1.0` 及以上版本