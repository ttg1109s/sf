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


// (Mobile) Layout mới: 1 ô land đang xem chiếm 1/3 màn trên cùng, land-details luôn mở ở 2/3 dưới
// (xem responsive.css + landUI.showMobileCurrent/stepMobileCurrent). Không còn menu popup Xem/Canh
// tác - chạm vào ô đang xem = canh tác trực tiếp (tương đương mouseup desktop); điều hướng đổi ô
// bằng nút prev/next thay vì vuốt.
mouse
    .hand('click')
    .where('#landArea .items.current-mobile')
    .do(function () {
        if (!responsive.isMobile) return;
        const index = $(this).index();
        responsive.closeAllPopups();
        driver.on('userSelectingLand', { index });
        driver.on('userFarmingAction', { index });
    });

mouse
    .hand('click')
    .where('#landNavPrev')
    .do(() => {
        if (!responsive.isMobile) return;
        const index = landUI.stepMobileCurrent(-1);
        if (index === -1) return;
        responsive.closeAllPopups();
        driver.on('userSelectingLand', { index });
    });

mouse
    .hand('click')
    .where('#landNavNext')
    .do(() => {
        if (!responsive.isMobile) return;
        const index = landUI.stepMobileCurrent(1);
        if (index === -1) return;
        responsive.closeAllPopups();
        driver.on('userSelectingLand', { index });
    });

