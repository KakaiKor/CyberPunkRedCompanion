// js/modules/ui/tooltip-positioner.js
// Плавающий тултип для иконок .skill-info-icon.
// Клонирует содержимое скрытого .skill-tooltip и рендерит его
// в document.body — так он гарантированно не перекрывается
// строками таблицы и другими stacking-контекстами.

export function initTooltipPositioning() {
    let currentIcon = null;
    let currentFloating = null;

    document.addEventListener('mouseover', (e) => {
        const icon = e.target.closest && e.target.closest('.skill-info-icon');
        if (!icon) return;
        if (icon === currentIcon) return;
        closeTooltip();
        openTooltip(icon);
        currentIcon = icon;
    });

    document.addEventListener('mouseout', (e) => {
        const icon = e.target.closest && e.target.closest('.skill-info-icon');
        if (!icon) return;
        const related = e.relatedTarget;
        if (related && icon.contains(related)) return;
        if (icon === currentIcon) closeTooltip();
    });

    window.addEventListener('scroll', closeTooltip, true);
    window.addEventListener('resize', closeTooltip);

    function openTooltip(icon) {
        const source = icon.querySelector('.skill-tooltip');
        if (!source) return;

        const floating = source.cloneNode(true);
        floating.classList.add('skill-tooltip-floating');
        floating.classList.remove('skill-tooltip');

        floating.style.top = '-9999px';
        floating.style.left = '-9999px';
        document.body.appendChild(floating);

        const iconRect = icon.getBoundingClientRect();
        const tipRect  = floating.getBoundingClientRect();
        const tipW = tipRect.width;
        const tipH = tipRect.height;

        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const margin = 12;
        const gap    = 10;

        const spaceAbove = iconRect.top - gap - margin;
        const spaceBelow = vh - iconRect.bottom - gap - margin;

        let top, below = false;
        if (spaceAbove >= tipH) {
            top = iconRect.top - tipH - gap;
        } else if (spaceBelow >= tipH) {
            top = iconRect.bottom + gap;
            below = true;
        } else if (spaceAbove > spaceBelow) {
            top = Math.max(margin, iconRect.top - tipH - gap);
        } else {
            top = Math.min(vh - tipH - margin, iconRect.bottom + gap);
            below = true;
        }

        const iconCenterX = iconRect.left + iconRect.width / 2;
        let left = iconCenterX - tipW / 2;
        if (left < margin) left = margin;
        if (left + tipW > vw - margin) left = vw - tipW - margin;

        let arrowLeft = iconCenterX - left;
        arrowLeft = Math.max(14, Math.min(tipW - 14, arrowLeft));

        floating.style.top = top + 'px';
        floating.style.left = left + 'px';
        floating.style.setProperty('--arrow-left', arrowLeft + 'px');

        if (below) floating.classList.add('skill-tooltip-floating--below');

        currentFloating = floating;
    }

    function closeTooltip() {
        if (currentFloating && currentFloating.parentNode) {
            currentFloating.parentNode.removeChild(currentFloating);
        }
        currentFloating = null;
        currentIcon = null;
    }
}