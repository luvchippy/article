import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "LuvChippy",
  description: "个人知识库",
  
  // 极简主题配置
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '文章列表', link: '/articles/hello-world' },
      { text: '返回个人主页', link: 'https://github.923577.xyz/selfhomepage/' }
    ],

    sidebar: [
      {
        text: '✍️ 我的文章',
        items: [
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
