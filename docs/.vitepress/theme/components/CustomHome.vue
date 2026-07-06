<template>
  <div class="custom-home">
    <!-- Theme toggle -->
    <button class="theme-toggle" @click="toggleTheme" :title="isDark ? '切换浅色' : '切换深色'">
      {{ isDark ? '☀️' : '🌙' }}
    </button>

    <!-- Left: 3/4 hero container -->
    <div class="home-left">
      <div class="hero-box">
        <h1 class="hero-name">luv<span class="hero-c">c</span>hippy</h1>
        <p class="hero-line">徜徉字节的海洋，感受代码的风浪。</p>
        <p class="hero-sub">记录技术、思考与生活。</p>
        <div class="hero-btns">
          <a href="/articles/dev-log" class="btn-primary">阅读文章</a>
          <a href="/admin/" class="btn-alt">进入后台</a>
        </div>
      </div>
    </div>
    <!-- Right: 1/4 recent articles -->
    <div class="home-right">
      <div class="recent-box">
        <h3 class="recent-title">最近发表</h3>
        <ul class="recent-list">
          <li><a href="/articles/dev-log">全站开发日志：5 个子域名的 Cloudflare Pages 部署实践</a></li>
          <li><a href="/articles/vibecoding">什么是 Vibe Coding？与 AI 共舞的编程新纪元</a></li>
          <li><a href="/articles/hello-world">Hello World</a></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const isDark = ref(true)

function toggleTheme() {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('vitepress-theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const stored = localStorage.getItem('vitepress-theme')
  if (stored === 'light') {
    isDark.value = false
    document.documentElement.classList.remove('dark')
  } else if (!stored) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    document.documentElement.classList.toggle('dark', prefersDark)
  }
})
</script>

<style scoped>
.custom-home {
  display: flex;
  min-height: calc(100vh - 64px);
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  position: relative;
}

.theme-toggle {
  position: absolute;
  top: 16px;
  right: 24px;
  background: none;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 6px 10px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all .25s;
  z-index: 10;
  line-height: 1;
}
.theme-toggle:hover {
  border-color: var(--vp-c-brand-1);
  background: var(--vp-c-bg-alt);
}

/* ── Left: 3/4 ── */
.home-left {
  flex: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
}

.hero-box {
  width: 100%;
  max-width: 640px;
  padding: 56px 48px;
  border-radius: 16px;
  background: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-divider);
}

.hero-name {
  font-size: 3rem;
  font-weight: 200;
  letter-spacing: 0.04em;
  margin-bottom: 20px;
  line-height: 1.3;
  padding-bottom: 8px;
  background: linear-gradient(135deg, var(--vp-c-brand-1), var(--vp-c-brand-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-c {
  font-weight: 200;
}

.hero-line {
  font-size: 1.3rem;
  font-weight: 300;
  color: var(--vp-c-text-1);
  margin-bottom: 8px;
  line-height: 1.6;
}

.hero-sub {
  font-size: 0.95rem;
  font-weight: 300;
  color: var(--vp-c-text-2);
  margin-bottom: 32px;
}

.hero-btns {
  display: flex;
  gap: 12px;
}

.btn-primary, .btn-alt {
  display: inline-block;
  padding: 10px 28px;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 400;
  text-decoration: none;
  transition: all 0.25s;
}

.btn-primary {
  background: var(--vp-c-brand-1);
  color: #fff;
  border: 1px solid var(--vp-c-brand-1);
}
.btn-primary:hover {
  background: var(--vp-c-brand-2);
  border-color: var(--vp-c-brand-2);
}

.btn-alt {
  background: transparent;
  color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider);
}
.btn-alt:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}

/* ── Right: 1/4 ── */
.home-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 10px;
}

.recent-box {
  width: 100%;
  padding: 28px 20px;
  border-left: 1px solid var(--vp-c-divider);
}

.recent-title {
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
  margin-bottom: 18px;
}

.recent-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.recent-list li {
  margin-bottom: 12px;
}

.recent-list a {
  font-size: 0.85rem;
  font-weight: 300;
  color: var(--vp-c-text-2);
  text-decoration: none;
  line-height: 1.5;
  transition: color 0.2s;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recent-list a:hover {
  color: var(--vp-c-brand-1);
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .custom-home {
    flex-direction: column;
  }
  .home-left, .home-right {
    flex: none;
  }
  .hero-box {
    padding: 36px 24px;
  }
  .hero-name {
    font-size: 2.2rem;
  }
  .hero-line {
    font-size: 1.1rem;
  }
  .home-right {
    padding: 0 20px 40px;
  }
  .recent-box {
    border-left: none;
    border-top: 1px solid var(--vp-c-divider);
    padding: 24px 0 0;
  }
}
</style>
