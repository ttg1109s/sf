/*
    viewer/panels.js — App-launcher + the 5 feature panels ported from the original
    index.html/Viewer.js (Land Details, Weather, Inventory, Stock, Health Care), redesigned
    to match the new 3D scene's parchment/wood palette and a 2.5D-farm-game single-panel-at-a-
    -time pattern (Stardew Valley/Fields of Mistria/Hay Day/My Time at Portia all favor one
    full panel or modal at a time over several independently draggable desktop-style windows,
    so that's the interaction model kept here instead of the old free-drag multi-window one).

    Where real data is safely READABLE without touching driver/registry mutation (registry,
    WUI, inventory contents, stock rows), panels show it for real. Actions that would need the
    driver (equip/use/sell/select-a-plot) stay visual-only placeholders until phase-2 event
    wiring — same rule as hud.js.
*/

import { el } from './dom-utils.js';
import { ConfigSys } from '../controller/config.js';
import { registry } from '../controller/registry.js';
import { WUI } from './compat.js';
import { b } from '../controller/managers.js';
import { db } from '../model/database-instance.js';
import { fb } from '../model/utils.js';
import { timer } from '../model/timer.js';
import { LandMaster } from '../model/land-master.js';
import { SEASON_LABEL, WEEKDAY_LABEL, LAND_STATE_LABEL, WEATHER_CONDITION_LABEL } from './labels.js';

const ICONS = {
    land: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="8" height="8" rx="1.5" stroke-width="2"/><rect x="13" y="3" width="8" height="8" rx="1.5" stroke-width="2"/><rect x="3" y="13" width="8" height="8" rx="1.5" stroke-width="2"/><rect x="13" y="13" width="8" height="8" rx="1.5" stroke-width="2"/></svg>',
    weather: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.5" stroke-width="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.6 4.6l2.1 2.1M17.3 17.3l2.1 2.1M4.6 19.4l2.1-2.1M17.3 6.7l2.1-2.1" stroke-width="2"/></svg>',
    bag: '<svg viewBox="0 0 24 24"><path d="M7 8V6a5 5 0 0 1 10 0v2" stroke-width="2" fill="none"/><path d="M4 8h16l-1.3 12.5a2 2 0 0 1-2 1.5H7.3a2 2 0 0 1-2-1.5z" stroke-width="2" fill="none"/></svg>',
    stock: '<svg viewBox="0 0 24 24"><path d="M3 8l9-5 9 5-9 5-9-5z" stroke-width="2" fill="none"/><path d="M3 8v8l9 5 9-5V8M12 13v8" stroke-width="2" fill="none"/></svg>',
    health: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 5c-2.5 4.6-9.5 9-9.5 9z" stroke-width="2" fill="none"/></svg>',
    close: '<svg viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" stroke-width="2.4"/></svg>',
};

const APPS = [
    { id: 'land-details', label: 'Ruộng đất', icon: ICONS.land },
    { id: 'weather', label: 'Thời tiết', icon: ICONS.weather },
    { id: 'inventory', label: 'Túi đồ', icon: ICONS.bag },
    { id: 'stock', label: 'Kho hàng', icon: ICONS.stock },
    { id: 'health-care', label: 'Sức khoẻ', icon: ICONS.health },
];

function formatMoney(amount) {
    return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' ' + ConfigSys.global.currency;
}

function statRow(label) {
    const row = el('div', 'panel-stat');
    const labelEl = el('div', 'panel-stat-label', label);
    const barTrack = el('div', 'panel-stat-track');
    const barFill = el('div', 'panel-stat-fill');
    const valueEl = el('div', 'panel-stat-value');
    barTrack.appendChild(barFill);
    row.append(labelEl, barTrack, valueEl);
    return { row, barFill, valueEl };
}

function setStat(stat, percent, text) {
    stat.barFill.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    stat.valueEl.textContent = text;
}

