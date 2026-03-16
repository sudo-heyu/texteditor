import { type Editor } from '@tiptap/react';

/**
 * 统一提取<apply_edit>标签内容
 * 处理各种边界情况：标签属性、嵌套标签、跨行标签等
 */
export function extractApplyEditContent(content: string): string | null {
  // 单一正则表达式，处理各种边界情况
  // 模式解释：<apply_edit(可选属性)>内容</apply_edit>
  const pattern = /<apply_edit(?:\s[^>]*)?>([\s\S]*?)<\/apply_edit>/i;
  const match = content.match(pattern);

  if (match && match[1]) {
    let extracted = match[1].trim();

    // Clean up potential markdown code block wrappers
    extracted = extracted.replace(/^```(?:html)?\s*([\s\S]*?)\s*```$/i, '$1');

    // Remove any text before the first HTML tag if it looks like conversational filler
    const firstTagIndex = extracted.indexOf('<');
    if (firstTagIndex > 0 && firstTagIndex < 50) {
      extracted = extracted.substring(firstTagIndex);
    }

    if (validateHTMLContent(extracted)) {
      return extracted;
    }
  }

  return null;
}

/**
 * 验证HTML内容有效性
 * 基本验证：确保有开始和结束标签，没有明显的格式问题
 */
export function validateHTMLContent(html: string): boolean {
  if (!html || html.trim().length === 0) {
    return false;
  }

  // 基本检查：包含HTML标签
  const hasTags = /<[^>]+>/i.test(html);
  if (!hasTags) {
    // 可能是纯文本，但作为HTML应该至少有一些标签
    return false;
  }

  // Check common tag pairs (relaxed check to allow partial streams or simpler HTML)
  const tagPairs = [
    { open: /<div[^>]*>/gi, close: /<\/div>/gi },
    { open: /<p[^>]*>/gi, close: /<\/p>/gi },
    { open: /<h[1-6][^>]*>/gi, close: /<\/h[1-6]>/gi },
  ];

  // For validation, we don't strictly fail on mismatched tags here because 
  // the AI might generate valid HTML fragments (like a list item without a ul, 
  // or a fragment due to streaming), and Tiptap is quite good at sanitizing it.
  for (const pair of tagPairs) {
    const openMatches = html.match(pair.open) || [];
    const closeMatches = html.match(pair.close) || [];
    if (openMatches.length > 0 && openMatches.length !== closeMatches.length) {
      // Just log a warning, don't fail validation
      console.warn(`HTML validation: mismatched tags found for pattern ${pair.open}`);
    }
  }

  return true;
}

/**
 * 创建标准化的AI提示
 */
export function createAIPrompt(mode: 'ask' | 'agent', editorContent: string): string {
  if (mode === 'ask') {
    return `You are a helpful AI assistant integrated into a text editor.
CURRENT MODE: ASK (You answer questions and provide suggestions but do NOT attempt to modify the document via <apply_edit> tags).

RESPONSE GUIDELINES:
1. Provide helpful, accurate information related to the document or user's query
2. Offer suggestions for improvement but do not directly edit
3. If the user asks for edits, explain what you would change and why
4. Use markdown formatting for better readability
5. Keep responses concise but thorough
6. Reference specific parts of the document when relevant

DOCUMENT CONTEXT:
The current document content is:
${truncateWithEllipsis(editorContent, 3000)}`;
  } else {
    return `You are an AI editing assistant integrated into a text editor.
CURRENT MODE: AGENT (You will directly edit the document)

CRITICAL INSTRUCTIONS:
1. You MUST output your edited HTML wrapped EXACTLY in <apply_edit>...</apply_edit> tags.
2. DO NOT include markdown code block formatting (\`\`\`html) around the tags.
3. DO NOT include conversational filler like "Here is the updated text:". ONLY output the <apply_edit> block.
4. Output the COMPLETE edited document, ensuring HTML is valid.

EDITING GUIDELINES:
- Output valid HTML that Tiptap can parse (use h1-h6, p, strong, em, pre, code, ul, ol, li, etc.).
- Maintain semantic structure and preserve the author's overall intent.

EXAMPLE OF YOUR ENTIRE RESPONSE:
<apply_edit>
<h1>New Title</h1>
<p>This is the newly rewritten document content.</p>
</apply_edit>

Current document content:
${truncateWithEllipsis(editorContent, 5000)}`;
  }
}

/**
 * 统一错误处理
 * 将各种错误转换为统一的格式
 */
export function handleAIError(error: any): { message: string; code: string } {
  const defaultError = {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR'
  };

  try {
    // 尝试解析JSON错误
    const errorObj = typeof error === 'string' ? JSON.parse(error) : error;

    const errorMap: Record<string, string> = {
      'API_KEY_MISSING': 'AI feature unavailable: API key not configured',
      'RATE_LIMIT_ERROR': 'Rate limit exceeded. Please try again later.',
      'QUOTA_EXHAUSTED': 'API quota exhausted. Please check your account.',
      'TIMEOUT_ERROR': 'AI response timeout. Please simplify your request.',
      'NETWORK_ERROR': 'Network connection error. Please check your connection.',
      'EDITOR_NOT_READY': 'Editor not ready. Please try again.',
      'PARSE_ERROR': 'Failed to parse AI response. Please try again.',
      'VALIDATION_ERROR': 'AI response format is invalid. Please try again.',
    };

    const code = errorObj.code || 'UNKNOWN_ERROR';
    const message = errorMap[code] || errorObj.message || defaultError.message;

    return { message, code };
  } catch {
    return defaultError;
  }
}

