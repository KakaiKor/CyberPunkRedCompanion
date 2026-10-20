// js/modules/ui/icons.js
// Единый набор SVG-иконок в стиле Lucide (outline, stroke-based).
// Использование:
//   import { icon } from './modules/ui/icons.js';
//   icon('pistol', { size: 16 })  →  <span class="cpr-icon cpr-icon-pistol" ...><svg>...</svg></span>
//   icon('heart', { size: 20, className: 'is-critical' })

const SVG_ATTRS = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"`;

export const icons = {
    // ─── Оружие / бой ──────────────────────────────────────
    pistol: `<svg ${SVG_ATTRS}><path d="M3 8h13l3 3v4h-3l-1-2H8l-2 2H3z"/><path d="M8 13v5"/><circle cx="11" cy="9" r="1"/></svg>`,
    rifle: `<svg ${SVG_ATTRS}><path d="M2 10h16l4 2-4 2H9l-3-2H2z"/><path d="M6 12v5"/><path d="M14 11v2"/></svg>`,
    sword: `<svg ${SVG_ATTRS}><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>`,
    knife: `<svg ${SVG_ATTRS}><path d="M3 21l5-5"/><path d="M9 16l7-7-3-3-7 7z"/><path d="M14 6l3-3 4 4-3 3z"/></svg>`,
    crosshair: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><line x1="12" y1="3" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="21"/><line x1="3" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="21" y2="12"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`,
    explosion: `<svg ${SVG_ATTRS}><path d="M12 2 9 7l-5-1 3 4-4 3 5 1-1 5 4-2 3 4 2-5 5 1-3-4 4-3-5-1 2-5-5 2z"/></svg>`,
    shield: `<svg ${SVG_ATTRS}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>`,
    shieldOff: `<svg ${SVG_ATTRS}><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><line x1="4" y1="20" x2="20" y2="4"/></svg>`,
    target: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
    zap: `<svg ${SVG_ATTRS}><path d="M13 2 3 14h7l-1 8 10-12h-7z"/></svg>`,

    // ─── Здоровье / состояние ──────────────────────────────
    heart: `<svg ${SVG_ATTRS}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    heartCrack: `<svg ${SVG_ATTRS}><path d="M12 5.67 10.94 4.61a5.5 5.5 0 0 0-7.78 7.78l8.84 8.84 8.84-8.84a5.5 5.5 0 0 0 0-7.78l-1.06 1.06"/><path d="M12 11l-2 2 3 3-2 3"/></svg>`,
    activity: `<svg ${SVG_ATTRS}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    pill: `<svg ${SVG_ATTRS}><path d="M10.5 20.5 3.5 13.5a5 5 0 0 1 7-7l7 7a5 5 0 0 1-7 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/></svg>`,
    bandage: `<svg ${SVG_ATTRS}><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(-45 12 12)"/><circle cx="9" cy="15" r="1"/><circle cx="15" cy="9" r="1"/></svg>`,
    skull: `<svg ${SVG_ATTRS}><path d="M12 2a9 9 0 0 0-9 9c0 3 1.5 5 3 6v3h2v-2h2v2h4v-2h2v2h2v-3c1.5-1 3-3 3-6a9 9 0 0 0-9-9z"/><circle cx="9" cy="11" r="1.5" fill="currentColor"/><circle cx="15" cy="11" r="1.5" fill="currentColor"/></svg>`,
    brain: `<svg ${SVG_ATTRS}><path d="M9.5 2A2.5 2.5 0 0 0 7 4.5v.5A2.5 2.5 0 0 0 4.5 7.5c0 .8.4 1.5 1 2a2.5 2.5 0 0 0 0 5 2.5 2.5 0 0 0 1 2A2.5 2.5 0 0 0 7 19.5v.5A2.5 2.5 0 0 0 9.5 22"/><path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v.5A2.5 2.5 0 0 1 19.5 7.5c0 .8-.4 1.5-1 2a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1-1 2 2.5 2.5 0 0 1-2.5 2.5v.5A2.5 2.5 0 0 1 14.5 22"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
    stethoscope: `<svg ${SVG_ATTRS}><path d="M6 3v6a4 4 0 0 0 8 0V3"/><path d="M14 11v3a4 4 0 0 0 8 0v-1"/><circle cx="20" cy="11" r="2"/></svg>`,

    // ─── Экономика / репутация ─────────────────────────────
    dollar: `<svg ${SVG_ATTRS}><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    megaphone: `<svg ${SVG_ATTRS}><path d="M3 11v2a2 2 0 0 0 2 2h1l6 4V5L6 9H5a2 2 0 0 0-2 2z"/><path d="M18 9a3 3 0 0 1 0 6"/><path d="M20 6a7 7 0 0 1 0 12"/></svg>`,
    database: `<svg ${SVG_ATTRS}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.7 4 3 9 3s9-1.3 9-3V5"/><path d="M3 12c0 1.7 4 3 9 3s9-1.3 9-3"/></svg>`,
    coin: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="9"/><path d="M12 7v10"/><path d="M15 9.5a2.5 2.5 0 0 0-2.5-2h-1a2.5 2.5 0 0 0 0 5h1a2.5 2.5 0 0 1 0 5h-1A2.5 2.5 0 0 1 9 14.5"/></svg>`,

    // ─── Файлы / UI ────────────────────────────────────────
    save: `<svg ${SVG_ATTRS}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    upload: `<svg ${SVG_ATTRS}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    download: `<svg ${SVG_ATTRS}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    rotateCcw: `<svg ${SVG_ATTRS}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
    palette: `<svg ${SVG_ATTRS}><circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/><circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/><path d="M12 2a10 10 0 0 0 0 20c1.1 0 2-.9 2-2 0-.5-.2-1-.5-1.3-.3-.4-.5-.8-.5-1.2 0-1 .8-2 2-2h2.5a4 4 0 0 0 4-4 10 10 0 0 0-9.5-9.5z"/></svg>`,
    scrollText: `<svg ${SVG_ATTRS}><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/><path d="M15 8h-5"/><path d="M15 12h-5"/></svg>`,
    x: `<svg ${SVG_ATTRS}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    plus: `<svg ${SVG_ATTRS}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    minus: `<svg ${SVG_ATTRS}><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    check: `<svg ${SVG_ATTRS}><polyline points="20 6 9 17 4 12"/></svg>`,
    pencil: `<svg ${SVG_ATTRS}><path d="M17 3a2.8 2.8 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>`,
    refresh: `<svg ${SVG_ATTRS}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10"/><path d="M20.49 15a9 9 0 0 1-14.85 3.36L1 14"/></svg>`,
    search: `<svg ${SVG_ATTRS}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    trash: `<svg ${SVG_ATTRS}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>`,
    info: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,

    // ─── Персонаж / роли ───────────────────────────────────
    user: `<svg ${SVG_ATTRS}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    users: `<svg ${SVG_ATTRS}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    briefcase: `<svg ${SVG_ATTRS}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>`,
    mask: `<svg ${SVG_ATTRS}><path d="M3 6h18v3c0 4-3 9-9 12-6-3-9-8-9-12z"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/></svg>`,
    bookOpen: `<svg ${SVG_ATTRS}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    eye: `<svg ${SVG_ATTRS}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    cpu: `<svg ${SVG_ATTRS}><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>`,

    // ─── Транспорт / места ─────────────────────────────────
    car: `<svg ${SVG_ATTRS}><path d="M5 17h14M5 17v-5l2-5h10l2 5v5M5 17v2M19 17v2"/><circle cx="7.5" cy="15" r="1.5"/><circle cx="16.5" cy="15" r="1.5"/></svg>`,
    mapPin: `<svg ${SVG_ATTRS}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>`,
    map: `<svg ${SVG_ATTRS}><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,

    // ─── ЮКИ / ИИ / общение ────────────────────────────────
    bot: `<svg ${SVG_ATTRS}><rect x="4" y="7" width="16" height="12" rx="2"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/><path d="M12 2v3"/><circle cx="12" cy="2" r="1"/><line x1="4" y1="12" x2="2" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>`,
    messageSquare: `<svg ${SVG_ATTRS}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    lightbulb: `<svg ${SVG_ATTRS}><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>`,
    dice: `<svg ${SVG_ATTRS}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1" fill="currentColor"/><circle cx="16" cy="8" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>`,
    clipboard: `<svg ${SVG_ATTRS}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>`,
    clipboardList: `<svg ${SVG_ATTRS}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="16" x2="16" y2="16"/></svg>`,
    sparkles: `<svg ${SVG_ATTRS}><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>`,

    // ─── Fallback ──────────────────────────────────────────
    question: `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`
};

