// Handle events for bag items
mouse
    .hand('mouseenter')
    .where('#bag .list .items')
    .do((event) => {
        const $this = $(event.currentTarget);
        const $index = $this.index();
        objDOM.bagItems.removeClass("selecting");
        driver.on('userChoiceItemInBag', { index: $index });
    })

mouse
    .hand('contextmenu')
    .where('#bag .list .items')
    .do((event) => {
        event.preventDefault(); // Ngăn chặn menu ngữ cảnh mặc định của trình duyệt
        driver.on('userContextItemBag', {index: $(event.currentTarget).index() })
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

