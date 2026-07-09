/* Event Handling ====================================================================================== */


class Mouse {
    constructor() {
        this.isDragging = false;
        this.dragTarget = null;
        this.offset = { x: 0, y: 0 };
        this.originalOffset = null;
        this.map = {};
        this.eventHandlers = []; // Lưu trữ các sự kiện đã gắn
        this.appShow = false;
        this.appShowing = false;
        this.appShowHeight = 0;
        this.window = {
            'land-details': true,
            'weather': true,
        }

        // Các thông số tùy chỉnh cho drag với giá trị mặc định
        this.dragConfig = {
            leftBoundary: 1.5,
            rightBoundary: 2.5,
            topBoundary: 1.2,
            bottomBoundary: 2.5
        };
    }

    hand(event) {
        this.currentEvent = event;
        return this;
    }

    where(selector) {
        if (!this.map) {
            this.map = {};
        }
        this.map[selector] = selector;
        this.currentSelector = selector;
        return this;
    }

    do(action) {
        if (!this.currentSelector) {
            console.warn('Selector must be defined before attaching an action.');
            return this;
        }

        if (typeof action === 'function') {
            const handler = { event: this.currentEvent, selector: this.currentSelector, action };
            this.eventHandlers.push(handler); // Lưu sự kiện vào danh sách
            $(document).on(this.currentEvent, this.currentSelector, action);
        } else if (typeof action === 'string' && typeof this[action] === 'function') {
            const boundAction = this[action].bind(this);
            const handler = { event: this.currentEvent, selector: this.currentSelector, action: boundAction };
            this.eventHandlers.push(handler); // Lưu sự kiện vào danh sách
            $(document).on(this.currentEvent, this.currentSelector, boundAction);
        }

        return this;
    }

    destroy() {
        // Hủy tất cả các sự kiện đã gắn
        for (const handler of this.eventHandlers) {
            $(document).off(handler.event, handler.selector, handler.action);
        }
        console.log('All mouse events destroyed.');
    }

    restore() {
        // Gắn lại tất cả các sự kiện đã lưu
        for (const handler of this.eventHandlers) {
            $(document).on(handler.event, handler.selector, handler.action);
        }
        console.log('All mouse events restored.');
    }

    drag(enable, dragCallback = null, config = { leftBoundary: 1.5, rightBoundary: 2.5, topBoundary: 1.2, bottomBoundary: 2.5 }) {
        if (!this.currentSelector) {
            console.warn('Selector must be defined before enabling drag.');
            return this;
        }

        // Cập nhật cấu hình drag nếu được cung cấp, sử dụng giá trị mặc định nếu không có
        this.dragConfig = { ...this.dragConfig, ...config };

        const selector = this.currentSelector; // Lấy selector hiện tại từ map

        if (enable) {
            $(document).on('mousedown', selector, (e) => {
                this.startDrag(selector, e.currentTarget, e);
                e.preventDefault();
            });

            $(document).on('mousemove', (e) => {
                if (this.isDragging) {
                    this.performDrag(e);
                    if (typeof dragCallback === 'function') {
                        dragCallback();
                    }
                }
            });

            $(document).on('mouseup', () => {
                this.stopDrag();
            });
        } else {
            $(document).off('mousedown', selector);
            $(document).off('mousemove');
            $(document).off('mouseup');
        }

        return this;
    }

    comeback(enable, callback = null) {
        if (!this.currentSelector) {
            console.warn('Selector must be defined before enabling comeback.');
            return this;
        }

        if (enable) {
            $(document).on('mouseup', this.currentSelector, (e) => {
                const $target = $(e.currentTarget);
                const originalPosition = $target.data('originalPosition');

                if (originalPosition) {
                    this.stopDrag();
                    const position = $target.css('position') === 'absolute';
                    $target.animate({
                        top: position ? originalPosition.top : 0,
                        left: position ? originalPosition.left : 0
                    }, 300); // Return to original position in 300ms
                }
            });

            $(document).on('mousedown', this.currentSelector, (e) => {
                const $target = $(e.currentTarget);
                if (!$target.data('originalPosition')) {
                    $target.data('originalPosition', $target.position());
                }
            });
        } else {
            $(document).off('mouseup', this.currentSelector);
            $(document).off('mousedown', this.currentSelector);
        }

        return this;
    }

    performDrag(event) {
        if (!this.isDragging || !this.dragTarget || !event) return;

        const windowPos = this.dragTarget.offset();
        const dragTargetWidth = this.dragTarget.outerWidth();
        const dragTargetHeight = this.dragTarget.outerHeight();
        const windowWidth = $(window).width();
        const windowHeight = $(window).height();

        const { leftBoundary, rightBoundary, topBoundary, bottomBoundary } = this.dragConfig;

        // Kiểm tra rìa và cập nhật offset
        if (windowPos.left + dragTargetWidth / leftBoundary < 0) {
            this.offset.x = event.pageX + dragTargetWidth / leftBoundary;
        } else if (windowPos.left + dragTargetWidth / rightBoundary > windowWidth) {
            this.offset.x = event.pageX - windowWidth + dragTargetWidth / rightBoundary;
        }

        if (windowPos.top + dragTargetHeight / topBoundary < 0) {
            this.offset.y = event.pageY + dragTargetHeight / topBoundary;
        } else if (windowPos.top + dragTargetHeight / bottomBoundary > windowHeight) {
            this.offset.y = event.pageY - windowHeight + dragTargetHeight / bottomBoundary;
        }

        // Tính toán vị trí mới
        const newLeft = event.pageX - this.offset.x;
        const newTop = event.pageY - this.offset.y;

        this.dragTarget.offset({ top: newTop, left: newLeft });
    }

    startDrag(selector, target, event) {
        const $target = $(target);
        if ($target.length === 0 || !event) return;

        this.dragTarget = $target;
        const { left, top } = this.dragTarget.offset();
        this.offset = { x: event.pageX - left, y: event.pageY - top };

        this.dragTimeout = setTimeout(() => {
            this.isDragging = true;

            if (this.dragTarget) {
                $(selector).css('zIndex', 1); // Áp dụng CSS cho selector hiện tại
                this.dragTarget.css('zIndex', 2);
            }
        }, 200);
    }

    stopDrag() {
        clearTimeout(this.dragTimeout);
        this.isDragging = false;

        if (this.dragTarget) {
            this.dragTarget = null;
        }
    }

    index(event) {
        const $this = $(event.currentTarget);
        return $this.index();
    }

    position(event) {
        return { x: event.pageX, y: event.pageY };
    }
}

// Refactored mouse event handling using the new Mouse class with drag-and-drop logic
const mouse = new Mouse();
