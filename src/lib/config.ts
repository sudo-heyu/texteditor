// DeepSeek API Configuration
// 从环境变量读取API密钥，安全且可配置
// 获取密钥：https://platform.deepseek.com/

// 注意：在生产环境中，必须设置DEEPSEEK_API_KEY环境变量
export const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || '';

// 验证API密钥是否已配置（开发环境警告）
if (typeof window === 'undefined' && !DEEPSEEK_API_KEY) {
  console.warn(
    '警告: DEEPSEEK_API_KEY 未配置。请设置环境变量 DEEPSEEK_API_KEY。\n' +
    '本地开发：创建 .env.local 文件并添加 DEEPSEEK_API_KEY=your_key_here\n' +
    '生产环境：在部署平台设置环境变量'
  );
}