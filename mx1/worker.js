const headers = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "content-type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers });
}

async function schema(db) {
  await db.batch([
    db.prepare(`CREATE TABLE IF NOT EXISTS mx1_posts (id TEXT PRIMARY KEY, user_name TEXT NOT NULL, avatar TEXT NOT NULL, caption TEXT NOT NULL, image_url TEXT, likes INTEGER NOT NULL DEFAULT 0, created_at INTEGER NOT NULL)`),
    db.prepare(`CREATE TABLE IF NOT EXISTS mx1_comments (id TEXT PRIMARY KEY, post_id TEXT NOT NULL, user_name TEXT NOT NULL, body TEXT NOT NULL, created_at INTEGER NOT NULL)`)
  ]);
}

function id() { return crypto.randomUUID(); }
function safeText(value, max) { return String(value ?? "").trim().slice(0, max); }

const landing = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MX1 — مساحة اجتماعية</title>
<style>
:root{--bg:#000;--card:#000;--ink:#f5f5f5;--muted:#a8a8a8;--line:#262626;--accent:#d62976;--accent2:#fa7e1e;--blue:#0095f6}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font-family:Arial,"Noto Sans Arabic",sans-serif}
.top{height:62px;background:#000;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:5}.topin{max-width:980px;height:100%;margin:auto;display:flex;align-items:center;justify-content:space-between;padding:0 18px}.brand{font-family:Georgia,serif;font-size:27px;font-weight:700;letter-spacing:-1px}.brand span{background:linear-gradient(45deg,var(--accent2),var(--accent),#7b2cff);-webkit-background-clip:text;color:transparent}.actions{display:flex;gap:9px;align-items:center}.btn{border:0;border-radius:9px;padding:9px 15px;font-weight:700;cursor:pointer}.primary{background:var(--blue);color:#fff}.ghost{background:#262626;color:var(--ink)}.admin-panel{display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:20;padding:24px}.admin-card{max-width:620px;margin:60px auto;background:#121212;border:1px solid #363636;border-radius:14px;padding:22px;box-shadow:0 12px 50px #000}.admin-card h3{margin:0 0 8px}.admin-card p{color:var(--muted);font-size:13px}.admin-card input,.admin-card textarea{width:100%;background:#1c1c1c;border:1px solid #363636;border-radius:8px;color:var(--ink);padding:11px;margin:7px 0 12px;font-family:inherit}.admin-card textarea{min-height:130px;resize:vertical}.admin-actions{display:flex;gap:9px;justify-content:flex-start}.cf-panel{display:none;position:fixed;inset:0;background:rgba(0,0,0,.9);z-index:19;padding:20px;overflow:auto}.cf-card{max-width:980px;margin:20px auto;background:#0d0d0d;border:1px solid #303030;border-radius:14px;padding:22px}.cf-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:10px;margin-top:18px}.cf-item{background:#171717;border:1px solid #2b2b2b;border-radius:10px;padding:13px}.cf-item b{display:block;margin-bottom:5px}.cf-item small{color:var(--muted);line-height:1.5}.cf-item a{display:inline-block;color:#42a5f5;margin-top:9px;font-size:12px;text-decoration:none}.cf-status{color:#68d391;font-size:12px}
.layout{max-width:980px;margin:28px auto;display:grid;grid-template-columns:minmax(0,620px) 280px;gap:30px;direction:ltr}.main,.side{direction:rtl}.side{position:sticky;top:88px;height:max-content}.profile{background:#000;border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:18px}.profile h2{font-size:18px;margin:0 0 7px}.profile p{color:var(--muted);font-size:13px;line-height:1.7;margin:0}.links{display:flex;flex-direction:column;gap:10px;margin-top:15px}.links a{color:var(--ink);text-decoration:none;font-size:13px}.links a:hover{color:var(--blue)}
.composer{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:16px;margin-bottom:18px}.composer-row{display:flex;gap:12px;align-items:flex-start}.avatar{width:42px;height:42px;border-radius:50%;display:grid;place-items:center;color:#fff;font-weight:700;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);flex:none}.composer textarea{width:100%;border:0;outline:0;resize:none;font-size:15px;padding:7px 0;min-height:60px;font-family:inherit}.composer-foot{display:flex;justify-content:space-between;align-items:center;border-top:1px solid #262626;padding-top:10px}.hint{font-size:12px;color:var(--muted)}
.post{background:#000;border:1px solid var(--line);border-radius:12px;margin-bottom:18px;overflow:hidden}.post-head{display:flex;align-items:center;gap:10px;padding:13px 15px}.user{font-weight:700;font-size:14px}.time{color:var(--muted);font-size:11px;margin-top:3px}.post-image{width:100%;aspect-ratio:1.35;background:linear-gradient(135deg,#171717,#262626);display:grid;place-items:center;color:#a1a1aa;font-size:52px}.post-image img{width:100%;height:100%;object-fit:cover}.post-body{padding:12px 15px}.post-actions{display:flex;gap:18px;align-items:center;margin-bottom:9px}.icon{border:0;background:transparent;font-size:22px;cursor:pointer;padding:0}.likes{font-weight:700;font-size:13px;margin-bottom:8px}.caption{font-size:14px;line-height:1.7}.empty{text-align:center;padding:45px 20px;color:var(--muted);background:#000;border:1px dashed var(--line);border-radius:12px}.toast{position:fixed;bottom:22px;left:50%;transform:translateX(-50%);background:#171717;color:#fff;padding:12px 18px;border-radius:22px;display:none;font-size:13px;z-index:9}
@media(max-width:760px){.layout{display:block;margin:18px 10px}.side{display:none}.topin{padding:0 12px}.brand{font-size:24px}.top{height:56px}}
</style></head>
<body><header class="top"><div class="topin"><div class="brand"><span>MX1</span></div><div class="actions"><button class="btn ghost" onclick="loadFeed()">تحديث</button><button class="btn ghost" onclick="openCloudflare()">Cloudflare</button><button class="btn ghost" onclick="openAdmin()">إدارة النشر</button><button class="btn primary" onclick="document.getElementById('caption').focus()">منشور جديد</button></div></div></header>
<div id="admin" class="admin-panel"><div class="admin-card"><h3>لوحة نشر MX1</h3><p>تُحفظ المسودة محليًا في هذا المتصفح. مفاتيح GitHub وCloudflare لا تُحفظ هنا ولا تُعرض للمستخدمين.</p><label>رسالة التحديث</label><input id="deployMessage" value="Update MX1 from admin panel"><label>محتوى التحديث الاختياري</label><textarea id="deployContent" placeholder="اكتب مسودة أو تعليمات التحديث…"></textarea><label>رمز الإدارة</label><input id="adminToken" type="password" placeholder="يُرسل عبر اتصال مشفر فقط"><div class="admin-actions"><button class="btn primary" onclick="publishProject()">نشر إلى GitHub ثم Cloudflare</button><button class="btn ghost" onclick="closeAdmin()">إغلاق</button></div><div id="deployStatus" class="hint" style="margin-top:12px"></div></div></div><div id="cloudflare" class="cf-panel"><div class="cf-card"><h2>لوحة Cloudflare الشاملة</h2><p class="hint">كتالوج الخدمات المرتبطة بـ MX1. القراءة متاحة هنا، أما الإنشاء والتعديل والحذف فيتطلب صلاحية إدارية وتأكيدًا منفصلًا.</p><div id="cfGrid" class="cf-grid"></div><div style="margin-top:18px"><button class="btn ghost" onclick="closeCloudflare()">إغلاق</button></div></div></div><div class="layout"><main class="main"><section class="composer"><div class="composer-row"><div class="avatar">م</div><textarea id="caption" maxlength="600" placeholder="ما الذي تريد مشاركته؟"></textarea></div><div class="composer-foot"><span class="hint">واجهة عامة — لا تحتاج إلى API key أو عنوان IP</span><button class="btn primary" onclick="publish()">نشر</button></div></section><section id="feed"><div class="empty">جارٍ تحميل المنشورات…</div></section></main>
<aside class="side"><div class="profile"><h2>MX1</h2><p>مساحتك الاجتماعية البسيطة، مع وصول مباشر من الواجهة وقاعدة البيانات محمية خلف الخادم.</p><div class="links"><a href="https://github.com/moha1-ma/Gobi" target="_blank" rel="noreferrer">مشروع Gobi على GitHub</a><a href="https://github.com/moha1-ma/72815917" target="_blank" rel="noreferrer">نسخة GitHub المرتبطة</a><a href="https://dash.cloudflare.com/" target="blank" rel="noreferrer">لوحة Cloudflare</a></div></div></aside></div><div id="toast" class="toast"></div>
<script>
const feed=document.getElementById('feed');
function toast(t){const x=document.getElementById('toast');x.textContent=t;x.style.display='block';setTimeout(()=>x.style.display='none',2600)}
function esc(t){return String(t||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function ago(ts){const m=Math.max(1,Math.floor((Date.now()-ts)/60000));return m<60?'منذ '+m+' د':m<1440?'منذ '+Math.floor(m/60)+' س':'منذ '+Math.floor(m/1440)+' ي'}
function card(p){const image=p.image_url?'<img src="'+esc(p.image_url)+'" alt="منشور MX1">':'<span>✦</span>';return '<article class="post"><div class="post-head"><div class="avatar">'+esc((p.user_name||'م')[0])+'</div><div><div class="user">'+esc(p.user_name||'مستخدم MX1')+'</div><div class="time">'+ago(p.created_at)+'</div></div></div><div class="post-image">'+image+'</div><div class="post-body"><div class="post-actions"><button class="icon" onclick="likePost(\''+p.id+'\',this)">♡</button><button class="icon" onclick="document.getElementById(\'caption\').focus()">◌</button><button class="icon" onclick="navigator.clipboard?.writeText(location.href);toast(\'تم نسخ الرابط\')">⌁</button></div><div class="likes" id="likes-'+p.id+'">'+(p.likes||0)+' إعجاب</div><div class="caption"><b>'+esc(p.user_name||'مستخدم MX1')+'</b> '+esc(p.caption)+'</div></div></article>'}
async function loadFeed(){try{const r=await fetch('/api/feed');const d=await r.json();feed.innerHTML=d.posts?.length?d.posts.map(card).join(''):'<div class="empty">لا توجد منشورات بعد. كن أول من يشارك.</div>'}catch(e){feed.innerHTML='<div class="empty">تعذر تحميل المنشورات حاليًا.</div>'}}
async function publish(){const box=document.getElementById('caption');const caption=box.value.trim();if(!caption)return toast('اكتب نص المنشور أولًا');try{const r=await fetch('/api/posts',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({caption,userName:'مستخدم MX1'})});const d=await r.json();if(!r.ok)throw Error(d.error);box.value='';toast('تم نشر المنشور');loadFeed()}catch(e){toast(e.message||'تعذر النشر')}}
async function likePost(id,button){button.disabled=true;try{const r=await fetch('/api/posts/'+id+'/like',{method:'POST'});const d=await r.json();if(d.likes!==undefined)document.getElementById('likes-'+id).textContent=d.likes+' إعجاب';button.textContent='♥';button.style.color='#ed4956'}finally{button.disabled=false}}
const cloudflareServices=[['Workers','التنفيذ والنشر والمسارات والإصدارات','مرتبط — mx1','workers'],['D1','قاعدة البيانات العلاقية','مرتبط — binding D','d1'],['KV','التخزين السريع بالمفاتيح','جاهز للربط','kv'],['R2','تخزين الملفات والكائنات','جاهز للربط','r2'],['Pages','استضافة الواجهات والنشر','متاح','pages'],['DNS','النطاقات والسجلات','متاح','dns'],['Routes','ربط المسارات بالـ Workers','متاح','routes'],['Queues','طوابير المهام','متاح','queues'],['Durable Objects','حالة متسقة وجلسات','متاح','durable-objects'],['Workers AI','نماذج الذكاء الاصطناعي','متاح','workers-ai'],['AI Gateway','بوابة النماذج والمراقبة','متاح','ai-gateway'],['Vectorize','البحث المتجهي','متاح','vectorize'],['Images','تحسين الصور والتحويل','متاح','images'],['Stream','الفيديو والبث','متاح','stream'],['Analytics','تحليلات الويب وWorkers','متاح','analytics'],['Logs & Tail','السجلات والتتبع','متاح','logs'],['Cache','التخزين المؤقت والتنقية','متاح','cache'],['WAF','جدار حماية التطبيقات','متاح','waf'],['Rate Limiting','حدود الطلبات','متاح','rate-limiting'],['Access','التحكم بالوصول','متاح','access'],['Tunnels','الأنفاق والاتصال الخاص','متاح','tunnels'],['Queues & Workflows','المهام الخلفية وسير العمل','متاح','workflows'],['Webhooks','الإشعارات والأحداث','متاح','webhooks'],['Email Routing','توجيه البريد','متاح','email'],['Load Balancing','توزيع الحمل','متاح','load-balancing'],['Browser Rendering','التصيير الآلي','متاح','browser-rendering'],['R2 Data Catalog','فهرسة البيانات','متاح','r2-catalog'],['Secrets Store','حفظ الأسرار','متاح','secrets-store']];function openCloudflare(){const g=document.getElementById('cfGrid');g.innerHTML=cloudflareServices.map(s=>'<div class="cf-item"><b>'+s[0]+'</b><small>'+s[1]+'</small><div class="cf-status">'+s[2]+'</div><a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer">فتح في Cloudflare</a></div>').join('');document.getElementById('cloudflare').style.display='block'}function closeCloudflare(){document.getElementById('cloudflare').style.display='none'}
const draftKey='mx1-admin-draft';function openAdmin(){document.getElementById('admin').style.display='block';const d=JSON.parse(localStorage.getItem(draftKey)||'{}');deployMessage.value=d.message||deployMessage.value;deployContent.value=d.content||''}function closeAdmin(){document.getElementById('admin').style.display='none'}function saveDraft(){localStorage.setItem(draftKey,JSON.stringify({message:deployMessage.value,content:deployContent.value}))}async function publishProject(){saveDraft();const status=document.getElementById('deployStatus');status.textContent='جارٍ إرسال طلب النشر…';try{const r=await fetch('/api/publish',{method:'POST',headers:{'content-type':'application/json','authorization':'Bearer '+document.getElementById('adminToken').value},body:JSON.stringify({message:deployMessage.value,content:deployContent.value})});const d=await r.json();status.textContent=d.message||d.error||'تمت العملية';if(r.ok)toast('تم إرسال النشر')}catch(e){status.textContent='تعذر الاتصال بخدمة النشر'}}
loadFeed();
</script></body></html>`;

async function handleApi(request, env, url) {
  await schema(env.D);
  if (url.pathname === '/api/feed' && request.method === 'GET') {
    const rows = await env.D.prepare('SELECT id,user_name,avatar,caption,image_url,likes,created_at FROM mx1_posts ORDER BY created_at DESC LIMIT 50').all();
    return json({ posts: rows.results || [] });
  }
  if (url.pathname === '/api/posts' && request.method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const caption = safeText(body.caption, 600);
    if (!caption) return json({error:'اكتب نص المنشور أولًا'}, 400);
    const post = { id:id(), user_name:safeText(body.userName, 40) || 'مستخدم MX1', avatar:'', caption, image_url:safeText(body.imageUrl, 1000) || null, likes:0, created_at:Date.now() };
    await env.D.prepare('INSERT INTO mx1_posts(id,user_name,avatar,caption,image_url,likes,created_at) VALUES(?,?,?,?,?,?,?)').bind(post.id,post.user_name,post.avatar,post.caption,post.image_url,post.likes,post.created_at).run();
    return json({post}, 201);
  }
  if (url.pathname === '/api/publish' && request.method === 'POST') {
    if (!env.GITHUB_TOKEN || !env.ADMIN_TOKEN) return json({error:'خدمة النشر غير مهيأة بعد. أضف أسرار GITHUB_TOKEN وADMIN_TOKEN إلى Worker.'}, 503);
    const auth = request.headers.get('authorization') || '';
    if (auth !== 'Bearer ' + env.ADMIN_TOKEN) return json({error:'غير مصرح'}, 401);
    return json({message:'تم قبول طلب النشر. اربط سير GitHub Actions لإكمال النشر إلى Cloudflare.'});
  }
  const match = url.pathname.match(/^\/api\/posts\/([^/]+)\/like$/);
  if (match && request.method === 'POST') {
    await env.D.prepare('UPDATE mx1_posts SET likes=likes+1 WHERE id=?').bind(match[1]).run();
    const row = await env.D.prepare('SELECT likes FROM mx1_posts WHERE id=?').bind(match[1]).first();
    return json({likes: row?.likes || 0});
  }
  return json({error:'غير موجود'}, 404);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, {status:204, headers});
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, url);
    return new Response(landing, {headers:{'content-type':'text/html; charset=utf-8','cache-control':'no-store'}});
  }
};
