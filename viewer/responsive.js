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
            if (this.isMobile) this.hideDefaultWindows();
            this.notify();
        }

        return this.isMobile;
    }

    // Mobile: window là fullscreen, không có window nào mở mặc định (#weather/#landInfo không có
    // d-none sẵn trong template, khác #bag/#products). Gọi mỗi khi CHUYỂN SANG mobile (kể cả lần
    // check() đầu tiên lúc khởi tạo) - không chỉ 1 lần trong Mouse constructor - để không bị lỡ nếu
    // responsive.isMobile chưa kịp đúng ngay thời điểm Mouse khởi tạo.
    hideDefaultWindows() {
        if (typeof objDOM !== 'undefined' && objDOM.window) {
            objDOM.window.addClass('d-none');
        }
        if (typeof mouse !== 'undefined') {
            mouse.window = {};
        }
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

    // Đóng tất cả popup mobile (dropdown tool, context menu bag).
    // Gọi trước khi mở 1 popup mới, và khi chạm ra ngoài - tránh nhiều popup chồng nhau.
    closeAllPopups() {
        if (typeof objDOM !== 'undefined') {
            objDOM.toolListID.removeClass('mobile-open');
            objDOM.bagContextMenu.addClass('d-none');
        }
    }
}

const responsive = new Responsive();
