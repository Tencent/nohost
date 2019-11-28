# 概述
nohost 是基于 [whistle](https://github.com/avwo/whistle) 实现的多用户多环境配置及抓包调试系统，不仅具备 whistle 的所有功能，并在 whistle 基础上扩展了一些功能，且支持多人多环境同时使用，主要用于部署在公共服务器上供整个部门（公司）的同事共同使用，具有以下功能：
1. 环境共享：前端无需配后台环境，后台无需配前端环境，其他人无需配任何环境
2. 抓包调试：远程实时抓包调试，支持各种 whistle 规则，以及通过链接分享抓包数据
3. 历史记录：可以把环境配置及抓包数据沉淀下来，供后续随时切换查看
4. 插件扩展：可以通过插件扩展实现诸如 [inspect](https://github.com/whistle-plugins/whistle.inspect)，[vase](https://github.com/whistle-plugins/whistle.vase)，[autosave](https://github.com/whistle-plugins/whistle.autosave) 等功能
5. 对外接口：提供对外接口，可供发布系统、CI等工具操作，实现自动化增删查改环境配置

![效果图](https://user-images.githubusercontent.com/11450939/40436253-28a90f28-5ee5-11e8-97a5-fd598e32e0df.gif)