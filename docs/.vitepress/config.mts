import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "LuvChippy",
  description: "个人知识库",
  base: '/',

  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章列表', link: '/articles/vibecoding' },
      { text: '返回个人主页', link: 'https://923577.xyz' },
      { text: '🔧 后台', link: 'https://article.923577.xyz/admin/', title: '管理后台' }
    ],

    sidebar: [
      {
        text: '✍️ 我的文章',
        items: [
          { text: '开发日志：全栈网站矩阵搭建实录', link: '/articles/dev-log' },
          { text: 'Vibe Coding：与 AI 共舞', link: '/articles/vibecoding' },
          { text: 'Hello World', link: '/articles/hello-world' }
        ]
      },
      {
        text: '🔧 管理',
        collapsed: true,
        items: [
          { text: '进入后台 (admin)', link: 'https://article.923577.xyz/admin/' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/luvchippy' }
    ],

    search: {
      provider: 'local'
    },

    // 404 page routing fix — don't let VitePress SPA intercept admin
    ignoreDeadLinks: true
  }
})