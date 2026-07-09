/* Hàm tổng hợp dữ liệu môi trường (thời tiết, mùa) cho nông trại ================================== */

const environment = () => {
    const weather = db.select('weather', { day: registry.system.currentDate[2] })[0] || {};
    const minTemp = fb.array.sort(weather.temperature || [15, 32]).minValue || 15;
    const maxTemp = fb.array.sort(weather.temperature || [15, 32]).maxValue || 32;

    return {
        temp: {
            cur: WUI.weatherToday[registry.system.currentDate[3]].temperature,
            min: minTemp,
            max: maxTemp,
            average: WUI.weatherToday.averageTemp || 22,
        },
        humidity: {
            rate: WUI.weatherToday[registry.system.currentDate[3]].humidity / 100 || 0.3,
            rainfall: WUI.weatherToday[registry.system.currentDate[3]].rainfall || 0,
        },
        season: {
            harvestTimeRate: ConfigSys.seasons[registry.system.season].harvestTimeRate
        }
    }
}

let godAgriculture;

