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
