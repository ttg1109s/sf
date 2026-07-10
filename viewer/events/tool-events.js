// Handle events for tools list
mouse
    .hand('click')
    .where('#toolsList .items-tools')
    .do((event) => {
        const $this = $(event.currentTarget);
        const $index = $this.index();
        driver.on('userClickTool', { index: $index + 1 });
        console.log('Selected tool:', registry.control.toolName);

        if (responsive.isMobile) {
            event.stopPropagation();
            responsive.closeAllPopups(); // chọn xong tự đóng dropdown
        }
    });


// (Mobile) Thu gọn toolsList thành 1 nút, bấm để mở dropdown lên trên =================================
mouse
    .hand('click')
    .where('#toolsToggle')
    .do((event) => {
        event.stopPropagation();
        const willOpen = !objDOM.toolListID.hasClass('mobile-open');
        responsive.closeAllPopups(); // đóng mọi popup khác trước, kể cả toolsList đang mở
        if (willOpen) objDOM.toolListID.addClass('mobile-open');
    });

