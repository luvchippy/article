import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "LuvChippy",
  description: "个人知识库",
  base: '/',

  
  // 极简主题配置
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章列表', link: '/articles/vibecoding' },
      { text: '返回个人主页', link: 'https://923577.xyz' }
    ],

    sidebar: [
      {
        text: '✍️ 我的文章',
        items: [
          { text: '开发日志：全栈网站矩阵搭建实录', link: '/articles/dev-log' },
          { text: 'Vibe Coding：与 AI 共舞', link: '/articles/vibecoding' },
          { text: 'Hello World', link: '/articles/hello-world' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/luvchippy' }
    ],

    search: {
      provider: 'local' // 自带本地搜索，飞书级体验
    }
  }
})
