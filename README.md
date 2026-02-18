This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## AI Configuration (DeepSeek)

This application includes AI capabilities powered by DeepSeek. To enable AI features, you need to configure a DeepSeek API key.

### Local Development
1. Create a `.env.local` file in the project root
2. Add your DeepSeek API key:
   ```
   DEEPSEEK_API_KEY=sk-your-api-key-here
   ```
3. Restart the development server

### Production Deployment
When deploying to production (Vercel, Netlify, etc.), you must set the `DEEPSEEK_API_KEY` environment variable in your deployment platform's settings.

#### Vercel
1. Go to your project in the Vercel dashboard
2. Navigate to Settings > Environment Variables
3. Add a new variable:
   - Name: `DEEPSEEK_API_KEY`
   - Value: `sk-your-api-key-here`
4. Redeploy your application

#### Netlify
See the [Deploy on Netlify](#deploy-on-netlify) section below for detailed instructions.

#### Other Platforms
Refer to your hosting provider's documentation for setting environment variables.

### Getting a DeepSeek API Key
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it to your environment

## Deploy on Netlify (Git Repository)

This project is configured for easy deployment on Netlify via Git repository. Follow these steps to deploy your text editor with AI capabilities:

### Prerequisites
- A [Netlify account](https://app.netlify.com/signup)
- A [DeepSeek API key](https://platform.deepseek.com/) (for AI features)
- A GitHub/GitLab/Bitbucket account with your code in a repository

### Step 1: Prepare Your Git Repository

1. **Commit your changes** (if not already committed):
   ```bash
   cd e:\Antigravity\texteditor
   git add .
   git commit -m "Deploy text editor with AI features"
   ```

2. **Push to remote repository**:
   - Create a new repository on GitHub/GitLab/Bitbucket
   - Link your local repository:
     ```bash
     git remote add origin https://github.com/your-username/your-repo-name.git
     git push -u origin main
     ```

### Step 2: Connect Repository to Netlify

1. **Log in to Netlify** and go to [app.netlify.com](https://app.netlify.com/)
2. **Click "Add new site" → "Import an existing project"**
3. **Connect to your Git provider** (GitHub, GitLab, or Bitbucket)
4. **Select your repository** from the list
5. **Configure build settings** (Netlify will auto-detect Next.js):
   - Build command: `npm run build`
   - Publish directory: `.next`
   - These are pre-configured in `netlify.toml`

### Step 3: Configure Environment Variables

**IMPORTANT**: This is required for AI functionality to work!

1. **Before deploying**, go to **Advanced build settings**:
   - Click "Show advanced" during site setup
   - Add environment variable:
     - **Key**: `DEEPSEEK_API_KEY`
     - **Value**: `sk-your-actual-api-key-here` (from DeepSeek platform)

2. **Or add after deployment**:
   - Go to **Site settings** → **Environment variables**
   - Click "Add variable":
     - **Key**: `DEEPSEEK_API_KEY`
     - **Value**: `sk-your-actual-api-key-here`
     - **Scope**: Production
   - Click "Save"

### Step 4: Deploy Your Site

1. **Click "Deploy site"**
2. **Wait for build to complete** (2-3 minutes)
3. **Netlify will automatically deploy** when you push changes to your repository

### Step 5: Verify Deployment

1. **Visit your site URL**: `https://your-site-name.netlify.app`
2. **Test AI functionality**:
   - Open AI panel (click "AI 助手" button)
   - Send a test message
   - Verify no error messages appear

### Continuous Deployment

Once configured, Netlify will automatically redeploy when you push to your repository:

```bash
# Make changes locally
git add .
git commit -m "Update feature"
git push origin main
# Netlify automatically builds and deploys
```

### Troubleshooting

#### Common Issues:

1. **Build failures**:
   - Check Netlify build logs for specific errors
   - Ensure `netlify.toml` is in your repository root
   - Verify Node.js version compatibility (configured for v20)

2. **AI not working after deployment**:
   - Verify `DEEPSEEK_API_KEY` environment variable is set correctly
   - Check that the variable scope is set to "Production"
   - Try "Clear cache and deploy site" after adding environment variables

3. **API routes not working**:
   - Next.js Edge Functions are configured in `netlify.toml`
   - API route `/api/chat` should work automatically
   - Test by sending a message in the AI panel

4. **Auto-deploy not working**:
   - Verify webhook is set up in Netlify
   - Check repository permissions in your Git provider
   - Manually trigger deploy if needed

### Post-Deployment
- Share the Netlify URL with users
- AI features will work for all users
- Monitor usage and costs on your DeepSeek dashboard
- Push updates to automatically redeploy

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
