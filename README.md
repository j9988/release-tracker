# RELEASE TRACKER

一个用于追踪音乐发行、歌手、Feat、标签、日历与年度总结的静态 Web App。

## Visitor / Editor 模式

- **Visitor（访客）**：打开 GitHub Pages 链接即可查看，不需要登录；所有页面均为 read-only。
- **Editor（编辑者）**：点击 `EDITOR LOGIN`，使用 Supabase Auth 的编辑账号登录后，才能新增、编辑、删除 Release / Artist / Label，并使用 Settings 导入导出。
- 编辑者的数据继续保存在 `app_data`，同时会自动镜像到 `public_data`，让访客可以读取最新公开档案。
- 访客只对 `public_data` 有读取权限，不能写入。

## Supabase 一次性设置

运行仓库里的 `supabase_public_data.sql`。

然后在 Supabase Auth 设置中**关闭公开注册（Disable sign ups）**，只保留你的编辑账号。这样任何拿到公开链接的人都不会因为注册而获得编辑权限。

现有 `app_data` 的 RLS 策略保持不变。新的 `public_data` 表只允许匿名/登录用户读取；只有 `owner_id` 对应的编辑账号可以创建或更新。

第一次用编辑账号登录并保存数据后，会自动生成 `public_data` 的 `public` 记录。之后访客打开链接即可看到你的公开数据。

## 本地运行

```bash
npm install
npm run dev
```

## 构建

```bash
npm run build
```

## GitHub Pages

项目使用 Vite + GitHub Actions。`vite.config.js` 已设置 `base: './'`，适合 GitHub Pages 的 project site。

部署完成后：
1. 访客直接打开 Pages 链接 → Visitor / read-only。
2. 点击 `EDITOR LOGIN` → 输入编辑账号 → Editor。
3. 编辑并保存 → 自动同步到 Supabase + public_data。
4. 访客刷新页面 → 看到最新内容。
