// Handle events for bag items
// (Desktop) hover để chọn item, right-click để hiện menu use/drop/research
mouse
    .hand('mouseenter')
    .where('#bag .list .items')
    .do((event) => {
        if (responsive.isMobile) return;
        const $this = $(event.currentTarget);
        const $index = $this.index();
        objDOM.bagItems.removeClass("selecting");
        driver.on('userChoiceItemInBag', { index: $index });
    })

mouse
    .hand('contextmenu')
    .where('#bag .list .items')
    .do((event) => {
        if (responsive.isMobile) return;
        event.preventDefault(); // Ngăn chặn menu ngữ cảnh mặc định của trình duyệt
        driver.on('userContextItemBag', {index: $(event.currentTarget).index() })
    });


// (Mobile) Chạm vào item -> chọn item + hiện menu use/drop/research ngay tại điểm chạm ================
mouse
    .hand('click')
    .where('#bag .list .items')
    .do(function (event) {
        if (!responsive.isMobile) return;
        event.stopPropagation();
        responsive.closeAllPopups();

        const $index = $(this).index();
        objDOM.bagItems.removeClass("selecting");
        driver.on('userChoiceItemInBag', { index: $index });
        driver.on('userContextItemBag', { index: $index });
    });


mouse
    .hand('click')
    .where('#bag .footer-action .use')
    .do(() => {
        driver.on('userEquippedItem');
    });

// Handle equipment removal in the bag
mouse
    .hand('click')
    .where('#bag .equipments .items')
    .do(function () {
        const item = $(this).attr('name');
        driver.on('userRemoveEquipment', { groups: item });
    });

