---
title: "开发日志：我的全栈网站矩阵搭建实录"
date: 2026-07-06
outline: deep
tags: ["开发日志", "全栈", "Cloudflare Pages", "VitePress", "Glassmorphism"]
---

# 开发日志：我的全栈网站矩阵搭建实录

从零开始搭建一个网站不难，但要在一个月内同时维护五个独立站点、统一设计语言、全自动部署——这背后是一整套工程化的开发流程。这篇文章记录我从第一行 HTML 到最终上线的心路历程。

> "网站不是做出来的，是迭代出来的。每一行 CSS 都是与浏览器的一次对话。"

---

## 1. 项目总览：五个站点，一个矩阵

| 站点 | 域名 | 定位 | 状态 |
|------|------|------|------|
| 个人主页 | [923577.xyz](https://923577.xyz) | 个人品牌与内容聚合 | 运行中 |
| 博客 | [article.923577.xyz](https://article.923577.xyz) | 技术写作与知识库 | 运行中 |
| 游戏 | [game.923577.xyz](https://game.923577.xyz) | 休闲游戏门户 | 运行中 |
| 工具 | [tool.923577.xyz](https://tool.923577.xyz) | 开发者工具箱 | 运行中 |
| 图床 | [pic.923577.xyz](https://pic.923577.xyz) | 图片托管 | 筹备中 |

所有站点均部署在 **Cloudflare Pages** 上，Git Push 自动触发构建部署。这意味着我只需要把代码推到 GitHub，云端的流水线就会在 30 秒内完成构建和分发——零运维成本的现代化工作流。

设计哲学上，所有站点统一使用**深色主题**，配色以 `#08080c ~ #0a0a10` 为基底，辅以半透明毛玻璃面板和低饱和度蓝色点缀，在暗色系下保持视觉层次感。

---

## 2. 个人主页（923577.xyz）—— 品牌的起点

这是整个矩阵的入口，也是打磨最久的页面。

### 技术选型

- **纯原生 HTML / CSS / JavaScript**，零框架依赖
- Google Fonts（Inter 字族，极细字重 200~400）
- FontAwesome 图标库
- 自定义 Preloader 加载动画

### 视觉设计

整个页面采用 **Glassmorphism（毛玻璃质感）** 作为核心设计语言。每一块内容面板都是 `rgba(255,255,255,0.02)` 的半透明卡片，搭配 `backdrop-filter: blur()` 实现真正的玻璃质感。

背景采用双层图片轮换机制，两张高分辨率壁纸在 `opacity` 之间淡入淡出，配合一层深色 overlay 压暗，让内容文字在任何背景下都能保持清晰可读。

### 七面板滚动结构

页面被划分为七个垂直滚动的 Glass Panel：

1. **About Me** —— 个人简介与欢迎语
2. **Articles** —— 动态加载的最新文章列表，链接到博客站
3. **Projects** —— 项目展示卡片（来自 `projects_data.js`）
4. **Gallery** —— 图片画廊，支持文件夹浏览
5. **Music** —— 音乐模块（预留 API 接入位）
6. **Games** —— 游戏快捷入口
7. **Bottom** —— 底部 Footer 信息

每个面板通过 `active-section` 类标记当前可见区块，配合滚动监听实现平滑切换。

### 数据驱动

文章和项目数据分别存储在 `articles_data.js` 和 `projects_data.js` 中，通过简单的 JS 对象数组维护。音乐列表由 `scan_music.js` 扫描 `music/` 目录自动生成。这保证了内容更新时不需要修改 HTML 结构。

---

## 3. 博客（article.923577.xyz）—— 写作的主战场

### 为什么选 VitePress？

我需要一个：轻量、支持 Markdown、自带搜索、可自定义主题的静态站点生成器。

VitePress 完美满足这些需求：
- 基于 Vite，开发服务器毫秒级热更新
- 内置本地搜索（零外部依赖，飞书级体验）
- Vue 3 驱动的主题系统，完全可定制

### 定制主题

在 `docs/.vitepress/theme/style.css` 中，我覆盖了 VitePress 的默认 CSS 变量：

```css
:root {
  --vp-c-bg: #0d1117;
  --vp-c-bg-alt: #161b22;
}

body {
  background: radial-gradient(
    circle at 15% 50%, rgba(100,108,255,0.08), transparent 25%
  ),
  radial-gradient(
    circle at 85% 30%, rgba(116,123,255,0.08), transparent 25%
  ),
  var(--vp-c-bg);
}
```

整体风格与个人主页的深色玻璃主题保持一致，形成品牌统一性。

### 文章管理：Decap CMS + GitHub OAuth

后台管理采用 **Decap CMS**（原 Netlify CMS），通过 GitHub OAuth 认证后直接在浏览器中编写和发布 Markdown 文章。

核心配置在 `docs/public/admin/config.yml` 中定义：
- `backend.name: github` —— 直接操作 GitHub 仓库
- `collections.articles.folder: docs/articles` —— Markdown 文件存储路径
- 支持标题、日期、摘要、标签、正文等字段

OAuth 流程由两个 Cloudflare Functions 实现：
- `functions/auth.js` —— 重定向到 GitHub 授权页
- `functions/callback.js` —— 接收回调，提取 access_token 并通过 `postMessage` 回传给 Decap CMS

### 构建与部署

```bash
# 本地开发
npm run docs:dev

# 构建
npm run docs:build

# Cloudflare Pages 自动部署
# 触发条件：git push → GitHub main 分支
# CF 执行：bash build.sh → npm install → vitepress build → 复制到 dist/
```

---

## 4. 游戏门户（game.923577.xyz）—— 轻松一刻

游戏站是我在疲惫的调试中快速搭建的一个休闲入口。

目前是一个简洁的卡片式布局，展示四个游戏入口：
- **2048** —— 经典数字合并
- **Snake** —— 贪吃蛇
- **Guess Number** —— 数字猜谜（0-100）
- **Poki Games** —— 外部小游戏大全

所有游戏采用相同的 Glass Card 样式，hover 时边框亮起微弱的蓝紫色光晕，卡片微微上浮。

后续计划将三款内置游戏用纯 JS 实现，替代目前的占位状态。Poki.com 作为外部链接持续保留，为来访者提供更多选择。

---

## 5. 开发者工具箱（tool.923577.xyz）—— 生产力的延伸

这是一个纯前端工具集，单 HTML 文件包含所有功能和样式。

### 八个工具一览

| 工具 | 功能 |
|------|------|
| Base64 | 编码 / 解码 |
| URL | URL 编码 / 解码 |
| JSON | 格式化 / 压缩 |
| Hash | MD5 / SHA256 等哈希计算 |
| Timestamp | 时间戳与日期互转 |
| Unicode | Unicode 编解码 |
| QR | 二维码生成（Cloudflare CDN 加载 qrcodejs） |
| Regex | 正则表达式实时测试 |

每个工具都是独立的 Tab 页，切换时无页面刷新。所有计算在浏览器本地完成，不发送任何数据到服务器。

唯一的外部依赖是 `qrcodejs`，通过 Cloudflare CDN 加载，稳定可靠。

---

## 6. 图片托管（pic.923577.xyz）—— 下一站

目前是一个 Coming Soon 页面，但架构设计已经清晰：

- **后端存储**：Cloudflare R2 对象存储（S3 兼容 API，零出站费用）
- **前端上传**：拖拽上传 + 剪贴板粘贴
- **访问控制**：支持公开链接和带过期时间的临时链接

选择 R2 的核心原因：与 Cloudflare Pages 生态天然集成，带宽费用为零，且文件存储在边缘节点，全球访问低延迟。

---

## 7. 工程化与自动化

### 统一的设计语言

五个站点虽然独立部署，但在视觉上保持高度统一：

- **色彩体系**：`#08080c`（最深底色）→ `rgba(255,255,255,0.02)`（面板）→ `#6b7db3`（强调色）
- **字体系统**：Inter（正文）+ JetBrains Mono（代码）
- **圆角标准**：6px（小）→ 10px（中）→ 14px（大）
- **动效规范**：`cubic-bezier(0.4, 0, 0.2, 1)`，200ms 过渡

### Git Push → 自动部署

每个站点都是独立的 GitHub 仓库，各自连接 Cloudflare Pages：

```
git push origin main
  → Cloudflare Pages 检测到更新
    → 执行构建命令
      → 输出到 dist/
        → 自动分发至全球 CDN
```

整个过程无需任何人工干预。每次发布从 `git push` 到全球可访问，通常在 15~30 秒内完成。

### 环境变量与密钥管理

所有敏感信息（GitHub Client ID / Secret、API 密钥等）通过 Cloudflare Dashboard 的环境变量面板注入，不写入源码。本地开发时通过 `wrangler.toml` 的注释提醒需要配置的变量。

---

## 8. 写在最后

搭建这个网站矩阵的过程，本身就是一次「Vibe Coding」的实践——我不再纠结每一个像素的精确位置，而是通过直觉和品味驱动设计决策，让 AI 辅助完成重复性工作，自己专注于架构、品牌一致性、以及用户体验的连贯性。

从一个简单的 HTML 文件开始，到五个域名的完整矩阵，技术栈从原生 JS 到 VitePress，从手动部署到 Git Push 全自动——这不仅是代码量的增长，更是工程思维的迭代升级。

下一个阶段，我会把更多精力投入内容创作和图床服务上。如果你对我的设计风格或技术选型有共鸣，欢迎通过主页的联系方式交流。

---

*发布于 2026-07-06 · 标签：开发日志、全栈、Cloudflare Pages、VitePress*
