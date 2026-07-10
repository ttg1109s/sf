/* Phát hiện & quản lý chế độ mobile ===================================================================
   - "Mobile" = màn hình hẹp (<= breakpoint) HOẶC thiết bị không có hover + chạm thô (pointer: coarse).
   - Kết hợp cả 2 điều kiện để không bỏ sót tablet cầm ngang màn hình rộng.
   - Các module khác (mouse.js, land-events.js, tool-events.js...) đọc responsive.isMobile để rẽ nhánh
     hành vi, không tự ý kiểm tra window.innerWidth riêng lẻ.
   ====================================================================================================== */

class Responsive {
    constructor() {
        this.breakpoint = 768; // px - ngưỡng chiều rộng coi là mobile
        this.isMobile = false;
        this.listeners = []; // callback(isMobile) khi trạng thái thay đổi

        this.mql = window.matchMedia(
            `(max-width: ${this.breakpoint}px), (hover: none) and (pointer: coarse)`
        );

        this.check();
        this.bindChange();
    }

    check() {
        const wasMobile = this.isMobile;
        this.isMobile = this.mql.matches;
        $('body').toggleClass('is-mobile', this.isMobile);

        if (wasMobile !== this.isMobile) {
            this.notify();
        }

        return this.isMobile;
    }

    bindChange() {
        // matchMedia tự bắn sự kiện khi resize / xoay màn hình, không cần resize listener riêng
        if (this.mql.addEventListener) {
            this.mql.addEventListener('change', () => this.check());
        } else if (this.mql.addListener) {
            this.mql.addListener(() => this.check()); // fallback cho Safari cũ
        }
    }

    onChange(callback) {
        if (typeof callback === 'function') this.listeners.push(callback);
    }

    notify() {
        this.listeners.forEach((cb) => cb(this.isMobile));
    }

    // Đóng tất cả popup mobile (menu land, dropdown tool, context menu bag).
    // Gọi trước khi mở 1 popup mới, và khi chạm ra ngoài - tránh nhiều popup chồng nhau.
    closeAllPopups() {
        if (typeof landUI !== 'undefined') landUI.closeActionMenu();
        if (typeof objDOM !== 'undefined') {
            objDOM.toolListID.removeClass('mobile-open');
            objDOM.bagContextMenu.addClass('d-none');
        }
    }
}

const responsive = new Responsive();
