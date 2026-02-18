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
    const extracted = match[1].trim();

    // 清理可能的markdown代码块（AI有时会忽略指令）
    const cleaned = extracted.replace(/^```(?:html)?\s*|\s*```$/g, '');

    // 验证HTML有效性
    if (validateHTMLContent(cleaned)) {
      return cleaned;
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

  // 检查常见的标签配对（简化检查）
  const tagPairs = [
    { open: /<div[^>]*>/gi, close: /<\/div>/gi },
    { open: /<p[^>]*>/gi, close: /<\/p>/gi },
    { open: /<h[1-6][^>]*>/gi, close: /<\/h[1-6]>/gi },
    { open: /<span[^>]*>/gi, close: /<\/span>/gi },
  ];

  // 简单验证：如果检测到开始标签，应该也有对应的结束标签
  for (const pair of tagPairs) {
    const openMatches = html.match(pair.open) || [];
    const closeMatches = html.match(pair.close) || [];
    if (openMatches.length > 0 && openMatches.length !== closeMatches.length) {
      // 标签不配对，但可能是自闭合标签或其他情况
      // 这里不严格失败，只记录警告
      console.warn(`HTML validation: mismatched tags found`);
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
${truncateWithEllipsis(editorContent, 5000)}`;
  } else {
    return `You are an AI editing assistant integrated into a text editor.
CURRENT MODE: AGENT (You can directly edit the document)

IMPORTANT INSTRUCTIONS:
1. ALWAYS wrap your HTML response in <apply_edit> tags
2. Provide the COMPLETE HTML document, not just modified parts
3. Ensure HTML is valid and well-formed with proper closing tags
4. Preserve the document structure and important elements
5. Maintain semantic HTML (use appropriate tags: h1-h6 for headings, p for paragraphs, etc.)
6. You may add explanations before or after the tags

EDITING GUIDELINES:
- When rewriting: Keep the core message but improve clarity, grammar, or style
- When formatting: Use appropriate CSS classes or inline styles
- When adding content: Ensure it fits contextually with existing content
- When correcting: Fix errors while preserving the author's intent
- When translating: Maintain meaning and tone

EXAMPLES:
- Rewriting: "I've improved the introduction: <apply_edit><h1>Enhanced Title</h1><p>Revised content with better clarity...</p></apply_edit>"
- Formatting: "Applied better formatting: <apply_edit><div style="max-width: 800px; margin: 0 auto"><h1>Title</h1><p>Content...</p></div></apply_edit>"
- Adding: "Added a conclusion section: <apply_edit><h2>Conclusion</h2><p>Summary of key points...</p></apply_edit>"
- Correcting: "Fixed grammar and spelling: <apply_edit><p>Corrected text with proper grammar...</p></apply_edit>"

RESPONSE STRUCTURE:
1. Brief explanation of changes (optional)
2. <apply_edit>FULL_HTML_CONTENT</apply_edit>
3. Additional notes or suggestions (optional)

Current document content (first 8000 chars):
${truncateWithEllipsis(editorContent, 8000)}`;
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

    // 后备方案：检查内容是否直接包含HTML标签
    const hasHTMLTags = /<[^>]+>/.test(content);
    if (hasHTMLTags) {
      // 后备方案：直接使用内容作为HTML
      if (process.env.NODE_ENV === 'development') {
        console.warn('Falling back to using content directly as HTML');
      }

      const fallbackSuccess = safeEditorOperation(editorInstance, () => {
        editorInstance.commands.setContent(content.trim());
      });

      if (fallbackSuccess && activeFileId) {
        updateDocument(activeFileId, content.trim());

        // 记录编辑历史
        if (addEditHistory) {
          addEditHistory({
            previousContent: currentHTML,
            newContent: content.trim(),
            description: `AI编辑后备方案 (${mode === 'agent' ? '智能模式' : '问答模式'})`
          });
        }

        return true;
      }
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.warn('AI response contains no HTML content, cannot apply edit');
      }
    }
  }

  return false;
}