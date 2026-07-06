/*
    viewer/labels.js — Vietnamese display labels for values that only exist in English in the
    model/controller layer (ConfigSys/timer.calendar() are English-only by convention — see
    project convention: identifiers/comments stay English, only player-facing text is
    Vietnamese, matching ConfigSys.global.lang === "vn").
*/

export const SEASON_LABEL = {
    spring: 'Xuân', summer: 'Hạ', autumn: 'Thu', winter: 'Đông'
};

export const WEEKDAY_LABEL = {
    Sunday: 'Chủ nhật', Monday: 'Thứ hai', Tuesday: 'Thứ ba', Wednesday: 'Thứ tư',
    Thursday: 'Thứ năm', Friday: 'Thứ sáu', Saturday: 'Thứ bảy'
};

export const TOOL_LABEL = {
    shovel: 'Xẻng', sickle: 'Liềm', fertilizer: 'Phân', seed: 'Giống',
    watercan: 'Tưới', bucket: 'Xô', pesticide: 'Thuốc'
};

export const LAND_STATE_LABEL = {
    empty: 'Đất trống', plowed: 'Đã cuốc', fertilized: 'Đã bón phân',
    growing: 'Đang lớn', harvestable: 'Sẵn sàng thu hoạch', restoring: 'Đang hồi phục'
};

export const WEATHER_CONDITION_LABEL = {
    sunny: 'Nắng', rain: 'Mưa'
};
