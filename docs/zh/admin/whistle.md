# Whistle
nohost 主进程里面运行了一个全局 whistle 实例，所有请求都会经过该 whistle，可以在里面对所有请求进行操作，如：给某个 cdn 域名统一设置 cors，或拦截某些上报请求 `xxx.report.com statusCode://204` 等。

该 whistle 也可以用来管理全局等插件，包括系统里面用到等 nohost 插件。


