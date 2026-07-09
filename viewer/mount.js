/* Mount Component ======================================================================
    Gắn nội dung APP_TEMPLATE (viewer/templates/app-template.js) vào #app-root.
    File này PHẢI chạy trước dom.js, vì dom.js dùng jQuery để truy vấn các phần tử
    (#weather, #landArea, #bag, #products, ...) ngay khi được nạp.
========================================================================== */

document.getElementById('app-root').innerHTML = APP_TEMPLATE;
