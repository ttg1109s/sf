/* Farmer Show ====================================================================================== */

class LandUI {

    constructor() {
        this.actionMenuIndex = -1; // Ô đất đang mở menu "Xem/Canh tác" trên mobile, -1 = đang đóng
    }

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

    openActionMenu(index, position) {
        this.actionMenuIndex = index;

        objDOM.landActionFarm.toggleClass('d-none', !registry.control.toolSelected);
        objDOM.landActionMenuID.removeClass('d-none');

        const mainOffset = objDOM.mainID.offset();
        const menuWidth = objDOM.landActionMenuID.outerWidth();
        const menuHeight = objDOM.landActionMenuID.outerHeight();

        objDOM.landActionMenuID.css({
            left: position.x - mainOffset.left - (menuWidth / 2),
            top: position.y - mainOffset.top - menuHeight - 12, // hiện phía trên điểm chạm, tránh ngón tay che menu
        });
    }

    closeActionMenu() {
        this.actionMenuIndex = -1;
        objDOM.landActionMenuID.addClass('d-none');
    }
}


// Khởi tạo instance
const landUI = new LandUI();
