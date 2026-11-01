/* Sự kiện chuột: chọn danh mục sản phẩm =========================================================== */

mouse
    .hand('click')
    .where('#products .body .tab-content .tab-content-items .items > .d-flex')
    .do(function () {
        const groupName = $(this).attr('name');
        driver.on('userChoiceGroupProducts', { groups: groupName });
    });



// Purchase one unit from the selected product category.
mouse
    .hand('click')
    .where('#products .add-cart')
    .do(function () {
        const item = $(this).closest('.products-list-item').find('.name');
        const group = $(this).closest('.items').attr('name');
        const itemID = Number(item.attr('id'));
        const result = driver.on('userBuyProduct', { group, itemID, quantity: 1 });
        if (result && result.ok) $(this).text('Bought');
    });


mouse
    .hand('click')
    .where('#stock .sell-stock')
    .do(function () {
        const index = Number($(this).attr('data-index'));
        const result = driver.on('userSellStock', { index });
        if (result && result.ok) $(this).text('Sold');
    });
