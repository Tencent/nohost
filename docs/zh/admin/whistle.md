# Whistle
nohost 主进程里面运行了一个全局 whistle 实例，所有请求都会经过该 whistle，可以在里面对所有请求进行操作，如：给某个 cdn 域名统一设置 cors，或拦截某些上报请求 `xxx.report.com statusCode://204` 等。
![Rules](https://user-images.githubusercontent.com/11450939/69839208-90602780-1291-11ea-8111-9b9a728d4ded.png)

该 whistle 也可以用来管理全局等插件，包括系统里面用到等 nohost 插件。

![Plugins](https://user-images.githubusercontent.com/11450939/69839516-c8b43580-1292-11ea-8075-1e206f723c04.png)
