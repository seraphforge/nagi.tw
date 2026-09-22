import assert from 'node:assert/strict';
import { parseNotesRss } from '../src/lib/notes-rss.ts';

const groups = parseNotesRss(`<?xml version="1.0"?><rss><channel>
  <item><title>測試文章</title><link>https://notes.nagi.tw/articles/test/</link><description><![CDATA[摘要]]></description><pubDate>Sun, 20 Sep 2026 00:00:00 GMT</pubDate><category>research</category></item>
  <item><title>外部連結</title><link>https://example.com/</link><pubDate>Sun, 20 Sep 2026 00:00:00 GMT</pubDate></item>
</channel></rss>`);
assert.equal(groups.length, 1);
assert.equal(groups[0].variants.zh.data.title, '測試文章');
assert.equal(groups[0].variants.zh.data.description, '摘要');
assert.equal(groups[0].variants.zh.data.date.toISOString(), '2026-09-20T00:00:00.000Z');
assert.equal(groups[0].variants.zh.href, 'https://notes.nagi.tw/articles/test/');
assert.equal(groups[0].topic, 'research');
console.log('RSS parser: PASS');
