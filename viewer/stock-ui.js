/* Giao diện kho nông sản. Dữ liệu được escape trước khi đưa vào HTML. */
class StockUI {
    constructor() { this.filter = 'all'; }
    #escape(value) {
        return String(value ?? '').replace(/[&<>"']/g, char => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[char]));
    }
    #number(value) {
        return (Number(value) || 0).toLocaleString('vi-VN', { maximumFractionDigits: 2 });
    }
    #date(value) {
        const date = new Date(Number(value));
        return Number.isNaN(date.getTime()) ? 'Không rõ' : date.toLocaleString('vi-VN');
    }
    render() {
        const rows = s.list(this.filter);
        const history = s.history(30);
        const balance = this.#number(registry.player.money);
        $('#stock-balance').text(balance + ' ₫');
        $('#stock-count').text(this.#number(rows.filter(row => row.status === 'fresh').reduce((sum, row) => sum + (Number(row.quantity) || 0), 0)));
        $('#stock-filters .stock-filter').removeClass('active')
            .filter('[data-status="' + this.filter + '"]').addClass('active');

        if (!rows.length) {
            $('#stock-list').html('<div class="stock-empty">Kho chưa có lô hàng phù hợp.</div>');
        } else {
            $('#stock-list').html(rows.map(row => {
                const expired = row.status === 'expired';
                const remaining = Math.max(0, Number(row.end) - Date.now());
                const statusLabel = row.status === 'fresh' ? 'Còn hạn' :
                    row.status === 'expired' ? 'Hết hạn' : row.status === 'sold' ? 'Đã bán' : 'Đã hủy';
                return '<article class="stock-row ' + this.#escape(row.status) + '">' +
                    '<div class="stock-row-head"><strong>' + this.#escape(row.seed) + '</strong><span class="stock-status">' + statusLabel + '</span></div>' +
                    '<div class="stock-meta">Nhóm: ' + this.#escape(row.group) + ' · Phẩm cấp: ' + this.#escape(row.qualityGrade || 'B') +
                    ' (' + this.#number(row.quality) + '/100)</div>' +
                    '<div class="stock-meta">Phân bón: ' + this.#escape(row.fertilizer || 'Không dùng') +
                    ' · Số lượng: <b>' + this.#number(row.quantity) + '</b></div>' +
                    '<div class="stock-meta">Đơn giá: ' + this.#number(row.unitPrice) + ' ₫ · Giá trị lô: ' + this.#number(row.price) + ' ₫</div>' +
                    '<div class="stock-meta">Nhập: ' + this.#date(row.start) + ' · Hết hạn: ' + this.#date(row.end) + '</div>' +
                    (row.status === 'fresh' ? '<div class="stock-actions"><input type="number" min="0.01" step="0.01" max="' + this.#escape(row.quantity) + '" value="' + this.#escape(row.quantity) + '" aria-label="Số lượng thao tác">' +
                    '<button class="stock-sell" data-index="' + row._index + '">Bán</button>' +
                    '<button class="stock-discard" data-index="' + row._index + '">Hủy lô</button></div>' :
                    expired && Number(row.quantity) > 0 ? '<div class="stock-actions"><input type="number" min="0.01" step="0.01" max="' + this.#escape(row.quantity) + '" value="' + this.#escape(row.quantity) + '" aria-label="Số lượng hủy">' +
                    '<button class="stock-discard" data-index="' + row._index + '">Hủy hàng hết hạn</button></div>' : '') +
                    (row.status === 'fresh' && remaining < 86400000 ? '<div class="stock-warning">Sắp hết hạn trong vòng 24 giờ.</div>' : '') +
                    '</article>';
            }).join(''));
        }

        $('#stock-history').html(history.length ? history.slice().reverse().map(item =>
            '<div class="stock-history-row"><b>' + this.#escape(item.type) + '</b> · ' +
            this.#escape(item.seed) + ' · ' + this.#number(item.quantity) +
            ' · ' + this.#date(item.timestamp) +
            (Number(item.total) > 0 ? ' · ' + this.#number(item.total) + ' ₫' : '') + '</div>'
        ).join('') : '<div class="stock-empty">Chưa có giao dịch kho.</div>');
    }
    setFilter(filter) {
        this.filter = ['all', 'fresh', 'expired', 'sold', 'discarded'].includes(filter) ? filter : 'all';
        this.render();
    }
}
const stockUI = new StockUI();