/**
 * 安全编辑器操作包装器
 * 提供统一的空值检查和错误处理
 */
export function safeEditorOperation(
  editor: Editor | null,
  operation: () => void
): boolean {
  if (!editor) {
    console.warn('Editor instance not available');
    return false;
  }

  if (!editor.commands || typeof editor.commands.setContent !== 'function') {
    console.warn('Editor commands not available');
    return false;
  }

  try {
    operation();
    return true;
  } catch (error) {
    console.error('Editor operation failed:', error);
    return false;
  }
}

/**
 * 解析流式响应中的标签
 * 处理分块传输中的<apply_edit>标签
 */
export function parseStreamingTags(
  chunk: string,
  buffer: string
): { content: string | null; isInTag: boolean; buffer: string } {
  let newBuffer = buffer + chunk;
  let isInTag = false;
  let extractedContent: string | null = null;

  // 检查是否在标签中
  const hasStartTag = newBuffer.includes('<apply_edit');
  const hasEndTag = newBuffer.includes('</apply_edit>');

  if (hasStartTag && hasEndTag) {
    // 尝试提取完整内容
    const pattern = /<apply_edit(?:\s[^>]*)?>([\s\S]*?)<\/apply_edit>/i;
    const match = newBuffer.match(pattern);

    if (match && match[1]) {
      extractedContent = match[1].trim();
      // 提取后重置缓冲区（保留标签后的内容）
      newBuffer = newBuffer.replace(pattern, '');
    }
  } else if (hasStartTag || hasEndTag) {
    // 部分标签，保持状态
    isInTag = true;
  }

  return {
    content: extractedContent,
    isInTag,
    buffer: newBuffer
  };
}

/**
 * 辅助函数：截断字符串并添加省略号
 */
function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 生成AI消息历史
 */
export function createAIMessages(
  mode: 'ask' | 'agent',
  editorContent: string,
  history: Array<{ role: string; content: string }>,
  userMessage: string
): Array<{ role: string; content: string }> {
  const systemPrompt = createAIPrompt(mode, editorContent);

  return [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ];
}

/**
 * 统一编辑器编辑应用函数
 * 处理所有编辑器更新逻辑，包括内容提取、验证和应用
 */
export function applyEditorEdit(
  content: string,
  editorInstance: any,
  activeFileId: string | null,
  updateDocument: (id: string, content: string) => void,
  mode: 'ask' | 'agent',
  startPendingEdit?: (originalHTML: string) => void,
  addEditHistory?: (item: { previousContent: string; newContent: string; description?: string }) => void
): boolean {
  // 开发环境日志
  if (process.env.NODE_ENV === 'development') {
    console.log('applyEditorEdit called:', {
      contentLength: content.length,
      mode,
      hasEditor: !!editorInstance,
      hasActiveFile: !!activeFileId
    });
  }

  if (!editorInstance) {
    console.error('Editor instance not available');
    return false;
  }

  // 获取当前内容以便记录历史
  const currentHTML = editorInstance.getHTML();

  // 在非agent模式下，如果需要预览，则保存当前状态
  if (mode !== 'agent' && startPendingEdit) {
    startPendingEdit(currentHTML);
  }

  // 使用统一提取函数
  const extractedContent = extractApplyEditContent(content);

  if (extractedContent) {
    // 应用编辑使用安全操作
    const success = safeEditorOperation(editorInstance, () => {
      editorInstance.commands.setContent(extractedContent);
    });

    if (success && activeFileId) {
      // 更新存储中的文档
      updateDocument(activeFileId, extractedContent);

      // 记录编辑历史
      if (addEditHistory) {
        addEditHistory({
          previousContent: currentHTML,
          newContent: extractedContent,
          description: `AI编辑 (${mode === 'agent' ? '智能模式' : '问答模式'})`
        });
      }

      return true;
    } else if (!success) {
      console.error('Failed to apply edit to editor');
      return false;
    }
  } else {
    // 没有找到有效的<apply_edit>标签
    if (process.env.NODE_ENV === 'development') {
      console.warn('No valid <apply_edit> tags found in AI response');
    }

    // Fallback logic is disabled in Agent mode to prevent chat text from wiping the editor.
    // If we're here, it means the <apply_edit> parsing genuinely failed.
    if (process.env.NODE_ENV === 'development') {
      console.warn('AI response contains no valid <apply_edit> block, aborting fallback to avoid corruption');
    }
    // We throw or return false so the UI can show a failure message rather than inserting bad text
    return false;
  }

  return false;
}