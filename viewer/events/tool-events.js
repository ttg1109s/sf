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
            objDOM.toolListID.removeClass('mobile-open'); // chọn xong tự đóng dropdown
        }
    });


// (Mobile) Thu gọn toolsList thành 1 nút, bấm để mở dropdown lên trên =================================
mouse
    .hand('click')
    .where('#toolsToggle')
    .do((event) => {
        event.stopPropagation();
        landUI.closeActionMenu(); // tránh 2 popup mở cùng lúc
        objDOM.toolListID.toggleClass('mobile-open');
    });

// Chạm ra ngoài dropdown (ở bất kỳ đâu khác trong body) -> đóng dropdown
mouse
    .hand('click')
    .where('body')
    .do(() => {
        if (!responsive.isMobile) return;
        objDOM.toolListID.removeClass('mobile-open');
    });

