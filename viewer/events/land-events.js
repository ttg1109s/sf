// Handle events for land area items
// (Desktop) Luồng hover: mouseenter -> mousemove -> mousedown -> mouseup -> mouseleave
mouse
    .hand('mouseenter')
    .where('#landArea .items')
    .do((event) => {
        if (responsive.isMobile) return;
        const $index = mouse.index(event);
        driver.on('userSelectingLand', { index: $index });
        driver.on('showTool', {
            show: true,
        });
    });

mouse
    .hand('mousemove')
    .where('#landArea .items')
    .do((event) => {
        if (responsive.isMobile) return;
        driver.on('showTool', {
            position: mouse.position(event),
            show: true,
        });
    });

mouse
    .hand('mousedown')
    .where('#landArea .items')
    .do((event) => {
        if (responsive.isMobile) return;
        driver.on('showTool', {
            transform: true,
            show: true,
            position: mouse.position(event)
        });
    });

mouse
    .hand('mouseup')
    .where('#landArea .items')
    .do((event) => {
        if (responsive.isMobile) return;
        const $index = mouse.index(event);
        driver.on('userFarmingAction', { index: $index });
        driver.on('showTool', {
            position: mouse.position(event),
            show: true,
            transform: false,
        });
    });

mouse
    .hand('mouseleave')
    .where('#landArea .items')
    .do((event) => {
        if (responsive.isMobile) return;
        const $index = mouse.index(event);
        driver.on('userDeselectLand', { index: $index });
        driver.on('showTool', {
            position: mouse.position(event),
            show: false,
            transform: false,
        });
    });

mouse
    .hand('contextmenu')
    .where('#landArea .items')
    .do((event) => {
        event.preventDefault();
    });


// (Mobile) Chạm vào ô đất -> hiện menu "Xem" / "Canh tác" thay cho luồng hover ========================
mouse
    .hand('click')
    .where('#landArea .items')
    .do(function (event) {
        if (!responsive.isMobile) return;
        event.stopPropagation();
        landUI.openActionMenu($(this).index(), mouse.position(event));
    });

mouse
    .hand('click')
    .where('#landActionMenu .action-view')
    .do((event) => {
        event.stopPropagation();
        driver.on('userSelectingLand', { index: landUI.actionMenuIndex });
        mouse.openWindow('land-details');
        landUI.closeActionMenu();
    });

mouse
    .hand('click')
    .where('#landActionMenu .action-farm')
    .do((event) => {
        event.stopPropagation();
        driver.on('userSelectingLand', { index: landUI.actionMenuIndex });
        driver.on('userFarmingAction', { index: landUI.actionMenuIndex });
        landUI.closeActionMenu();
    });

// Chạm ra ngoài menu (ở bất kỳ đâu khác trong body) -> đóng menu
mouse
    .hand('click')
    .where('body')
    .do(() => {
        if (!responsive.isMobile) return;
        landUI.closeActionMenu();
    });

