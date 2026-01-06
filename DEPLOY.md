# 小离岛岛 · 小红书运营系统 - 部署指南

## 🚀 快速部署到 Vercel

### 第一步：推送代码到 GitHub

```bash
cd daodao-ops
git init
git add .
git commit -m "feat: initial commit with full system"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/daodao-ops.git
git push -u origin main
```

### 第二步：部署到 Vercel

1. 访问 [Vercel](https://vercel.com)
2. 使用 GitHub 账号登录
3. 点击 **"New Project"**
4. 选择 `daodao-ops` 仓库
5. 在 **Environment Variables** 中添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `ANTHROPIC_API_KEY` | `sk-ant-api03-...` | Claude API 密钥 |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase 匿名密钥 |

6. 点击 **"Deploy"**

---

## 🗄️ 配置 Supabase 数据库

### 第一步：创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com)
2. 注册/登录账号
3. 点击 **"New Project"**
4. 填写项目信息：
   - **Name**: `daodao-ops`
   - **Database Password**: 设置一个强密码
   - **Region**: 选择 `Singapore` 或 `Hong Kong`
5. 等待项目创建完成

### 第二步：执行数据库初始化脚本

1. 在 Supabase 左侧菜单找到 **"SQL Editor"**
2. 点击 **"New query"**
3. 复制 `supabase-schema.sql` 文件的内容
4. 粘贴到 SQL 编辑器
5. 点击 **"Run"** 执行

### 第三步：获取 API 密钥

1. 在 Supabase 左侧菜单点击 **"Settings"** > **"API"**
2. 复制以下信息：
   - **Project URL**: 类似 `https://xxx.supabase.co`
   - **anon public key**: 类似 `eyJhbGci...`
3. 将这些值添加到 Vercel 环境变量

---

## 🔑 环境变量说明

### 服务端变量（Vercel 后台设置）

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | ✅ | Claude API 密钥，用于 AI 功能 |

### 客户端变量（公开，会暴露给浏览器）

| 变量名 | 必需 | 说明 |
|--------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | ❌ | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ❌ | Supabase 匿名密钥 |

> ⚠️ 如果不配置 Supabase，系统会自动降级到 localStorage 存储

---

## 🧪 本地开发

### 安装依赖

```bash
npm install
```

### 配置环境变量

创建 `.env.local` 文件：

```env
ANTHROPIC_API_KEY=your_claude_api_key

# 可选：Supabase 配置
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

---

## 📁 项目结构

```
daodao-ops/
├── src/
│   ├── app/
│   │   ├── api/              # API 路由（服务端）
│   │   │   ├── chat/         # AI 对话
│   │   │   ├── analyze/      # 内容分析
│   │   │   ├── analyze-cat/  # 猫咪信息分析
│   │   │   └── topics/       # 话题推荐
│   │   ├── analytics/        # 数据分析页面
│   │   ├── assistant/        # AI 助手页面
│   │   ├── cats/             # 猫咪档案页面
│   │   ├── strategy/         # 战略规划页面
│   │   ├── topics/           # 话题推荐页面
│   │   └── page.tsx          # 首页
│   ├── components/           # UI 组件
│   ├── data/                 # 静态数据
│   └── lib/
│       ├── api.ts            # 前端 API 封装
│       ├── db.ts             # 数据库操作
│       ├── storage.ts        # localStorage 工具
│       └── supabase.ts       # Supabase 客户端
├── vercel.json               # Vercel 配置
├── supabase-schema.sql       # 数据库初始化脚本
└── package.json
```

---

## ✅ 部署检查清单

- [ ] 代码已推送到 GitHub
- [ ] Vercel 项目已创建
- [ ] `ANTHROPIC_API_KEY` 已添加到 Vercel 环境变量
- [ ] Supabase 项目已创建（可选）
- [ ] 数据库表已创建（可选）
- [ ] Supabase 密钥已添加到 Vercel（可选）
- [ ] 部署成功，网站可访问
- [ ] AI 对话功能正常
- [ ] 数据保存/读取正常

---

## 🆘 常见问题

### Q: AI 功能不工作？
A: 检查 Vercel 环境变量中 `ANTHROPIC_API_KEY` 是否正确配置

### Q: 数据没有持久化？
A: 如果没有配置 Supabase，数据会保存在浏览器 localStorage 中，清除浏览器数据会丢失

### Q: 部署失败？
A: 检查 `npm run build` 是否能在本地成功运行

### Q: 如何更新部署？
A: 推送代码到 GitHub，Vercel 会自动重新部署

---

## 📞 技术支持

如有问题，可以：
1. 检查 Vercel 部署日志
2. 查看浏览器控制台错误
3. 检查 API 路由响应

