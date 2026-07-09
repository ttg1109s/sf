/* Cập nhật giao diện túi đồ (bag) ================================================================= */

class BagUI {
    choiceItem(index = -1) {
        const $this = objDOM.bagItems.eq(index);
        if (!$this.hasClass("selecting")) {
            $this.addClass("selecting");
        } else {
            $this.removeClass("selecting");
        }
        objDOM.bagContextMenu.addClass('d-none');
        return true;
    }

    showContext(index = -1) {

        const $parent = objDOM.bagID; // Lấy phần tử cha
        const parentOffset = $parent.offset(); // Lấy vị trí của phần tử cha
        const mouseX = event.pageX - parentOffset.left; // Tính vị trí X tương đối
        const mouseY = event.pageY - parentOffset.top; // Tính vị trí Y tương đối

        objDOM.bagContextMenu.removeClass('d-none');
        // Cập nhật vị trí và hiển thị menu
        objDOM.bagContextMenu.css({
            top: mouseY + 'px',
            left: mouseX + 'px',
        });

    }

    equipments(group, hasEquipments) {
        if (hasEquipments) {
            objDOM.bagEquiments.find(`[name="${group}"]`).attr('status', 'equipped');
        } else {
            objDOM.bagEquiments.find(`[name="${group}"]`).attr('status', 'empty');
        }

    }

    reload(data = []) {
        if (!data || !data.length) {
            objDOM.bagItems.attr('name', '');
            objDOM.bagItemsName.text('Empty');
            objDOM.bagItemsQuantity.text('0');
            return false;
        }

        objDOM.bagItems.attr('name', '');
        objDOM.bagItemsName.text('Empty');
        objDOM.bagItemsQuantity.text('0');

        data.forEach((item, index) => {
            objDOM.bagItems.eq(index).attr('name', item.groups);
            objDOM.bagItemsName.eq(index).text(item.name);
            objDOM.bagItemsQuantity.eq(index).text(item.quantity);
        });
    }
    
}


// Khởi tạo instance
const bagUI = new BagUI();
