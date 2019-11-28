module.exports = {
  title: 'Nohost',
  description: 'Multi-user & multi-env web debugging proxy based on whistle',
  base: '/nohost/',
  port: 8081,
  head: [
    ['link', { rel: 'shortcut icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    logo: '/logo.png',
    repo: 'https://github.com/nohosts/nohost.git',
    repoLabel: 'GitHub',
    displayAllHeaders: true,
    sidebarDepth: 1,
    sidebar: [
      {
        title: '概述',
        path: '/',
      },
      {
        title: '快速上手',
        path: '/zh/quickstart',
      },
      {
        title: '管理员',
        path: '/zh/admin/',
        collapsable: false,
        children: [
          {
            title: '账号',
            path: '/zh/admin/accounts',
          },
          {
            title: '证书',
            path: '/zh/admin/certs',
          },
          {
            title: '配置',
            path: '/zh/admin/config',
          },
          {
            title: 'Whistle',
            path: '/zh/admin/whistle',
          },
          {
            title: '系统',
            path: '/zh/admin/system',
          },
        ],
      },
      {
        title: '普通开发',
        path: '/zh/developer/',
        collapsable: false,
        children: [
          {
            title: '如何使用',
            path: '/zh/developer/usage',
          },
          {
            title: '抓包调试',
            path: '/zh/developer/capture',
          },
          {
            title: '插件开发',
            path: '/zh/developer/plugin',
          },
        ],
      },
      {
        title: '普通用户',
        path: '/zh/users/',
        collapsable: false,
        children: [
          {
            title: '产品经理',
            path: '/zh/users/pd',
          },
          {
            title: '测试同事',
            path: '/zh/users/tester',
          },
          {
            title: '外网用户',
            path: '/zh/users/others',
          },
        ],
      },
      {
        title: 'API',
        path: '/zh/api',
        collapsable: false,
      },
      {
        title: '高级应用',
        path: '/zh/advance/',
        collapsable: false,
      },
    ],
  },
}
