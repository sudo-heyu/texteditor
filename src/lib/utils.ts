import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function htmlToMarkdown(html: string) {
  return html
    .replace(/<h1>([\s\S]*?)<\/h1>/gi, '# $1\n')
    .replace(/<h2>([\s\S]*?)<\/h2>/gi, '## $1\n')
    .replace(/<h3>([\s\S]*?)<\/h3>/gi, '### $1\n')
    .replace(/<p>([\s\S]*?)<\/p>/gi, '$1\n\n')
    .replace(/<strong>([\s\S]*?)<\/strong>/gi, '**$1**')
    .replace(/<b>([\s\S]*?)<\/b>/gi, '**$1**')
    .replace(/<em>([\s\S]*?)<\/em>/gi, '*$1*')
    .replace(/<i>([\s\S]*?)<\/i>/gi, '*$1*')
    .replace(/<ul>([\s\S]*?)<\/ul>/gi, (match: string, p1: string) => {
      return p1.replace(/<li>([\s\S]*?)<\/li>/gi, '- $1\n') + '\n'
    })
    .replace(/<ol>([\s\S]*?)<\/ol>/gi, (match: string, p1: string) => {
      let i = 1;
      return p1.replace(/<li>([\s\S]*?)<\/li>/gi, (m: string, c: string) => `${i++}. ${c}\n`) + '\n'
    })
    .replace(/<hr\s*\/?>/gi, '----- \n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '') // Remove remaining tags
    .trim();
}

/**
 * 截断字符串并添加省略号
 */
export function truncateWithEllipsis(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 转义HTML特殊字符
 */
export function escapeHTML(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * 简单的Markdown转HTML转换器（基础功能）
 */
export function markdownToHTML(markdown: string): string {
  return markdown
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gm, '<li>$1</li>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code>$1</code>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br>')
    .replace(/^<li>.*<\/li>$/gm, (match) => `<ul>${match}</ul>`)
    .replace(/<\/ul>\n<ul>/g, '')
    .trim();
}
