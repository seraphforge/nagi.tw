export type NotesArticle = {
  key: string;
  language: 'zh';
  topic: string;
  href: string;
  data: { title: string; description?: string; date: Date };
};

export type NotesPreviewGroup = {
  key: string;
  topic: string;
  availableLanguages: ['zh'];
  variants: { zh: NotesArticle };
};

const FEED_URL = 'https://notes.nagi.tw/rss.xml';
const decodeXml = (value: string) => value
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&apos;/g, "'").trim();

const field = (item: string, name: string) => {
  const match = item.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return match ? decodeXml(match[1]) : '';
};

const safeArticleUrl = (value: string) => {
  try {
    const url = new URL(value, 'https://notes.nagi.tw');
    if (url.origin !== 'https://notes.nagi.tw' || !url.pathname.startsWith('/articles/')) return null;
    return url.href;
  } catch {
    return null;
  }
};

export function parseNotesRss(xml: string): NotesPreviewGroup[] {
  return [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)].flatMap((match) => {
    const item = match[1];
    const href = safeArticleUrl(field(item, 'link'));
    const date = new Date(field(item, 'pubDate'));
    const title = field(item, 'title');
    if (!href || !title || !Number.isFinite(date.valueOf())) return [];
    const categories = [...item.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)]
      .map((category) => decodeXml(category[1])).filter(Boolean);
    const topic = categories[0] ?? 'Notes';
    const article: NotesArticle = { key: href, language: 'zh', topic, href, data: { title, description: field(item, 'description') || undefined, date } };
    return [{ key: href, topic, availableLanguages: ['zh'], variants: { zh: article } } satisfies NotesPreviewGroup];
  });
}

export async function fetchNotesRss(url = process.env.NOTES_RSS_URL ?? FEED_URL): Promise<NotesPreviewGroup[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/rss+xml, application/xml, text/xml' } });
    if (!response.ok) throw new Error(`RSS request failed: ${response.status}`);
    return parseNotesRss(await response.text());
  } catch (error) {
    console.warn(`[notes-rss] Unable to fetch ${url}: ${error instanceof Error ? error.message : String(error)}`);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

