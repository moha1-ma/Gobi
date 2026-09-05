const MAX_PROMPT_LENGTH = 4000;
const REQUEST_TIMEOUT_MS = 15000;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 12;

const requestLog = new Map();

function trim(value, max = MAX_PROMPT_LENGTH) {
  return String(value || '').trim().slice(0, max);
}

function allowed(ip) {
  const now = Date.now();
  const recent = (requestLog.get(ip) || []).filter((timestamp) => now - timestamp < RATE_WINDOW_MS);
  if (recent.length >= RATE_LIMIT) return false;
  recent.push(now);
  requestLog.set(ip, recent);
  return true;
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(`AI_PROVIDER_${response.status}`);
    return body;
  } finally {
    clearTimeout(timer);
  }
}

async function askGemini(prompt, locale) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_NOT_CONFIGURED');
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const body = await fetchJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: `أنت مساعد MX1. أجب بلغة ${locale || 'ar'} بوضوح، ولا تدّعي تنفيذ تغييرات خارجية.` }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 1200 }
    })
  });
  const text = body.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('').trim();
  if (!text) throw new Error('GEMINI_EMPTY_RESPONSE');
  return { provider: 'gemini', model, text };
}

async function askConfiguredMeta(prompt, locale) {
  const url = process.env.META_AI_API_URL;
  const key = process.env.META_AI_API_KEY;
  if (!url || !key) throw new Error('META_AI_NOT_CONFIGURED');
  const body = await fetchJson(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${key}`, 'content-type': 'application/json' },
    body: JSON.stringify({ prompt, locale: locale || 'ar' })
  });
  const text = body.text || body.output || body.response || body.choices?.[0]?.message?.content;
  if (!text) throw new Error('META_AI_EMPTY_RESPONSE');
  return { provider: 'meta', model: body.model || 'configured-meta-endpoint', text: String(text) };
}

async function askAgent(prompt, locale) {
  const url = process.env.AI_AGENT_WEBHOOK_URL;
  const key = process.env.AI_AGENT_WEBHOOK_TOKEN;
  if (!url) throw new Error('AI_AGENT_NOT_CONFIGURED');
  const headers = { 'content-type': 'application/json' };
  if (key) headers.authorization = `Bearer ${key}`;
  const body = await fetchJson(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({ prompt, locale: locale || 'ar', source: 'mx1' })
  });
  const text = body.text || body.output || body.response;
  if (!text) throw new Error('AI_AGENT_EMPTY_RESPONSE');
  return { provider: 'agent', model: body.model || 'configured-agent', text: String(text) };
}

async function askProvider(provider, prompt, locale) {
  if (provider === 'meta') return askConfiguredMeta(prompt, locale);
  if (provider === 'agent') return askAgent(prompt, locale);
  return askGemini(prompt, locale);
}

async function askMx1Ai({ provider = 'gemini', prompt, locale = 'ar', ip = 'unknown' }) {
  const cleanPrompt = trim(prompt);
  if (!cleanPrompt) throw new Error('PROMPT_REQUIRED');
  if (!allowed(ip)) throw new Error('AI_RATE_LIMIT');
  try {
    return await askProvider(provider, cleanPrompt, locale);
  } catch (error) {
    if (provider !== 'gemini' && process.env.GEMINI_API_KEY) {
      const fallback = await askGemini(cleanPrompt, locale);
      return { ...fallback, fallbackFrom: provider };
    }
    throw error;
  }
}

module.exports = { askMx1Ai };
