/*
    viewer/hud.js — DOM overlay HUD (top status bar + bottom tool bar), built with plain DOM
    APIs (no jQuery). Reads real values from registry/ConfigSys/WUI so the numbers are correct
    at the moment the page loads, but nothing here reacts to future changes yet (no event
    wiring — this is the phase-1 "build visuals" pass; phase 2 connects it to the driver).

    Vietnamese strings below are the only Vietnamese in this file, matching
    ConfigSys.global.lang === "vn" — all identifiers/comments stay in English per project
    convention.
*/

import { ConfigSys } from '../controller/config.js';
import { registry } from '../controller/registry.js';
import { WUI } from './compat.js';
import { el } from './dom-utils.js';
import { SEASON_LABEL, TOOL_LABEL } from './labels.js';

// Compact geometric line-icon per tool — self-contained inline SVG, no external icon asset.
const TOOL_ICON = {
    shovel: '<svg viewBox="0 0 24 24"><path d="M12 2v13" stroke-width="2"/><path d="M8 15h8l-1.5 5a2.5 2.5 0 0 1-5 0L8 15z" stroke-width="2"/></svg>',
    sickle: '<svg viewBox="0 0 24 24"><path d="M5 20 14 6a5 5 0 1 1 4 2L9 20" stroke-width="2" fill="none"/></svg>',
    fertilizer: '<svg viewBox="0 0 24 24"><path d="M8 4h8l2 4-3 12H9L6 8z" stroke-width="2" fill="none"/><path d="M9 9h6" stroke-width="1.6"/></svg>',
    seed: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="16" rx="2" stroke-width="2" fill="none"/><circle cx="12" cy="12" r="2.4" stroke-width="1.6"/></svg>',
    watercan: '<svg viewBox="0 0 24 24"><path d="M4 10h9v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" stroke-width="2" fill="none"/><path d="M13 11l6-3M17 6l3 1-1 3" stroke-width="2" fill="none"/><path d="M7 10V7h3v3" stroke-width="1.6" fill="none"/></svg>',
    bucket: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-2 12H7z" stroke-width="2" fill="none"/><path d="M7 8a5 3 0 0 1 10 0" stroke-width="2" fill="none"/></svg>',
    pesticide: '<svg viewBox="0 0 24 24"><rect x="9" y="9" width="7" height="12" rx="1.5" stroke-width="2" fill="none"/><path d="M11 9V6h3v3M6 6l3 2" stroke-width="1.8" fill="none"/></svg>',
};

// Menu/apps icon (old #window-app app-show launcher button) and a settings gear
// (old #functions row) — these bookend the tool row exactly like the original task-manager.
const MENU_ICON = '<svg viewBox="0 0 24 24"><rect x="4" y="4" width="7" height="7" rx="1.5" stroke-width="2"/><rect x="13" y="4" width="7" height="7" rx="1.5" stroke-width="2"/><rect x="4" y="13" width="7" height="7" rx="1.5" stroke-width="2"/><rect x="13" y="13" width="7" height="7" rx="1.5" stroke-width="2"/></svg>';
const SETTINGS_ICON = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" stroke-width="2"/><path d="M12 3v2M12 19v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M3 12h2M19 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke-width="2"/></svg>';

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ' + ConfigSys.global.currency;
}

export function buildHud(root) {
    const topBar = el('div', 'hud-topbar');

    const dayBadge = el('div', 'hud-badge hud-day');
    const seasonBadge = el('div', 'hud-badge hud-season');
    const moneyBadge = el('div', 'hud-badge hud-money');

    topBar.append(dayBadge, seasonBadge, moneyBadge);

    const toolbar = el('div', 'hud-toolbar');

    const menuButton = el('button', 'hud-bookend hud-menu-button');
    menuButton.type = 'button';
    menuButton.innerHTML = `<span class="hud-tool-icon">${MENU_ICON}</span>`;
    toolbar.appendChild(menuButton);

    const toolRow = el('div', 'hud-tool-row');
    const tools = ConfigSys.land.tools.filter((name) => name !== 'undefined');
    const buttons = {};

    tools.forEach((name) => {
        const button = el('button', 'hud-tool');
        button.type = 'button';
        button.dataset.tool = name;
        button.innerHTML = `
            <span class="hud-tool-icon">${TOOL_ICON[name] ?? ''}</span>
            <span class="hud-tool-label">${TOOL_LABEL[name] ?? name}</span>
        `;
        // Visual-only local toggle for now — no driver.on() call yet (phase 2 wiring).
        button.addEventListener('click', () => {
            const alreadySelected = button.classList.contains('is-selected');
            toolRow.querySelectorAll('.hud-tool').forEach((b) => b.classList.remove('is-selected'));
            if (!alreadySelected) button.classList.add('is-selected');
        });
        toolRow.appendChild(button);
        buttons[name] = button;
    });
    toolbar.appendChild(toolRow);

    const settingsButton = el('button', 'hud-bookend hud-settings-button');
    settingsButton.type = 'button';
    settingsButton.innerHTML = `<span class="hud-tool-icon">${SETTINGS_ICON}</span>`;
    toolbar.appendChild(settingsButton);

    root.append(topBar, toolbar);

    function refresh() {
        const [, , day] = registry.system.currentDate;
        dayBadge.textContent = `Ngày ${day}`;
        seasonBadge.textContent = SEASON_LABEL[registry.system.season] ?? registry.system.season;
        moneyBadge.textContent = formatMoney(registry.player.money);
    }

    refresh();

    return { refresh, buttons, menuButton, settingsButton };
}
