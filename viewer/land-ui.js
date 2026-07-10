/* Farmer Show ====================================================================================== */

class LandUI {

    get(data = []) {
        data.forEach(function (value, index) {
            objDOM.areaLandItems.eq(index).attr('state', value.state.name);
        });
    }

    delete(index = -1) {
        if (index === -1) return;
        farmerHoldings.land.splice(index, 1);
        objDOM.areaLandID.find(".land-item").eq(index).remove();
    }

    toolSelected(index) {
        if (!objDOM.toolListItems.eq(index).hasClass('selected')) {
            objDOM.toolListItems.removeClass('selected');
            objDOM.toolListItems.eq(index).addClass('selected');
        } else {
            objDOM.toolListItems.removeClass('selected');
        }
    }

    tools(name, position = { x: 0, y: 0 }, show = false, transform = false) {
        if (!show) {
            objDOM.toolLandID.css({ display: 'none' });
            return false;
        }

        let toolImgPath = `graphic/tool/${name}.png`;
        if (!toolImgPath) toolImgPath = 'graphic/tool/undefined.png';

        objDOM.toolLandID.css({
            cursor: 'none',
            display: 'block',
            backgroundImage: `url(${toolImgPath})`,
            left: position.x - 60 / 2,
            top: position.y - 60 / 2,
        });

        let scale = 1;
        let rotation = 0;
        let translate = { x: -30, y: 30 };

        if (transform) {
            if (["sickle", "fertilizer", "watercan", "bucket", "pesticide"].includes(name)) {
                rotation = -30;
                translate = { x: 0, y: 0 };
            }

            if (name === "seed") {
                translate = { x: 0, y: 20 };
                scale = 0.2;
            }

            if (name === "bucket") {
                translate = { x: -20, y: -20 };
                scale = 1.2;
            }

            if (name === 'undefined') {
                scale = 0.8;
                translate = { x: 0, y: 10 };
            }

            objDOM.toolLandID.css({
                transform: `scale(${scale}) rotate(${rotation}deg) translate(${translate.x}px, ${translate.y}px)`,
            });
        } else {
            objDOM.toolLandID.css({
                transform: `scale(${scale}) rotate(0deg) translate(0px, 0px)`,
            });
        }
    }

    stateUpdate(index, newState) {
        objDOM.areaLandID.find('.items').eq(index).attr('state', newState);
        return true;
    }

    // (Mobile) Layout mới: 1 ô land hiện tại chiếm 1/3 màn trên cùng, điều hướng bằng nút prev/next
    // thay vì menu popup Xem/Canh tác cũ - land-details giờ luôn mở nên không cần "Xem" riêng nữa.

    showMobileCurrent(index) {
        objDOM.areaLandItems.removeClass('current-mobile');
        objDOM.areaLandItems.eq(index).addClass('current-mobile');
    }

    firstUnlockedIndex() {
        let found = -1;
        objDOM.areaLandItems.each(function (i) {
            if (found === -1 && $(this).attr('state') !== 'locked') found = i;
        });
        return found;
    }

    // Gọi 1 lần khi land vừa load xong - chọn sẵn ô đầu tiên đã mở khoá nếu chưa có ô nào đang xem
    initMobileCurrent() {
        if (objDOM.areaLandItems.filter('.current-mobile').length) return -1; // đã có sẵn, không ghi đè
        const first = this.firstUnlockedIndex();
        if (first === -1) return -1;
        this.showMobileCurrent(first);
        return first;
    }

    // direction: 1 (next) hoặc -1 (prev). Bỏ qua ô locked, dừng lại ở đầu/cuối (không xoay vòng).
    // Trả về index mới, hoặc -1 nếu không di chuyển được (đã ở biên, hoặc chưa có ô nào đang xem).
    stepMobileCurrent(direction) {
        const currentIndex = objDOM.areaLandItems.filter('.current-mobile').index();
        if (currentIndex === -1) return -1;

        const total = objDOM.areaLandItems.length;
        let next = currentIndex;

        for (let step = 0; step < total; step++) {
            next += direction;
            if (next < 0 || next >= total) return -1;
            if (objDOM.areaLandItems.eq(next).attr('state') !== 'locked') {
                this.showMobileCurrent(next);
                return next;
            }
        }
        return -1;
    }
}


// Khởi tạo instance
const landUI = new LandUI();
