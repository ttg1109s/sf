/* Stock window renderer and sale controls. */
class StockUI {
    render(rows = []) {
        const $list = $('#stock .stock-list');
        if (!rows || !rows.length) {
            $list.html('<div class="empty-stock">No harvested goods in stock.</div>');
            return;
        }
        const html = rows.map((row, index) => {
            const expired = row.end <= Date.now();
            return `<div class="stock-row d-flex justify-content-between align-items-center mb-2" data-index="${index}">
                <div class="stock-info">
                    <strong>${row.seed}</strong>
                    <div>${Number(row.quantity).toLocaleString()} g · ${Number(row.price).toLocaleString()} VND/kg</div>
                    <small>${expired ? 'Expired' : 'Fresh until ' + new Date(row.end).toLocaleString()}</small>
                </div>
                <button type="button" class="sell-stock" data-index="${index}" ${expired ? 'disabled' : ''}>Sell all</button>
            </div>`;
        }).join('');
        $list.html(html);
    }
}
const stockUI = new StockUI();
