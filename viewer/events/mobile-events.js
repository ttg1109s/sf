/* Sự kiện chuột: đóng popup mobile khi chạm ra ngoài (dùng chung cho land menu, tools dropdown,
   bag context menu - mỗi popup tự stopPropagation() khi mở/chọn nên handler này chỉ chạy khi chạm
   thật sự ra ngoài mọi popup) ========================================================================= */

mouse
    .hand('click')
    .where('body')
    .do(() => {
        if (!responsive.isMobile) return;
        responsive.closeAllPopups();
    });
