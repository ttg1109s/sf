/* Sự kiện thao tác kho nông sản. */
$(document).on('click', '#stock-filters .stock-filter', function () {
    stockUI.setFilter($(this).attr('data-status'));
});
$(document).on('click', '#stock .stock-sell', function () {
    const index = Number($(this).attr('data-index'));
    const quantity = Number($(this).siblings('input').val());
    try {
        const result = s.sell(index, quantity);
        driver.on('stockLoad');
        console.info('Đã bán nông sản:', result);
    } catch (error) {
        window.alert(error.message);
    }
});
$(document).on('click', '#stock .stock-discard', function () {
    const index = Number($(this).attr('data-index'));
    const quantity = Number($(this).siblings('input').val());
    if (!window.confirm('Xác nhận hủy số lượng nông sản đã chọn?')) return;
    try {
        s.discard(index, quantity);
        driver.on('stockLoad');
    } catch (error) {
        window.alert(error.message);
    }
});
