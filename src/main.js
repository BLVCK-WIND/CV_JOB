import '@fontsource-variable/inter';
import './styles.css';

const STORAGE_KEY = 'cv-lang';
const LANGS = ['en', 'vi'];

const UI = {
  en: {
    download: 'Download / Print CV',
    pdfEn: 'English CV',
    pdfVi: 'Vietnamese CV',
    printEn: 'Print English version',
    printVi: 'Print Vietnamese version',
    title: 'Nguyễn Duy Phong — Customer Service (Junior) CV',
    skip: 'Skip to CV',
  },
  vi: {
    download: 'Tải / In CV',
    pdfEn: 'CV Tiếng Anh',
    pdfVi: 'CV Tiếng Việt',
    printEn: 'In bản tiếng Anh',
    printVi: 'In bản tiếng Việt',
    title: 'Nguyễn Duy Phong — CV Chăm sóc khách hàng (Junior)',
    skip: 'Đến nội dung CV',
  },
};

const sheets = document.querySelectorAll('[data-cv]');
const langButtons = document.querySelectorAll('[data-set-lang]');
const toggle = document.getElementById('download-toggle');
const menu = document.getElementById('download-menu');

function initialLang() {
  const fromUrl = new URLSearchParams(location.search).get('lang');
  if (LANGS.includes(fromUrl)) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGS.includes(saved)) return saved;
  } catch {
    /* storage unavailable */
  }
  return 'en';
}

function setLang(lang, { animate = true, persist = true } = {}) {
  if (!LANGS.includes(lang)) return;

  sheets.forEach((sheet) => {
    const active = sheet.dataset.cv === lang;
    sheet.hidden = !active;
    sheet.classList.remove('is-entering');
    if (active && animate) {
      void sheet.offsetWidth; // restart animation
      sheet.classList.add('is-entering');
    }
  });

  langButtons.forEach((btn) => btn.setAttribute('aria-pressed', String(btn.dataset.setLang === lang)));

  const t = UI[lang];
  document.documentElement.lang = lang;
  document.title = t.title;
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (t[key]) el.textContent = t[key];
  });
  const skip = document.querySelector('.skip-link');
  if (skip) skip.textContent = t.skip;

  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore */
    }
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    history.replaceState(null, '', url);
  }
}

/* ---------- Download menu ---------- */
function openMenu(open) {
  menu.hidden = !open;
  toggle.setAttribute('aria-expanded', String(open));
  if (open) menu.querySelector('[role="menuitem"]')?.focus();
}

toggle.addEventListener('click', () => openMenu(menu.hidden));

document.addEventListener('click', (e) => {
  if (!menu.hidden && !e.target.closest('.download')) openMenu(false);
});

menu.addEventListener('keydown', (e) => {
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  const i = items.indexOf(document.activeElement);
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    items[(i + 1) % items.length].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    items[(i - 1 + items.length) % items.length].focus();
  } else if (e.key === 'Escape') {
    openMenu(false);
    toggle.focus();
  } else if (e.key === 'Tab') {
    openMenu(false);
  }
});

menu.querySelectorAll('a[role="menuitem"]').forEach((a) => a.addEventListener('click', () => openMenu(false)));

menu.querySelectorAll('[data-print]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const current = document.documentElement.lang;
    const target = btn.dataset.print;
    openMenu(false);
    setLang(target, { animate: false, persist: false });
    const restore = () => {
      setLang(current, { animate: false, persist: false });
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    requestAnimationFrame(() => window.print());
  });
});

/* ---------- Language switch ---------- */
langButtons.forEach((btn) => btn.addEventListener('click', () => setLang(btn.dataset.setLang)));

setLang(initialLang(), { animate: true, persist: false });
