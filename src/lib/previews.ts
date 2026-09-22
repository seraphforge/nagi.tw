import type { NotesPreviewGroup } from './notes-rss';

export type Language = 'zh' | 'en' | 'ja';
export type PreviewGroup = NotesPreviewGroup;
export const languageLabel: Record<Language, string> = { zh: '中文', en: 'EN', ja: '日本語' };
export const formatDate = (date: Date, lang: Language = 'zh') => new Intl.DateTimeFormat(lang === 'zh' ? 'zh-TW' : lang, { year: 'numeric', month: 'short', day: '2-digit' }).format(date);
