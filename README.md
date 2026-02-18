这是一个使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 初始化的 [Next.js](https://nextjs.org) 项目。

## 开始使用

首先，运行开发服务器：

```bash
npm run dev
# 或
yarn dev
# 或
pnpm dev
# 或
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

你可以通过修改 `app/page.tsx` 来开始编辑页面。页面会在你编辑文件时自动更新。

该项目使用 [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) 自动优化和加载 [Geist](https://vercel.com/font)，这是 Vercel 的一种新字体家族。

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 的功能和 API。
- [学习 Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程。

你可以查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js) - 欢迎你的反馈和贡献！

## AI 配置 (DeepSeek)

此应用程序包含由 DeepSeek 提供支持的 AI 功能。要启用 AI 功能，你需要在代码中配置 DeepSeek API 密钥。

### 配置 API 密钥
AI 功能现在使用硬编码的 API 密钥，无需设置环境变量。要配置你的 API 密钥：

1. 编辑 `src/lib/config.ts` 文件
2. 将你的 DeepSeek API 密钥赋值给 `DEEPSEEK_API_KEY` 常量：
   ```typescript
   export const DEEPSEEK_API_KEY = 'sk-your-api-key-here';
   ```
3. 保存文件并重启开发服务器或重新构建应用程序

### 开发与生产环境
此配置适用于所有环境（开发、测试、生产）。API 密钥直接嵌入在代码中，无需在不同平台上单独配置环境变量。

### 获取 DeepSeek API 密钥
1. 访问 [DeepSeek 平台](https://platform.deepseek.com/)
2. 注册或登录
3. 导航到 API Keys 部分
4. 创建新的 API 密钥
5. 复制密钥并更新 `src/lib/config.ts` 文件

## 部署到 Netlify (Git 仓库)

此项目配置了通过 Git 仓库轻松部署到 Netlify 的功能。按照以下步骤部署你的带有 AI 功能的文本编辑器：

### 先决条件
- 一个 [Netlify 账户](https://app.netlify.com/signup)
- 一个 [DeepSeek API 密钥](https://platform.deepseek.com/)（用于 AI 功能）
- 一个 GitHub/GitLab/Bitbucket 账户，并将你的代码放入仓库中

### 步骤 1：准备你的 Git 仓库

1. **提交你的更改**（如果尚未提交）：
   ```bash
   cd e:\Antigravity\texteditor
   git add .
   git commit -m "部署文本编辑器与 AI 功能"
   ```

2. **推送到远程仓库**：
   - 在 GitHub/GitLab/Bitbucket 上创建新仓库
   - 连接你的本地仓库：
     ```bash
     git remote add origin https://github.com/your-username/your-repo-name.git
     git push -u origin main
     ```

### 步骤 2：将仓库连接到 Netlify

1. **登录 Netlify** 并访问 [app.netlify.com](https://app.netlify.com/)
2. **点击 "Add new site" → "Import an existing project"**
3. **连接到你的 Git 提供商**（GitHub、GitLab 或 Bitbucket）
4. **从列表中选择你的仓库**
5. **配置构建设置**（Netlify 会自动检测 Next.js）：
   - 构建命令：`npm run build`
   - 发布目录：`.next`
   - 这些已在 `netlify.toml` 中预配置


### 步骤 3：部署你的站点

1. **点击 "Deploy site"**
2. **等待构建完成**（2-3 分钟）
3. **Netlify 会自动部署**当你推送更改到仓库时

### 步骤 4：验证部署

1. **访问你的站点 URL**：`https://your-site-name.netlify.app`
2. **测试 AI 功能**：
   - 打开 AI 面板（点击 "AI 助手" 按钮）
   - 发送测试消息
   - 验证没有错误消息出现

### 持续部署

配置完成后，Netlify 会在你推送到仓库时自动重新部署：

```bash
# 在本地进行更改
git add .
git commit -m "更新功能"
git push origin main
# Netlify 自动构建和部署
```

### 故障排除

#### 常见问题：

1. **构建失败**：
   - 检查 Netlify 构建日志中的具体错误
   - 确保 `netlify.toml` 在你的仓库根目录中
   - 验证 Node.js 版本兼容性（已配置为 v20）

2. **部署后 AI 不工作**：
   - 验证 `src/lib/config.ts` 文件中的 `DEEPSEEK_API_KEY` 是否正确配置
   - 确保 API 密钥已更新为有效的 DeepSeek API 密钥
   - 重新构建和部署应用程序

3. **API 路由不工作**：
   - Next.js Edge Functions 已在 `netlify.toml` 中配置
   - API 路由 `/api/chat` 应该自动工作
   - 通过在 AI 面板中发送消息进行测试

4. **自动部署不工作**：
   - 验证 Netlify 中是否设置了 webhook
   - 检查 Git 提供商中的仓库权限
   - 如果需要，手动触发部署

### 部署后
- 与用户分享 Netlify URL
- AI 功能将对所有用户正常工作
- 在 DeepSeek 仪表板中监控使用量和费用
- 推送更新以自动重新部署

## 部署到 Vercel

部署 Next.js 应用程序最简单的方法是使用来自 Next.js 创建者的 [Vercel 平台](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme)。

查看我们的 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多详情。
