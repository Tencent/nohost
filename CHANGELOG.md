# v1.1.0
1. refactor: 更换配置默认存储目录，与 Whistle 的默认目录分开

# v1.0.1
1. fix: `--max-http-header-size` 不生效问题

# v1.0.0
1. feat: 完整支持隧道代理请求，包括 UI 请求
2. fix: uninstall 插件无法清理干净的问题

# v0.9
1. fix: 设置域名后还是无法访问界面的问题
2. refactor: 优化内部实现适应复杂网络

# v0.8
1. perf: 解决一些内存无法及时释放问题
2. feat: 支持将用户页面重定向到指定 URL

# v0.7
1. refactor: 优化查看本机请求，解决
2. style: 小圆点支持记录5个最近选择到环境
# v0.6
1. style: 调整界面样式
2. refactor: 调整 GC 参数

# v0.5
1. feat: 添加 headless 模式
2. fix: 内存泄露问题

# v0.4
1. feat: 支持通过命令行 `-n name -w pwd` 设置管理员的用户名和密码
2. fix: 修复了一些bug

# v0.3
1. feat: 支持 docker 的宿主机的IP访问界面
2. feat: 配置代理后，支持默认域名 `admin.nohost.pro` 访问界面
3. feat: 支持通过 `n2 install whistle.xxx` 及 `n2 uninstall whistle.xxx` 安装和卸载插件

# v0.2
1. 正式稳定版本

# v0.1
1. 可用版本，请使用最新版本

# v0.0.x
1. 非正式版本，请使用最新版本