function panelShell(title) {
    const panel = el('div', 'panel');
    const header = el('div', 'panel-header');
    const titleEl = el('div', 'panel-title', title);
    const closeButton = el('button', 'panel-close', ICONS.close);
    closeButton.type = 'button';
    header.append(titleEl, closeButton);
    const body = el('div', 'panel-body');
    panel.append(header, body);
    return { panel, body, closeButton };
}

/* ---- Weather panel — real WUI.weatherToday data, 3-hour window (prev/now/next), same shape
   as the original weather widget (it only ever computed those 3 hours, not a full 24h strip). */
function buildWeatherPanel() {
    const { panel, body, closeButton } = panelShell('Thời tiết hôm nay');

    const calendarHeader = el('div', 'weather-calendar');
    const weekdayEl = el('div', 'weather-weekday');
    const dateEl = el('div', 'weather-date');
    calendarHeader.append(weekdayEl, dateEl);

    const hourStrip = el('div', 'weather-hours');

    const footer = el('div', 'weather-footer');
    const humidityEl = el('div', 'weather-footer-item');
    const rainfallEl = el('div', 'weather-footer-item');
    const avgTempEl = el('div', 'weather-footer-item');
    footer.append(humidityEl, rainfallEl, avgTempEl);

    body.append(calendarHeader, hourStrip, footer);

    function refresh() {
        const [, , day] = registry.system.currentDate;
        const cal = timer.calendar(day, 0);
        weekdayEl.textContent = WEEKDAY_LABEL[cal.weekdayName] ?? cal.weekdayName;
        dateEl.textContent = `Tháng ${cal.month}, ngày ${cal.day}`;

        const data = WUI.weatherToday;
        hourStrip.innerHTML = '';
        if (!data) return;

        const hours = Object.keys(data).filter((k) => k !== 'temperatureAvg').map(Number).sort((a, b2) => a - b2);
        const currentHour = registry.system.currentDate[3];

        hours.forEach((hour) => {
            const entry = data[hour];
            const item = el('div', 'weather-hour' + (hour === currentHour ? ' is-now' : ''));
            item.innerHTML = `
                <div class="weather-hour-condition" data-condition="${entry.condition}"></div>
                <div class="weather-hour-temp">${entry.temperature.int}°</div>
                <div class="weather-hour-label">${hour}h</div>
            `;
            hourStrip.appendChild(item);
        });

        const now = data[currentHour];
        humidityEl.textContent = now ? `${fb.number.truncate(now.humidity)}% ẩm` : '—';
        rainfallEl.textContent = now ? `${fb.number.truncate(now.rainfall)}mm/h` : '—';
        avgTempEl.textContent = data.temperatureAvg !== undefined ? `TB ${fb.number.truncate(data.temperatureAvg)}°C` : '—';
    }

    return { panel, closeButton, refresh };
}

/* ---- Land details panel — shows plot #1's real data as a preview (LandMaster.info() is a
   pure read, so this is safe) until a real "select a plot" interaction lands in phase 2.
   Uses its own LandMaster instance (never the shared `l` from managers.js) so this display
   read never disturbs whichever plot the player has actually selected — same separation the
   codebase already uses for loop-events.js's own simulation-tick LandMaster instance. */
