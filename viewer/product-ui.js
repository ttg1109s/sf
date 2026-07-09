/* Cập nhật giao diện trung tâm sản phẩm (products) ================================================ */

class ProductUI {

    constructor() {
        this.data = {};
        this.more = {};
        this.component = '';
    }
    #html = {
        groupList(data = {}) {
            return `<div class="items" name="${data.group}">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="group-name icon-before">${data.group}</div>
                    <div class="count">${data.count}</div>
                </div>
                <div class="products-list"></div>
            </div>`;
        },

        showList(data = {}) {
            return `<div class="products-list-item">
                <div class="d-flex justify-content-between align-items-center">
                    <div class="d-flex justify-content-between w-75 align-items-center">
                        <div class="name" id="${data.id}">${data.name}</div>
                    </div>
                    <div class="action d-flex justify-content-between align-items-center">
                        <div class="add-cart icon-before"></div>
                    </div>
                </div>
            </div>`;
        }
    }

    #group() {

        let groupHTML = '';

        Object.keys(this.data).forEach((key) => {
            const data = {
                group: key,
                count: this.data[key],
            };
            groupHTML += this.#html.groupList(data);
            
        });

        objDOM.productBodyTabsItems.filter(`[tab-content="category"]`).html(groupHTML);
    }

    #items() {
        let itemsHTML = '';
        Object.keys(this.data).forEach((item) => {
            itemsHTML += this.#html.showList(this.data[item]);
        });
        objDOM.productBodyTabsItems.find(`.items[name="${this.more.group}"] .products-list`).html(itemsHTML);
    }

    load(data = {}, more = {}) {
        this.data = data;
        this.more = more;
        return this;
    }

    render(component) {

        const listComponents = {
            group: () => { this.#group(); },
            items: () => { this.#items(); },
        };

        if (listComponents[component]) {
            listComponents[component]();
        } else {
            console.warn(`Component "${component}" is not defined.`);
        }
    }

    delete(component, more = {}) {
        const deleteComponents = {
            group: () => {
                objDOM.productBodyTabsItems.html('');
            },
            items: () => {
                objDOM.productBodyTabsItems.find(`.items[name="${more.group}"] .products-list`).html('');
            },
        };

        if (deleteComponents[component]) {
            deleteComponents[component]();
        } else {
            console.warn(`Component "${component}" is not defined for deletion.`);
        }
    }

}

// Khởi tạo instance
const productUI = new ProductUI();
