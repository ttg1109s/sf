/* Sự kiện chuột: thanh cuộn tùy chỉnh ============================================================= */

mouse
    .hand('mousedown')
    .where('.scrollbar input[type="range"]')
    .do((event) => {
        event.stopPropagation();
    });

mouse
    .hand('change input scroll')
    .where('.scrollbar input[type="range"]')
    .do((event) => {
        console.log('Scrollbar changed');
        const $this = $(event.currentTarget);
        const nameScroll = $this.attr('name-scrollbar');
        const findObj = objDOM.scrollPlace.filter(`[name-scrollbar="${nameScroll}"]`);
        if (!findObj.length) return false;
        const maxScroll = findObj[0].scrollHeight - findObj.outerHeight();
        const scrollValue = ($this.val() / 100) * maxScroll;
        findObj.scrollTop(scrollValue);
        
    });
