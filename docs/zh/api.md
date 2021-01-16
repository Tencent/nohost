# API
Nohost 也对外提供了接口，方便第三方平台（如：发布部署系统）对接 Nohost，可以对 Nohost 账号对环境进行增删查改。

> 以下假设当前 Nohost 部署对域名和端口为 `imwebtest.test.com:8080`

首先，需要在管理员页面设置 `Auth Key` ：
![image](https://user-images.githubusercontent.com/11450939/69726792-3a3d9800-115c-11ea-841d-d2bb5922d089.png)

假设设置的 `Auth Key`  为：`test@imweb`。

### 获取所有账号及环境列表
1. url: `http://imwebtest.test.com:8080/cgi-bin/list`
2. method： `GET`
3. 无需任何鉴权信息

### 获取当前选中的环境信息
1. url: `http://imwebtest.test.com:8080/cgi-bin/get-env`
2. method： `GET`
3. 无需任何鉴权信息

### 获取指定账号的环境列表
1. url: `http://imwebtest.test.com:8080/open-api/list`
2. method： `GET`
3. 鉴权参数，设置以下请求头：
    - `x-nohost-auth-key`: `test@imweb` (以实际 AuthKey 为准)
    - `x-nohost-account-name`: `test` (填入要添加环境的账号，如果环境名称包含非 ascii 字符，记得先 `encodeURIComponent(envName)`)

### 添加环境
1. url: `http://imwebtest.test.com:8080/open-api/add-env`
   > 添加到顶部：`http://imwebtest.test.com:8080/open-api/add-top-env`
2. method： `post`
3. 鉴权参数，设置以下请求头：
    - `x-nohost-auth-key`: `test@imweb` (以实际 AuthKey 为准)
    - `x-nohost-account-name`: `test` (填入要添加环境的账号，如果环境名称包含非 ascii 字符，记得先 `encodeURIComponent(envName)`)
4. 参数：
    - `name`: 环境名称，最好不要加空格
    - `value`: 环境内容

### 修改环境
1. url: `http://imwebtest.test.com:8080/open-api/modify-env`
2. method： `POST`
3. 鉴权参数，设置以下请求头：
    - `x-nohost-auth-key`: `test@imweb` (以实际 AuthKey 为准)
    - `x-nohost-account-name`: `test` (填入要添加环境的账号，如果环境名称包含非 ascii 字符，记得先 `encodeURIComponent(envName)`)
4. 参数：
    - `name`: 环境名称，最好不要加空格
    - `value`: 环境内容

### 修改环境名称
1. url: `http://imwebtest.test.com:8080/open-api/rename-env`
2. method： `POST`
3. 鉴权参数，设置以下请求头：
    - `x-nohost-auth-key`: `test@imweb` (以实际 AuthKey 为准)
    - `x-nohost-account-name`: `test` (填入要添加环境的账号，如果环境名称包含非 ascii 字符，记得先 `encodeURIComponent(envName)`)
4. 参数：
    - `name`: 当前环境名称
    - `newName`: 新的环境名称

### 删除环境
1. url: `http://imwebtest.test.com:8080/open-api/remove-env`
2. method： `POST`
3. 鉴权参数，设置以下请求头：
    - `x-nohost-auth-key`: `test@imweb` (以实际 AuthKey 为准)
    - `x-nohost-account-name`: `test` (填入要添加环境的账号，如果环境名称包含非 ascii 字符，记得先 `encodeURIComponent(envName)`)
4. 参数：
    - `name`: 环境名称

