// Read-only HTTP checks. Requires explicit origins; no deployment or DNS operations.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const [personal,notes,mode]=process.argv.slice(2);
if(!personal||!notes)throw new Error('Usage: node production-smoke.mjs PERSONAL_ORIGIN NOTES_ORIGIN [--redirects]');
const inventory=JSON.parse(readFileSync(new URL('../article-inventory.json',import.meta.url),'utf8')).current;
const routes=inventory.filter(a=>a.published).map(a=>a.route);
const check=async(base,path,status=200)=>{
 const response=await fetch(new URL(path,base),{redirect:'manual',signal:AbortSignal.timeout(20000)});
 assert.equal(response.status,status,`${base}${path}`);
 return response;
};
for(const [base,paths,canonicalOrigin] of [[personal,['/','/robots.txt','/sitemap-index.xml'],'https://nagi.tw'],[notes,['/','/articles/','/topics/','/archive/','/experience/','/rss.xml','/robots.txt','/sitemap-index.xml','/sitemap-0.xml','/search-index.json',...routes],'https://notes.nagi.tw']]){
 for(const path of paths){const response=await check(base,path);if(path.endsWith('/')){const html=await response.text();assert.ok(html.includes(`rel="canonical" href="${canonicalOrigin}${path}"`));assert.ok(html.includes(`property="og:url" content="${canonicalOrigin}${path}"`));}}
 for(const slug of ['taiwan-student-cybersecurity-growing-apart','from-nihscsed-to-control-team'])for(const lang of ['','en/','ja/'])await check(base,`/articles/${slug}/${lang}`,404);
}
const index=await check(notes,'/search-index.json').then(r=>r.json());
assert.equal(index.length,11);assert.equal(index.flatMap(g=>Object.values(g.variants)).length,25);
const rss=await check(notes,'/rss.xml').then(r=>r.text());assert.equal([...rss.matchAll(/<item>/g)].length,25);
for(const site of [personal,notes]){const origin=site===personal?'https://nagi.tw':'https://notes.nagi.tw';const robots=await check(site,'/robots.txt').then(r=>r.text());assert.ok(robots.includes(origin+'/sitemap-index.xml'));}
console.log('Public routes, canonical/OG URLs, index, feed, robots, and unpublished/withdrawn 404 checks: PASS');
if(mode==='--redirects'){
 const map=JSON.parse(readFileSync(new URL('./legacy-url-map.json',import.meta.url),'utf8'));
 for(const rule of map.redirect_candidates){const path=new URL(rule.source_url).pathname;const response=await check(personal,path,301);assert.equal(response.headers.get('location'),rule.target_url,path+' Location');}
 console.log(`${map.redirect_candidates.length} exact legacy redirects: HTTP 301 and Location PASS`);
}