/**
 * Возвращает HTML-строку с иконкой.
 * @param {string} name — имя иконки из `icons`
 * @param {object} [opts]
 * @param {number} [opts.size=16] — размер в пикселях
 * @param {string} [opts.className=''] — дополнительные классы
 * @returns {string}
 */
export function icon(name, opts = {}) {
    const { size = 16, className = '' } = opts;
    const svg = icons[name] || icons.question;
    const cls = ['cpr-icon', `cpr-icon-${name}`, className].filter(Boolean).join(' ');
    return `<span class="${cls}" style="width:${size}px;height:${size}px;" aria-hidden="true">${svg}</span>`;
}

/**
 * Заменяет иконки в элементе-контейнере. Ищет `[data-icon]` и подставляет SVG.
 * Удобно для HTML: <span data-icon="pistol" data-icon-size="20"></span>
 */
export function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
        const name = el.getAttribute('data-icon');
        const size = parseInt(el.getAttribute('data-icon-size') || '16', 10);
        const cls = el.getAttribute('data-icon-class') || '';
        el.innerHTML = icons[name] || icons.question;
        el.classList.add('cpr-icon', `cpr-icon-${name}`);
        if (cls) el.classList.add(...cls.split(/\s+/));
        el.style.width = size + 'px';
        el.style.height = size + 'px';
    });
}