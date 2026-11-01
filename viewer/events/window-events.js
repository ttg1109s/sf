/* Sự kiện chuột: kéo/đóng/mở cửa sổ và app switcher =============================================== */

let windows = mouse.where('.window').drag(true);


mouse.hand('click')
    .where('.window .close')
    .do(function () {
        const windowName = $(this).closest('.window').attr('name');
        const windowSelector = objDOM.window.filter(`[name="${windowName}"]`);
        if (!windowSelector.length) return false;
        mouse.window[windowName] = false;
        if (windowName === 'weather') WUI.scroll = false;
        if (windowName === 'nation-products-center') productUI.delete();
        windowSelector.removeClass('maximize');
        windowSelector.addClass('minimize');
        setTimeout(() => { windowSelector.hide(); }, 200);
    });

mouse.hand('click')
    .where('#app-show .app-list .items')
    .do(function () {
        const windowName = $(this).attr('name');
        if (!mouse.openWindow(windowName)) return false;
        $('#window-app .app-show').trigger('click');
    });

mouse.hand('click')
    .where('#window-app .app-show')
    .do(function () {
        let height, opacity;

        if (mouse.appShowing) return false;
        mouse.appShowing = true;
        
        if (mouse.appShow) {
            mouse.appShow = false;
            opacity = 0;
            height = -100 + '%';
        } else {
            mouse.appShow = true;
            height = 60 + 'px';
            opacity = 1;
        }

        $('#app-show').animate({
            bottom: height,
            opacity: opacity
        }, 300, function() {
            mouse.appShowing = false;
        });
    });

mouse.hand('click')
    .where('#app-show .user-info .user-save')
    .do(() => {
        driver.on('saveGame');
    });

$(window).on('focus', () => {
    WUI.scroll = true; // Kích hoạt scroll khi tab được focus
    console.log('Tab is active, WUI.scroll set to true');
});

$(window).on('blur', () => {
    WUI.scroll = false; // Ngừng scroll khi tab bị mất focus
    console.log('Tab is inactive, WUI.scroll set to false');
});