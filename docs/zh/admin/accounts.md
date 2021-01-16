# 账号

Nohost 是基于 Whistle 实现的多用户环境配置及抓包调试服务。小圆点里面出现的账号，需要到Nohost管理平台配置。
地址为http://imwebtest.test.com:8080/admin.html#accounts
> 其中 imwebtest.test.com 表示nohost运行的域名

页面如下图所示：

![账号页面](https://user-images.githubusercontent.com/4689952/69627459-9386c800-1085-11ea-8611-75dbb666c18d.png)

点击 **+添加账号** 可以添加使用账号:


新添加的账号可以设置独立的规则，地址为：
http://imwebtest.test.com:8080/data.html?name={新建的账号}
> 其中 imwebtest.test.com 表示nohost运行的域名

![账号规则](https://user-images.githubusercontent.com/4689952/69627831-62f35e00-1086-11ea-8a37-95647c392242.png)

添加的账号会出现在**环境选择列表**，**环境选择列表**可能出现在多个地方，如果在**入口配置**( http://imwebtest.test.com:8080/admin.html#config/entrySettings )配置了出现**环境选择圆点**的页面，则访问这个页面经过本地Whistle代理的时候，会被注入**小圆点**，比如:

![环境选择](https://user-images.githubusercontent.com/4689952/69627856-6f77b680-1086-11ea-8f15-76cf117103c6.png)
