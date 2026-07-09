// Handle events for tools list
mouse
    .hand('click')
    .where('#toolsList .items-tools')
    .do((event) => {
        const $this = $(event.currentTarget);
        const $index = $this.index();
        driver.on('userClickTool', { index: $index + 1 });
        console.log('Selected tool:', registry.control.toolName);
    });