function buildLandDetailsPanel() {
    const { panel, body, closeButton } = panelShell('Ruộng đất');

    const note = el('div', 'panel-note', 'Xem trước ô đất #1 — chọn ô đất trên nông trại sẽ có ở bản cập nhật sau.');

    const type = statRow('Loại đất');
    const area = statRow('Diện tích');
    const life = statRow('Độ bền');
    const state = statRow('Trạng thái');
    const water = statRow('Nước');
    const fertility = statRow('Phân bón');

    const plantHeader = el('div', 'panel-subtitle', 'Cây trồng');
    const plantSeed = el('div', 'panel-line');
    const disease = statRow('Sâu bệnh');
    const yieldStat = statRow('Sản lượng');
    const growth = statRow('Thời gian lớn');

    body.append(
        note, type.row, area.row, life.row, state.row, water.row, fertility.row,
        plantHeader, plantSeed, disease.row, yieldStat.row, growth.row
    );

    const previewLand = new LandMaster(0);

    function refresh() {
        if (!previewLand.setIndex(0)) return;
        const data = previewLand.info();
        if (!data) return;

        type.valueEl.textContent = data.type;
        setStat(type, 100, data.type);

        setStat(area, fb.calc.percent(data.slot.cur, data.slot.max), `${fb.number.truncate(data.slot.cur)}/${data.slot.max} m²`);

        const lifePercent = typeof data.life !== 'object' ? fb.calc.percent(data.life, 100) : 100;
        const lifeText = typeof data.life !== 'object' ? `${fb.number.truncate(data.life)}%` : 'Đang tính...';
        setStat(life, lifePercent, lifeText);

        setStat(state, fb.calc.percent(data.state.code, 5), LAND_STATE_LABEL[data.state.name] ?? data.state.name);

        const hasPlant = data.plantID.code !== null;
        setStat(water, hasPlant ? fb.calc.percent(data.water.cur, data.water.max) : 0, hasPlant ? `${fb.number.truncate(data.water.cur, 0)}/${data.water.max} lít` : 'Chưa trồng');

        setStat(fertility, data.fertilizerID === null ? 0 : 100, data.fertilizerID === null ? 'Chưa bón' : 'Đã bón');

        plantSeed.textContent = hasPlant ? `Giống: ${data.plantID.name}` : 'Chưa trồng cây nào';
        setStat(disease, hasPlant ? fb.calc.percent(data.pest, 5) : 0, hasPlant ? `${fb.number.truncate(data.pest, 3)} R%` : '0 R%');
        setStat(yieldStat, 0, hasPlant ? `${fb.number.truncate(data.yield)} gram (ước tính tối đa)` : '0 gram');
        setStat(growth, 0, hasPlant ? 'Đang lớn' : '00d, 00h, 00m');
    }

    return { panel, closeButton, refresh };
}

/* ---- Inventory panel — real equip slots (registry.equipments) + real bag contents (b.load()),
   both pure reads. Use/Sell/equip-toggle stay visual-only until phase 2. */
function buildInventoryPanel() {
    const { panel, body, closeButton } = panelShell('Túi đồ');

    const equipRow = el('div', 'inventory-equip-row');
    ConfigSys.land.tools.filter((t) => t !== 'undefined').forEach((toolName) => {
        const slot = el('div', 'inventory-equip-slot');
        slot.dataset.tool = toolName;
        equipRow.appendChild(slot);
    });

    const grid = el('div', 'inventory-grid');

    body.append(equipRow, grid);

    function refresh() {
        equipRow.querySelectorAll('.inventory-equip-slot').forEach((slot) => {
            const equipped = registry.equipments[slot.dataset.tool];
            slot.classList.toggle('is-equipped', !!equipped);
            slot.title = equipped ? equipped.name : 'Trống';
        });

        grid.innerHTML = '';
        const items = b.load() || [];
        if (!items.length) {
            grid.appendChild(el('div', 'panel-note', 'Túi đồ trống.'));
            return;
        }
        items.forEach((item) => {
            const card = el('div', 'inventory-item');
            card.innerHTML = `
                <div class="inventory-item-name">${item.name}</div>
                <div class="inventory-item-qty">x${item.quantity}</div>
            `;
            grid.appendChild(card);
        });
    }

    return { panel, closeButton, refresh };
}

/* ---- Stock panel — real 'stock' table rows (packed goods ready to sell). Likely empty at the
   very start of a new game, which is shown as a friendly empty state rather than a blank box. */
