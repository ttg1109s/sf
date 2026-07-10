/* Component chính của ứng dụng - nội dung HTML được Viewer mount vào #app-root */

const APP_TEMPLATE = `
    <div id="wrapper" class="d-flex justify-content-between vh-100">
        <div id="weather" class="window position-absolute" name="weather">
            <div class="header">
                <div class="icon-before app-title" name="weather">Weather Today</div>
                <div class="icon-before close"></div>
            </div>
            <div class="p-3">
                <div class="weather-header">
                    <div class="background spring position-absolute position-full-size"></div>
                    <div class="information position-absolute position-full-size">
                        <div class="p-3 m-2">
                            <div class="calendar-weeks">Thứ hai</div>
                            <div class="calendar-info">Tháng 4, 30</div>
                        </div>
                    </div>
                    <div>
                        <div class="hook position-absolute"></div>
                        <div class="hook position-absolute"></div>
                    </div>
                </div>
                <div class="weather-body d-flex">
                    <div class="items d-flex flex-column align-items-center">
                        <span class="condition" name="sunny"></span>
                        <h1 class="temperature">25</h1>
                        <span class="hours">11h</span>
                    </div>
                    <div class="items active d-flex flex-column align-items-center">
                        <span class="condition" name="rain"></span>
                        <h1 class="temperature">25</h1>
                        <span class="hours">12h</span>
                    </div>
                    <div class="items d-flex flex-column align-items-center">
                        <span class="condition" name="sunny"></span>
                        <h1 class="temperature">25</h1>
                        <span class="hours">13h</span>
                    </div>
                </div>
                <div class="weather-footer bg-white p-1 d-flex justify-content-around">
                    <div class="humidity d-flex flex-column align-items-center">
                        <span class="icon-before">00.00%</span>
                    </div>
                    <div class="amount d-flex flex-column align-items-center">
                        <span class="icon-before">00mm/h</span>
                    </div>
                    <div class="temperature-average d-flex flex-column align-items-center">
                        <span class="icon-before">25&#8451;</span>
                    </div>
                </div>
            </div>
        </div>
        <div id="main" class="position-relative">
            <div id="landArea" class="position-absolute position-center-translate d-flex justify-content-center flex-wrap">
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
                <div class="items" state="locked"></div>
            </div>
            <div id="landActionMenu" class="position-absolute d-none">
                <div class="items action-view">Xem</div>
                <div class="items action-farm d-none">Canh tác</div>
            </div>
        </div>
        <div id="landInfo" class="window" name="land-details">
            <div class="header">
                <div class="icon-before app-title" name="land-details">Land Details</div>
                <div class="icon-before close"></div>
            </div>
            <div class="information d-flex flex-column p-3">
        
                <div class="d-flex align-items-center mb-2">
                    <div class="land-type w-100 position-relative d-flex justify-content-between align-items-center">
                    <div class="icon-before">Type:</div>
                    <div class="sub-info">N/A</div>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <div class="land-slot w-100 position-relative d-flex justify-content-between align-items-center">
                    <div class="icon-before">Area:</div>
                    <div class="progress w-75 ms-2">
                        <div class="progress-bar progress-bar-striped bg-slot">
                        <div class="position-absolute position-center-translate p-2 sub-info">N/A</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <div class="land-life w-100 position-relative d-flex justify-content-between align-items-center">
                    <div class="icon-before">Life:</div>
                    <div class="progress w-75 ms-2">
                        <div class="progress-bar progress-bar-striped bg-danger">
                        <div class="position-absolute position-center-translate p-2 sub-info">N/A</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <div class="land-state w-100 position-relative d-flex justify-content-between align-items-center">
                    <div class="icon-before">States:</div>
                    <div class="progress w-75 ms-2">
                        <div class="progress-bar progress-bar-striped bg-success">
                        <div class="position-absolute position-center-translate p-2 sub-info">N/A</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <div class="land-water w-100 position-relative d-flex justify-content-between align-items-center">
                    <div class="icon-before">Water:</div>
                    <div class="progress w-75 ms-2">
                        <div class="progress-bar progress-bar-striped bg-info">
                        <div class="position-absolute position-center-translate sub-info">N/A</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div class="d-flex align-items-center mb-2">
                    <div class="land-fertility w-100 position-relative d-flex justify-content-between align-items-center">
                    <div class="icon-before">Fertility:</div>
                    <div class="progress w-75 ms-2">
                        <div class="progress-bar progress-bar-striped bg-fertility">
                        <div class="position-absolute position-center-translate sub-info">N/A</div>
                        </div>
                    </div>
                    </div>
                </div>
                <div id="plantInfo" class="mt-3">
                    <div class="plant-details w-100">
                        <div class="d-flex justify-content-between align-items-center">
                            <div class="w-100">
                                <div class="name d-flex align-items-center mb-2">
                                    <span class="icon-before me-2">Plant:</span>
                                    <span class="detail-value">N/A</span>
                                </div>
                                <div class="disease position-relative d-flex justify-content-between align-items-center mb-2">
                                <span class="icon-before"></span>
                                <div class="progress w-100">
                                    <div class="progress-bar progress-bar-striped bg-danger">
                                    <div class="position-absolute position-center-translate sub-info">N/A</div>
                                    </div>
                                </div>
                                </div>
                                <div class="yield position-relative d-flex justify-content-between align-items-center mb-2">
                                <span class="icon-before"></span>
                                <div class="progress w-100">
                                    <div class="progress-bar progress-bar-striped bg-warning">
                                    <div class="position-absolute position-center-translate sub-info">N/A</div>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div class="growth text-center mb-3 ms-2">
                                <div class="circular-progress">
                                <span>
                                    <div class="d-flex flex-column align-items-center">
                                    <i class="material-symbols-sharp">grass</i>
                                    <div class="growth-time">N/A</div>
                                    </div>
                                </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="bag" class="window d-none" name="inventory">
            <div class="header">
                <div class="icon-before app-title" name="inventory">Inventory</div>
                <div class="icon-before close"></div>
            </div>
            <div class="p-3">
                <div class="equipments">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <div class="icon-before eqp me-2">Equipments</div>
                        <div class="d-flex justify-content-between">
                            <div class="items" status="empty" name="shovel"></div>
                            <div class="items" status="empty" name="sickle"></div>
                            <div class="items" status="empty" name="fertilizer"></div>
                            <div class="items" status="empty" name="seed"></div>
                            <div class="items" status="empty" name="watercan"></div>
                            <div class="items" status="empty" name="bucket"></div>
                            <div class="items" status="empty" name="pesticide"></div>
                        </div>
                    </div>
                </div>
                <div class="list d-flex justify-content-between flex-wrap">
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                    <div class="items" name="">
                        <div class="quantity"></div>
                        <div class="name">Empty</div>
                    </div>
                </div>
                <div class="footer-action d-flex flex-column justify-content-start d-none">
                    <div class="items-context use icon-before">Use</div>
                    <div class="items-context drop icon-before">Drop</div>
                    <div class="items-context research icon-before">Research</div>
                </div>
            </div>
        </div>

        <div id="products" class="window d-none" name="nation-products-center">
            <div class="header">
                <div class="icon-before app-title" name="nation-products-center">Nantion Products Center</div>
                <div class="icon-before close"></div>
            </div>
            <div class="body p-2">
                  <div class="tab-content position-relative scroll-place" name-scrollbar="nation-products-center-tab">
                    <div class="tab-content-items active" tab-target="products" tab-content="category"></div>
                    <div class="tab-content-items" tab-target="products" tab-content="details"></div>
                    <div class="tab-content-items" tab-target="products" tab-content="shopping"></div>
                </div>
            </div>
            <div class="scrollbar position-absolute">
                <input type="range" min="0" max="100" value="0" name-scrollbar="nation-products-center-tab">
            </div>
                <div class="thumb position-absolute"></div>
            <div class="footer p-3 d-flex justify-content-between align-items-center">
              
                <div class="tab-label d-flex justify-content-between align-items-center position-absolute position-full-width-bottom" name="menu-app-products">
                    <div class="tab-items active" tab-target="products" tab-content="category">
                        <div class="category icon-before flex-column">
                            Category
                        </div>
                    </div>
                    <div class="tab-items" tab-target="products" tab-content="details">
                        <div class="details icon-before flex-column">
                            Details
                        </div>
                    </div>
                    <div class="tab-items" tab-target="products" tab-content="shopping">
                        <div class="shopping icon-before flex-column">
                            My Order
                        </div>
                    </div>
                </div>
            </div>
        </div>

        
    </div>
    <div id="task-manager" class="position-absolute position-full-width-bottom">
        <div class="bg-task-manager position-absolute position-full-size"></div>
        <div class="manage position-absolute position-full-size d-flex justify-content-between align-items-center pe-1 ps-1">
            <div id="window-app" class="d-flex align-items-center">
                <div class="app-show icon-before"></div>
                <div class="app-pin"></div>
            </div>
            <div id="toolsList" class="d-flex align-items-center">
                <div class="items-tools shovel"></div>
                <div class="items-tools sickle"></div>
                <div class="items-tools fertilizer"></div>
                <div class="items-tools seed"></div>
                <div class="items-tools watercan"></div>
                <div class="items-tools bucket"></div>
                <div class="items-tools pesticide"></div>
            </div>
            <div id="toolsToggle"></div>
            <div id="functions" class="d-flex align-items-center">
                <div id="alert" class="icon-before"></div>
                <div id="reminder" class="icon-before"></div>
                <div id="settings" class="icon-before"></div>
                <span class="calendar-time">12:00 AM</span>
            </div>
        </div>
    </div>
    <div id="app-show" class="position-absolute">
        <div class="overlay"></div>
        <div class="user-info d-flex flex-column position-absolute">
            <div class="d-flex justify-content-between align-items-center">
                <div class="user-save w-100 d-flex align-items-center justify-content-between">
                    <div class="save icon-before align-items-center">Save Data</div>
                    <div class="sync icon-before"></div>
                </div>
                
            </div>
        </div>
        <div class="app-list p-3 px-5 d-flex flex-wrap justify-content-start">
            <div class="items app-title icon-before" name="land-details">
               <span>Land Details</span>
            </div>
            <div class="items app-title icon-before" name="weather">
               <span>Weather</span>
            </div>
            <div class="items app-title icon-before" name="inventory">
               <span>Inventory</span>
            </div>
            <div class="items app-title icon-before" name="stock">
               <span>Stock</span>
            </div>
            <div class="items app-title icon-before" name="health-care">
               <span>Health Care</span>
            </div>
            <div class="items app-title icon-before" name="nation-products-center">
               <span>Nation Products Center</span>
            </div>
        </div>
        <div class="footer d-flex justify-content-between align-items-center p-3 px-5 position-absolute position-full-width-bottom">
            <span class="username icon-before">Player1</span>
            <span class="logout icon-before"></span>
        </div>
    </div>
    <div id="toolsLand" type=""></div>
`;
