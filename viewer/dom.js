/* DOM Mapping ====================================================================================== */

const objDOM = {

    bodyTag: $("body"),

    calendarID: $("#weather"),
    calendarBody: $("#weather .weather-body"),
    calendarTime: $(".calendar-time"),
    calendarInfo: $("#weather .calendar-info"),
    calendarWeeks: $("#weather .calendar-weeks"),
    calendarItems: $("#weather .weather-body .items"),
    calendarAmount: $("#weather .weather-footer .amount .icon-before"),
    calendarHumidity: $("#weather .weather-footer .humidity .icon-before"),
    calendarTemperatureAverage: $("#weather .temperature-average .icon-before"),

    areaLandID: $("#landArea"),
    areaLandItems: $("#landArea .items"),
    toolLandID: $("#toolsLand"),

    landNavPrev: $("#landNavPrev"),
    landNavNext: $("#landNavNext"),

    toolListID: $("#toolsList"),
    toolListItems: $("#toolsList .items-tools"),

    landInfoID: $("#landInfo"),


    landName: $('#landInfo .land-name'),
    landSquare: $('#landInfo .land-name .icon-before'),
    landNameText: $("#landInfo .land-name .sub-info"),

    landType: $('#landInfo .land-type'),
    landTypeText: $('#landInfo .land-type .sub-info'),
    landTypePercent: $('#landInfo .land-type .progress-bar'),

    landSlot: $('#landInfo .land-slot'),
    landSlotText: $('#landInfo .land-slot .sub-info'),
    landSlotPercent: $('#landInfo .land-slot .progress-bar'),

    landLife: $('#landInfo .land-life'),
    landLifeText: $('#landInfo .land-life .sub-info'),
    landLifePercent: $('#landInfo .land-life .progress-bar'),

    landState: $('#landInfo .land-state'),
    landStateText: $('#landInfo .land-state .sub-info'),
    landStatePercent: $('#landInfo .land-state .progress-bar'),

    landWater: $('#landInfo .land-water'),
    landWaterText: $('#landInfo .land-water .sub-info'),
    landWaterPercent: $('#landInfo .land-water .progress-bar'),

    landFertility: $('#landInfo .land-fertility'),
    landFertilityText: $('#landInfo .land-fertility .sub-info'),
    landFertilityPercent: $('#landInfo .land-fertility .progress-bar'),

    plantSeed: $('#plantInfo .plant-details .name .detail-value'),

    plantDisease: $('#plantInfo .plant-details .disease'),
    plantDiseaseText: $('#plantInfo .plant-details .disease .sub-info'),
    plantDiseasePercent: $('#plantInfo .plant-details .disease .progress-bar'),

    plantYield: $('#plantInfo .plant-details .yield'),
    plantYieldText: $('#plantInfo .plant-details .yield .sub-info'),
    plantYieldPercent: $('#plantInfo .plant-details .yield .progress-bar'),

    plantGrowth: $('#plantInfo .plant-details .growth'),
    plantGrowthText: $('#plantInfo .plant-details .growth-time'),
    plantGrowthPercent: $('#plantInfo .plant-details .growth .circular-progress'),

    bagID: $("#bag"),
    bagItems: $("#bag .list .items"),
    bagEquiments: $("#bag .equipments"),
    bagItemsEquipments: $("#bag .equipments .items"),
    bagItemsName: $("#bag .list .items .name"),
    bagItemsQuantity: $("#bag .list .items .quantity"),
    bagItemsAction: $("#bag .action"),
    bagItemsUse: $("#bag .footer-action .use"),
    bagContextMenu: $('#bag .footer-action'),

    productID: $("#products"),
    productBody: $("#products .body"),
    productBodyTabs: $("#products .body .tab-content"),
    productBodyTabsItems: $("#products .body .tab-content .tab-content-items"),

    window: $(".window"),
    windowClose: $(".window .close"),
    windownHeader: $(".window .header"),
    windowTitle: $(".window .app-title"),

    scrollPlace: $(".scroll-place"),
    scrollBar: $(".scrollbar"),
    scrollBarInput: $(".scrollbar input[type='range']"),

}


