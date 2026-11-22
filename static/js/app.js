const GROUPS = [
  { id: 'ai', label: 'AI', keys: ['openai', 'chatgpt', 'claude', 'gemini', 'ollama', 'deepseek', 'midjourney', 'comfyui', 'stable', 'gemma', 'grok', 'kimi', 'doubao', 'qwen', 'huggingface', 'copilot', 'cursor', 'codex', 'manus', 'perplexity', 'anthropic', 'mistral'] },
  { id: 'docker', label: 'Docker', keys: ['docker', 'portainer', 'compose'] },
  { id: 'nas', label: 'NAS', keys: ['synology', 'qnap', 'unraid', 'truenas', 'openmediavault', 'omv', 'fnos', 'asustor', 'terramaster', 'ugreen', 'zspace'] },
  { id: 'pt', label: 'PT', keys: ['pt-helper', 'ptools', 'pttime', 'ptvicomo', 'pthome', 'ptsbao', 'pter', 'qingwapt', 'tjupt', 'zmpt', 'nicept', 'sharkpt', 'carpt', 'btschool', 'chdbits', 'discfan', 'haidan', 'hdarea', 'hdchina', 'hddolby', 'hdfans', 'hdhome', 'hdsky', 'hdvideo', 'lemonhd', 'opencd', 'ourbits', 'ttg', 'springsunday', 'hdcity', 'hdtime', 'mteam', '1ptba', '52pt', 'keepfrds', 'hdzone', 'hdroute', 'hdbd', 'hd4fans', 'joyhd', 'hdpt', 'iyuu', 'nastools'] },
  { id: 'cloud', label: '云服务', keys: ['aws', 'aliyun', 'azure', 'cloudflare', 'tencent', 'huawei', 'oracle', 'vercel', 'netlify', 'heroku', 'digitalocean', 'linode', 'vultr', 'gcp'] },
  { id: 'media', label: '影音', keys: ['emby', 'jellyfin', 'plex', 'kodi', 'infuse', 'vidhub', 'fileball', 'tvbox', 'potplayer', 'vlc', 'iina', 'senplayer'] },
  { id: 'net', label: '网络', keys: ['openwrt', 'istoreos', 'ikuai', 'mikrotik', 'openclash', 'clash', 'singbox', 'sing-box', 'lucky', 'adguard', 'wireguard', 'tailscale', 'zerotier', 'frp', 'nps', 'traefik'] },
  { id: 'download', label: '下载', keys: ['qbittorrent', 'transmission', 'aria2', 'ariang', 'deluge', 'utorrent', 'bitcomet', 'motrix', '115', 'alist', 'clouddrive', 'pikpak'] },
];

const state = {
  icons: [],
  tab: 'all',
  keyword: '',
};

const $ = (id) => document.getElementById(id);

function iconPath(item) {
  const m = (item.url || '').match(/\/(border-radius|circle|svg)\/([^/]+)$/);
  if (m) return `/${m[1]}/${m[2]}`;
  const ext = ((item.url || '').split('.').pop() || 'png').split('?')[0];
  return `/svg/${item.name}.${ext}`;
}

function typeOf(item) {
  const p = iconPath(item);
  return p.split('/')[1] || 'svg';
}

function inGroup(item, g) {
  const n = item.name.toLowerCase();
  return g.keys.some((k) => n.includes(k));
}

function tabs() {
  return [
    { id: 'all', label: '全部' },
    { id: 'border-radius', label: '圆角', type: 'border-radius' },
    { id: 'circle', label: '圆形', type: 'circle' },
    { id: 'svg', label: '矢量', type: 'svg' },
  ].concat(GROUPS);
}

function matchTab(item, tab) {
  if (tab.id === 'all') return true;
  if (tab.type) return typeOf(item) === tab.type;
  return inGroup(item, tab);
}

function renderTabs() {
  const bar = $('tabs');
  bar.innerHTML = '';
  for (const tab of tabs()) {
    const n = state.icons.filter((i) => matchTab(i, tab)).length;
    const btn = document.createElement('button');
    btn.className = 'tab' + (state.tab === tab.id ? ' active' : '');
    btn.innerHTML = `${tab.label} <em>${n}</em>`;
    btn.onclick = () => { state.tab = tab.id; renderTabs(); render(); };
    bar.appendChild(btn);
  }
}

function render() {
  const tab = tabs().find((t) => t.id === state.tab) || tabs()[0];
  const q = state.keyword.trim().toLowerCase();
  let list = state.icons.filter((i) => matchTab(i, tab));
  if (q) list = list.filter((i) => i.name.toLowerCase().includes(q));
  $('result-count').textContent = `${list.length} 个图标`;
  const grid = $('grid');
  grid.innerHTML = '';
  const frag = document.createDocumentFragment();
  for (const item of list) {
    const card = document.createElement('div');
    card.className = 'card';
    card.title = '点击复制：' + item.name;
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = iconPath(item);
    img.alt = item.name;
    const name = document.createElement('span');
    name.textContent = item.name;
    card.append(img, name);
    card.onclick = () => copy(new URL(iconPath(item), location.origin).href);
    frag.appendChild(card);
  }
  grid.appendChild(frag);
}

function copy(text) {
  const done = () => toast('已复制：' + text);
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text).then(done, () => fallback(text, done));
  } else {
    fallback(text, done);
  }
}

function fallback(text, done) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); done(); } catch (e) { toast('复制失败，请手动复制'); }
  ta.remove();
}

let toastTimer;
function toast(text) {
  const el = $('toast');
  el.textContent = text;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
}

async function load() {
  try {
    const r = await fetch('/icons.json');
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    state.icons = Array.isArray(data.icons) ? data.icons : [];
    $('total').textContent = data.total_count || state.icons.length;
    renderTabs();
    render();
  } catch (e) {
    $('result-count').textContent = '加载失败：' + e.message;
  }
}

$('search').addEventListener('input', (e) => { state.keyword = e.target.value; render(); });
$('theme-btn').addEventListener('click', () => {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
  localStorage.setItem('hd_icons_theme', dark ? 'light' : 'dark');
});

(function initTheme() {
  const saved = localStorage.getItem('hd_icons_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();

load();
