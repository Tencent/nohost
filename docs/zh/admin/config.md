# 配置
## 入口配置
**您在入口配置里可以配置一些规则，来决定哪些请求需要通过nohost转发。**

例如：可以设置一些页面不注入whistle小圆点，一些请求不转发到Nohost服务器。

具体请求链路如下所示：

![image](https://user-images.githubusercontent.com/9802379/70115398-89268880-169a-11ea-8ad9-f0fab305b633.png)

入口配置的规则有三种（#xxx表示注释）：
```
pattern #转发到nohost，如果是html页面则注入小圆点
-pattern #转发到nohost，不注入小圆点
--pattern #不转发到nohost，且不注入小圆点
x)-pattern #x为整数（正负数零都可以），表示手动设置优先级，默认为0
```
[pattern规则](https://wproxy.org/whistle/pattern.html)：匹配顺序是从上到下，每个请求只会匹配其中一个，证书里面到域名优先级默认最低，可以通过 1) 设置优先级。

如：
```
ke.qq.com
-*.url.cn
--localhost.**
-1)**.qq.com

表示：

所有 ke.qq.com 的请求都转发到nohost，且所有 html 都注入小圆点
所有 xxx.url.cn 的请求都转发到nohost，但不注入小圆点
所有 localhost.xxx.yyy... 的请求都不转发到nohost，且不注入小圆点
所有 qq.com 的子代域名请求都转发到nohost，但不注入小圆点，并优先级设为 -1 ，确保证书里面的 qq.com 子域名可以正常注入小圆点
```
## 账号规则
每个接入nohost的团队都可以设置账号规则，其主要作用于你团队里的成员，规则分为默认规则和专属规则。

### 默认规则
**账号的默认规则可以对所有用户生效，就是account进程里面定义的规则。**

默认规则相当于每个用户本地whistle的default规则。

注意：它的优先级是低于nohost插件里规则。例如：nohost插件里面如果设置某个cgi的返回码是500，账号规则里是无法改变的。下图所示的就是nohost插件的规则：

![image](https://user-images.githubusercontent.com/9802379/70145884-07574f00-16dc-11ea-8746-60da5ebd0883.png)

### 专属规则
账号的专属规则只有配置一些特殊规则时 才会生效。

例如：配置 cgi-a b，这种key value的形式

## 规则模板
规则模板将whistle的rules里面的信息通过模板（@形式）传递给“规则模板”使用，类似于类似es6的模板字符串。

例如：本地/服务器whistle的rules里面@name，就会传递name到规则模板，然后${name}就可以拿到name了
![image](https://user-images.githubusercontent.com/9802379/70147394-1390db80-16df-11ea-8074-274bf278cc75.png)

## 模板数据
模板数据是一个JSON对象的格式，主要有以下三种用途：
- 作为“规则模板”的数据来源，例如：
```
# 模板数据为以下内容
{
  "user1": 1,
  "user2": 2
}
# 然后在模板里可以${xxx}就可以拿到xxx对应的属性值了
${user1}
```
- 账号规则里面可以通过$name，同样可以获取到name值
- 替换功能，例如：
例如ip1: ip2，表示用ip2全局替换ip1。
```
# 模板数据为以下内容时，10.1.2.3会被替换成10.4.5.6
{
  "10.1.2.3": "10.4.5.6"
}
```
