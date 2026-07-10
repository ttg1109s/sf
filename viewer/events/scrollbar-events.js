/* Sự kiện chuột: thanh cuộn tùy chỉnh ============================================================= */

// Lưu ý: drag() window (mouse.js) chạy trên pointerdown kể từ khi hợp nhất Pointer Events.
// pointerdown bắn TRƯỚC mousedown, nên phải stopPropagation() ngay ở pointerdown - nếu chỉ chặn ở
// mousedown như trước, window đã kịp bắt đầu kéo trước khi mousedown chạy tới.
mouse
    .hand('pointerdown')
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
