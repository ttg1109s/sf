/* Sự kiện chuột: chọn danh mục sản phẩm =========================================================== */

mouse
    .hand('click')
    .where('#products .body .tab-content .tab-content-items .items')
    .do(function () {
        const groupName = $(this).attr('name');
        driver.on('userChoiceGroupProducts', { groups: groupName });
    });

