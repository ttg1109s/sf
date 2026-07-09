// Handle events for land area items
mouse
    .hand('mouseenter')
    .where('#landArea .items')
    .do((event) => {
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
        driver.on('showTool', {
            position: mouse.position(event),
            show: true,
        });
    });

mouse
    .hand('mousedown')
    .where('#landArea .items')
    .do((event) => {
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

