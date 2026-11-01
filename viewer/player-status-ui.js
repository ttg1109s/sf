/* Player status and attribute allocation panel. */
class PlayerStatusUI {
    render() {
        const p = registry.player;
        if (!p) return;
        $('#player-status .player-summary').html(
            `<div>Level ${p.level} · ${Number(p.experience?.[0] || 0).toFixed(1)}/${Number(p.experience?.[1] || 0)} XP</div>
             <div>Money: ${Number(p.money || 0).toLocaleString()} VND</div>
             <div>Stamina: ${Math.floor(p.stamina?.[0] || 0)}/${p.stamina?.[1] || 0}</div>
             <div>Mental: ${Math.floor(p.mental?.[0] || 0)}/${p.mental?.[1] || 0}</div>
             <div>Attribute points: ${p.attrPoints || 0}</div>`
        );
        const attrs = ['strength', 'dexterity', 'intelligence', 'endurance'];
        $('#player-status .player-attributes').html(attrs.map(key =>
            `<div class="d-flex justify-content-between align-items-center">
                <span>${key}: ${p[key]}</span>
                <button type="button" class="attribute-increase" data-attribute="${key}" ${(p.attrPoints || 0) < 1 || p[key] >= 1000 ? 'disabled' : ''}>+1</button>
            </div>`
        ).join(''));
    }
}
const playerStatusUI = new PlayerStatusUI();
