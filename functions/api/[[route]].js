/**
 * LuvChippy Admin API — Cloudflare Pages Function
 *
 * Routes:
 *   POST /api/login    — username/password auth → JWT
 *   POST /api/articles  — authenticated GitHub API article CRUD
 *
 * Environment variables (set in CF Dashboard):
 *   GITHUB_TOKEN       — GitHub PAT with repo scope
 *   JWT_SECRET         — signing secret for JWT tokens
 *   GITHUB_OWNER       — repo owner (default: "luvchippy")
 *   GITHUB_REPO        — repo name (default: "article")
 *   GITHUB_BRANCH      — target branch (default: "main")
 */

const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "923577276";

// ── Crypto helpers ────────────────────────────────────────

function base64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(str) {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  return Uint8Array.from(atob(str), (c) => c.charCodeAt(0));
}

async function hmacSign(data, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(data));
  return base64url(sig);
}

async function createToken(payload, secret) {
  const header = base64url(new TextEncoder().encode(JSON.stringify({ alg: "HS256", typ: "JWT" })));
  const body = base64url(
    new TextEncoder().encode(
      JSON.stringify({ ...payload, iat: Math.floor(Date.now() / 1000) })
    )
  );
  const signature = await hmacSign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

async function verifyToken(token, secret) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const expectedSig = await hmacSign(`${parts[0]}.${parts[1]}`, secret);
    if (expectedSig !== parts[2]) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(base64urlDecode(parts[1]))
    );
    // Check expiry (24h)
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

// ── CORS ──────────────────────────────────────────────────

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "https://article.923577.xyz",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

// ── POST /api/login ───────────────────────────────────────

async function handleLogin(request, env) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { username, password } = body;
  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    return jsonResponse({ error: "用户名或密码错误" }, 401);
  }

  const secret = env.JWT_SECRET || "luvchippy-secret-key-change-me";
  const token = await createToken(
    { username, exp: Math.floor(Date.now() / 1000) + 86400 },
    secret
  );

  return jsonResponse({ token, username });
}

// ── POST /api/articles ────────────────────────────────────

async function handleArticles(request, env) {
  // Auth check
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "未授权，请先登录" }, 401);
  }
  const token = authHeader.slice(7);
  const secret = env.JWT_SECRET || "luvchippy-secret-key-change-me";
  const payload = await verifyToken(token, secret);
  if (!payload) {
    return jsonResponse({ error: "登录已过期，请重新登录" }, 401);
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400);
  }

  const { title, content, slug, tags, date, description } = body;
  if (!slug || !content) {
    return jsonResponse({ error: "缺少必填字段: slug, content" }, 400);
  }

  // Build frontmatter + Markdown
  const tagList = tags && tags.length ? `\ntags: [${tags.map((t) => `"${t}"`).join(", ")}]` : "";
  const dateLine = date ? `\ndate: ${date}` : "";
  const descLine = description ? `\ndescription: "${description}"` : "";
  const titleLine = title ? `title: "${title}"` : `title: "${slug}"`;

  const frontmatter = `---
${titleLine}${dateLine}${descLine}
outline: deep${tagList}
---

`;
  const fileContent = frontmatter + content;
  const filePath = `docs/articles/${slug}.md`;

  // GitHub API
  const ghToken = env.GITHUB_TOKEN;
  if (!ghToken) {
    return jsonResponse({ error: "服务器未配置 GITHUB_TOKEN" }, 500);
  }
  const owner = env.GITHUB_OWNER || "luvchippy";
  const repo = env.GITHUB_REPO || "article";
  const branch = env.GITHUB_BRANCH || "main";

  const ghUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const ghHeaders = {
    Authorization: `token ${ghToken}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "luvchippy-article-cms",
  };

  try {
    // Check if file exists to get SHA for update
    const existingResp = await fetch(`${ghUrl}?ref=${branch}`, { headers: ghHeaders });
    let sha = null;
    if (existingResp.ok) {
      const existing = await existingResp.json();
      sha = existing.sha;
    }

    const commitMessage = sha
      ? `Update: ${slug}`
      : `Create: ${slug}`;

    const reqBody = {
      message: commitMessage,
      content: btoa(unescape(encodeURIComponent(fileContent))),
      branch,
    };
    if (sha) reqBody.sha = sha;

    const resp = await fetch(ghUrl, {
      method: "PUT",
      headers: ghHeaders,
      body: JSON.stringify(reqBody),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return jsonResponse(
        { error: `GitHub API 错误: ${err.message || resp.statusText}` },
        resp.status
      );
    }

    const result = await resp.json();
    return jsonResponse({
      success: true,
      path: filePath,
      url: result.content?.html_url || "",
      action: sha ? "updated" : "created",
    });
  } catch (err) {
    return jsonResponse({ error: `请求失败: ${err.message}` }, 500);
  }
}

// ── Main handler ──────────────────────────────────────────

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  // CORS preflight
  if (method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Route: POST /api/login
  if (url.pathname.endsWith("/api/login") && method === "POST") {
    return handleLogin(request, env);
  }

  // Route: POST /api/articles
  if (url.pathname.endsWith("/api/articles") && method === "POST") {
    return handleArticles(request, env);
  }

  // Route: DELETE /api/articles
  if (url.pathname.endsWith("/api/articles") && method === "DELETE") {
    return handleDeleteArticle(request, env);
  }

  return jsonResponse({ error: "Not Found" }, 404);
}

// ── DELETE /api/articles ────────────────────────────────────

async function handleDeleteArticle(request, env) {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return jsonResponse({ error: "未授权" }, 401);
  }
  const token = authHeader.slice(7);
  const secret = env.JWT_SECRET || "luvchippy-secret-key-change-me";
  const payload = await verifyToken(token, secret);
  if (!payload) {
    return jsonResponse({ error: "登录已过期" }, 401);
  }

  let body;
  try { body = await request.json(); } catch { return jsonResponse({ error: "Invalid JSON" }, 400); }

  const { slug } = body;
  if (!slug) return jsonResponse({ error: "缺少 slug" }, 400);

  const ghToken = env.GITHUB_TOKEN;
  if (!ghToken) return jsonResponse({ error: "未配置 GITHUB_TOKEN" }, 500);
  const owner = env.GITHUB_OWNER || "luvchippy";
  const repo = env.GITHUB_REPO || "article";
  const branch = env.GITHUB_BRANCH || "main";

  const filePath = `docs/articles/${slug}.md`;
  const ghUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;
  const ghHeaders = {
    Authorization: `token ${ghToken}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "luvchippy-article-cms",
  };

  try {
    const existingResp = await fetch(`${ghUrl}?ref=${branch}`, { headers: ghHeaders });
    if (!existingResp.ok) {
      return jsonResponse({ error: "文章不存在" }, 404);
    }
    const existing = await existingResp.json();

    const resp = await fetch(ghUrl, {
      method: "DELETE",
      headers: ghHeaders,
      body: JSON.stringify({
        message: `Delete: ${slug}`,
        sha: existing.sha,
        branch,
      }),
    });

    if (!resp.ok) {
      const err = await resp.json().catch(() => ({}));
      return jsonResponse({ error: `删除失败: ${err.message || resp.statusText}` }, resp.status);
    }

    return jsonResponse({ success: true, action: "deleted" });
  } catch (err) {
    return jsonResponse({ error: `请求失败: ${err.message}` }, 500);
  }
}
