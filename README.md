# 🎧 Release Tracker

一个用来追踪歌手发行动态、并自动生成年度/自定义区间总结的静态 Web App。上传歌手、发行日期、发行类型（专辑 / 单曲 / EP / OST / Feat / Collaboration…）、自定义标签，即可在网页上直接看到月度发行量、歌手排行、日历视图，并一键导出总结图（PNG）。

数据存储在 [Supabase](https://supabase.com/)，前端用 [Vite](https://vitejs.dev/) + React 构建，通过 GitHub Actions 自动部署到 GitHub Pages。

---

## ✨ 功能

- **Dashboard 总览**：按年份查看发行量、月度发行趋势、发行类型占比、歌手活跃排行，支持按歌手 / 标签 / 厂牌筛选。
- **Releases 数据库**：新增 / 编辑 / 删除发行记录，支持搜索标题、歌手、feat 歌手。
- **Artists / Labels**：维护歌手与厂牌目录，重命名会自动同步更新所有关联的发行记录。
- **Calendar 日历**：按月查看每一天的发行情况，点击日期查看当天所有发行详情。
- **Summary 总结生成器**：
  - 自定义开始/结束日期、发行类型筛选
  - 月度发行柱状图、歌手排行榜、按类型分组的完整列表
  - 一键导出为 PNG 图片
- **智能署名归属规则**：
  - `Feat` 类型的发行只会计入 **Featured / Co-artists** 的统计，不会计入 Primary Artist 自己的名下（因为 Primary Artist 只是"别人发的歌，我们的歌手去 feat"，不算这位 Primary Artist 自己的作品）
  - `Collaboration` 等其他类型仍正常把 Primary Artist 计入统计
  - 署名展示格式统一为 `Primary x Co-artist1, Co-artist2 feat. Featured1, Featured2`
- **Featured / Co-artists 多选输入**：不用再手打逗号分隔的文本，直接从歌手目录里搜索勾选，也可以直接输入未收录的名字临时添加。
- **Visitor / Editor 双模式**：
  - **Visitor（访客）**：打开链接即可查看，无需登录，全部只读
  - **Editor（编辑者）**：登录 Supabase Auth 账号后才能新增/编辑/删除数据，编辑后自动同步到公开只读数据源，访客刷新即可看到最新内容
- **本地缓存 + 云端同步**：数据实时缓存在 `localStorage`，离线也能查看/编辑，联网后自动同步到 Supabase
- **JSON 导入导出**：可作为额外备份或迁移数据

---

## 🛠 技术栈

| 部分 | 技术 |
|---|---|
| 前端 | React + Vite |
| 数据存储 | Supabase（Postgres + Auth + RLS） |
| 部署 | GitHub Actions → GitHub Pages |

---

## 📁 项目结构

```
├── src/
│   ├── main.jsx           # 所有页面 / 组件逻辑
│   ├── supabaseClient.js  # Supabase 连接配置
│   └── styles.css         # 全局样式
├── supabase_public_data.sql  # Supabase 公开只读表 + RLS 策略（首次部署需运行一次）
├── .github/workflows/deploy.yml  # GitHub Pages 自动部署
├── vite.config.js
└── package.json
```

---

## 🚀 快速开始

### 1. 克隆并安装依赖

```bash
git clone <你的仓库地址>
cd release-tracker
npm install
```

### 2. 配置 Supabase

打开 `src/supabaseClient.js`，把 `SUPABASE_URL` 和 `SUPABASE_PUBLISHABLE_KEY` 换成你自己 Supabase 项目的值（在 Supabase 项目设置 → API 里可以找到）：

```js
const SUPABASE_URL = 'https://xxxxxxxx.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xxxxxxxxxxxxxxxx';
```

> 这两个值本身是公开的（前端代码里本来就会暴露），真正的权限控制靠 Supabase 的 Row Level Security 策略，见下一步。

### 3. 初始化数据库

在 Supabase 项目的 **SQL Editor** 里运行仓库根目录的 [`supabase_public_data.sql`](./supabase_public_data.sql)，创建公开只读数据表 `public_data` 及其 RLS 策略。

然后在 **Authentication → Settings** 里**关闭公开注册（Disable sign ups）**，只保留你自己的编辑账号，避免陌生人注册后获得编辑权限。

### 4. 本地运行

```bash
npm run dev
```

### 5. 构建

```bash
npm run build
```

---

## ☁️ 部署到 GitHub Pages

仓库已内置 `.github/workflows/deploy.yml`，`vite.config.js` 也已设置 `base: './'`，适配 GitHub Pages 的 project site。

1. 在仓库 **Settings → Pages** 里，Source 选择 **GitHub Actions**。
2. `push` 到 `main` 分支即可自动触发构建与部署（也可以在 Actions 页手动 `workflow_dispatch`）。
3. 部署完成后：
   - 访客直接打开 Pages 链接 → 访客模式，只读
   - 点击右上角 `EDITOR LOGIN` → 输入你的 Supabase 编辑账号 → 进入编辑模式
   - 编辑并保存 → 自动同步到 Supabase（`app_data` + `public_data`）
   - 访客刷新页面 → 看到最新内容

---

## 🗂 数据模型说明

每条 Release 记录包含：

| 字段 | 说明 |
|---|---|
| `date` | 发行日期 |
| `title` | 歌曲 / 项目标题 |
| `primaryArtist` | 主要发行歌手（这首歌"归属"于谁） |
| `type` | 发行类型（Album / Single / EP / OST / Feat / Collaboration / 自定义…） |
| `featuredArtists` | 被 feat 的歌手（客串，不算主人作品） |
| `coArtists` | 共同创作 / 合作歌手（算共同作品） |
| `album` | 所属专辑 / EP 名称（可选） |
| `label` | 所属厂牌 |
| `tags` | 自定义标签 |

**归属统计规则**：`type === 'Feat'` 的记录只计入 `featuredArtists` + `coArtists`，不计入 `primaryArtist`；其余所有类型 `primaryArtist` 正常计入统计。

---

## 📦 数据备份

在 Settings 页面可以随时导出 / 导入 JSON，建议定期导出作为额外备份。

---

## 📄 License

MIT