function buildStockPanel() {
    const { panel, body, closeButton } = panelShell('Kho hàng');
    const grid = el('div', 'stock-grid');
    body.append(grid);

    function refresh() {
        grid.innerHTML = '';
        const rows = db.select('stock', [], ['default', []], '', [], [0, 0])?.data || [];
        if (!rows.length) {
            grid.appendChild(el('div', 'panel-note', 'Kho hàng trống — thu hoạch để có hàng đóng gói ở đây.'));
            return;
        }
        rows.forEach((row) => {
            const card = el('div', 'stock-item');
            card.innerHTML = `
                <div class="stock-item-name">${row.seed}</div>
                <div class="stock-item-detail">${row.quality} · ${row.quantity} gói · ${formatMoney(row.price)}</div>
            `;
            grid.appendChild(card);
        });
    }

    return { panel, closeButton, refresh };
}

/* ---- Health care panel — registry.player stats as bars. The original UI never actually
   designed this screen (just a bare app icon with no window behind it), so this is a fresh
   design guided by the same 2.5D-game convention (energy/HP-style bars) used everywhere else. */
function buildHealthCarePanel() {
    const { panel, body, closeButton } = panelShell('Sức khoẻ');

    const health = statRow('Thể trạng');
    const stamina = statRow('Thể lực');
    const mental = statRow('Tinh thần');

    body.append(health.row, stamina.row, mental.row);

    function refresh() {
        setStat(health, registry.player.health, `${fb.number.truncate(registry.player.health)}%`);
        setStat(stamina, fb.calc.percent(registry.player.stamina[0], registry.player.stamina[1]), `${fb.number.truncate(registry.player.stamina[0])}/${registry.player.stamina[1]}`);
        setStat(mental, fb.calc.percent(registry.player.mental[0], registry.player.mental[1]), `${fb.number.truncate(registry.player.mental[0])}/${registry.player.mental[1]}`);
    }

    return { panel, closeButton, refresh };
}

const PANEL_BUILDERS = {
    'weather': buildWeatherPanel,
    'land-details': buildLandDetailsPanel,
    'inventory': buildInventoryPanel,
    'stock': buildStockPanel,
    'health-care': buildHealthCarePanel,
};

export function buildPanels(root, { menuButton } = {}) {
    const overlay = el('div', 'panel-overlay');
    const launcher = el('div', 'app-launcher');
    const launcherGrid = el('div', 'app-launcher-grid');

    APPS.forEach((app) => {
        const item = el('button', 'app-launcher-item');
        item.type = 'button';
        item.innerHTML = `
            <span class="app-launcher-icon">${app.icon}</span>
            <span class="app-launcher-label">${app.label}</span>
        `;
        item.addEventListener('click', () => openPanel(app.id));
        launcherGrid.appendChild(item);
    });

    const launcherFooter = el('div', 'app-launcher-footer', 'Người chơi 1');
    launcher.append(launcherGrid, launcherFooter);

    const panelInstances = {};
    Object.keys(PANEL_BUILDERS).forEach((id) => {
        const instance = PANEL_BUILDERS[id]();
        instance.closeButton.addEventListener('click', closeAll);
        panelInstances[id] = instance;
    });

    root.append(overlay, launcher, ...Object.values(panelInstances).map((p) => p.panel));

    function closeAll() {
        overlay.classList.remove('is-visible');
        launcher.classList.remove('is-visible');
        Object.values(panelInstances).forEach((p) => p.panel.classList.remove('is-visible'));
    }

    function openLauncher() {
        closeAll();
        overlay.classList.add('is-visible');
        launcher.classList.add('is-visible');
    }

    function openPanel(id) {
        const instance = panelInstances[id];
        if (!instance) return;
        closeAll();
        instance.refresh();
        overlay.classList.add('is-visible');
        instance.panel.classList.add('is-visible');
    }

    overlay.addEventListener('click', closeAll);

    if (menuButton) {
        menuButton.addEventListener('click', () => {
            if (launcher.classList.contains('is-visible')) closeAll();
            else openLauncher();
        });
    }

    return { openPanel, closeAll };
}
