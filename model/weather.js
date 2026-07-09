/*

    Weather Class =====================================================================

*/

class Weather {
    constructor(config = { rainChance: 0, falling: [0, 0], temp: [0, 0], sun: [0, 0], day: 1 }) {
        this.config = config;
        
        this.#currentDay = this.config?.day ?? 1;
        this.#rainChance = this.config?.rainChance ?? 0;
        this.#fallingMiMax = this.config?.falling ?? [0, 0];
        this.#tempMinMax = this.config?.temp ?? [0, 0];
        this.#sunriseSunset = this.config?.sun ?? [0, 0];

        if (fb.check.inRange(this.#currentDay, 1, 360) === false)
            throw new Error('Weather: Day must be between 1 and 360.');
        if (fb.check.inRange(this.#rainChance, 0, 1) === false)
            throw new Error('Weather: Rain chance must be between 0 and 1.');
       
        if (!fb.check.type([this.#currentDay, this.#rainChance], 'number', true))
            throw new Error('Weather: Invalid data type in configuration.');
    }

    
    #currentDay;
    #rainChance;
    #fallingMiMax;
    #tempMinMax;
    #sunriseSunset;

    
    #setRain = null;
    #listRain = null;
    #listFalling = null;
    #listLut = null;
    #listTemp = null;
    #listHumidity = null;


    getSeason() {
        if (this.#currentDay < 1 || this.#currentDay > 360) return false;
        const seasons = ['spring', 'summer', 'autumn', 'winter'];
        const seasonIndex = Math.floor((this.#currentDay - 1) / 90);
        return seasons[seasonIndex];
    }

    #rain() {
        const [minFalling, maxFalling] = this.#fallingMiMax;
        let rain = false;
        let listRain = [];
        let listFalling = [];
        const randomChance = fb.random.flt(0, 1);
        if (randomChance < this.#rainChance) {
            rain = true;
            for (let i = 0; i < 24; i++) {
                if (fb.random.flt(0, 1) < this.#rainChance) {
                    listRain.push(true);
                    listFalling.push(fb.random.int(minFalling, maxFalling));
                } else {
                    listRain.push(false);
                    listFalling.push(0);
                }
            }
        } else {
            for (let i = 0; i < 24; i++) {
                listRain.push(false);
                listFalling.push(0);
            }
        }

        this.#setRain = rain;
        this.#listRain = listRain;
        this.#listFalling = listFalling;
    }

    #lut() {
        
        const sun = this.#sunriseSunset;
        if (sun.length !== 2) return false;
        
        
        const [sunrise, sunset] = sun;
        if (sunrise < 0 || sunrise > 23 || sunset < 0 || sunset > 23) return false;
        

        const totalHours = 24;
        const keyPoints = {};
        for (let i = 0; i < sunrise; i += 2) {
            keyPoints[i] = fb.random.flt(0.01, 0.09);
        }
        keyPoints[sunrise] = fb.random.flt(0.1, 0.2);
        const peakHour = Math.floor((sunset + sunrise) / 2);
        for (let i = sunrise + 1; i < sunset; i++) {
            if (i === peakHour) {
                keyPoints[i] = fb.random.flt(0.9, 1.0);
            } else if (i === peakHour - 1 || i === peakHour + 1) {
                keyPoints[i] = fb.random.flt(0.7, 0.89);
            } else {
                keyPoints[i] = fb.random.flt(0.3, 0.6);
            }
        }
        keyPoints[sunset] = fb.random.flt(0.1, 0.2);
        for (let i = sunset + 1; i < totalHours; i += 2) {
            keyPoints[i] = fb.random.flt(0.01, 0.09);
        }
        keyPoints[0] = fb.random.flt(0.01, 0.09);
        keyPoints[totalHours - 1] = fb.random.flt(0.01, 0.09);
        const sortedHours = Object.keys(keyPoints).map(Number).sort((a, b) => a - b);
        const newLut = new Array(totalHours);
        for (let i = 0; i < totalHours; i++) {
            let startHour = 0;
            let endHour = totalHours - 1;
            for (let j = 0; j < sortedHours.length - 1; j++) {
                if (i >= sortedHours[j] && i <= sortedHours[j + 1]) {
                    startHour = sortedHours[j];
                    endHour = sortedHours[j + 1];
                    break;
                }
            }
            newLut[i] = fb.calc.scl(i, startHour, endHour, keyPoints[startHour], keyPoints[endHour]);
        }
        for (const hour in keyPoints) {
            if (hour < totalHours) {
                newLut[hour] = keyPoints[hour];
            }
        }
        
        this.#listLut = newLut;
        
    }

    #temperature() {
        let [minTemp, maxTemp] = this.#tempMinMax;
        let arr = [];
        minTemp += fb.random.int(-2, 2);
        maxTemp += fb.random.int(-2, 2);
        for (let i = 0; i < this.#listLut.length; i++) {
            let temp = minTemp + (maxTemp - minTemp) * this.#listLut[i];
            arr.push(temp);
        }
        this.#listTemp = arr;
    }

    #humidity() {
        const maxRainAmount = this.#fallingMiMax[1];
        const rainfall = this.#listFalling;
        const temp = this.#listTemp;

        if (this.#listTemp.length !== 24 || rainfall.length !== 24) return false;
        if (maxRainAmount <= 0) return false;

        const sortedTemp = fb.array.sort(temp);
        const minTemp = sortedTemp.minValue;
        const maxTemp = sortedTemp.maxValue;

        if (this.#listTemp.length !== 24 || rainfall.length !== 24) return false;
        if (maxRainAmount <= 0) return false;

        let humidity = [];

        for (let i = 0; i < 24; i++) {
            const rainAmount = rainfall[i];
            const currentHourTemp = temp[i];
            const humidityAdjustmentFromTemp = fb.calc.scl(currentHourTemp, minTemp, maxTemp, 0, 100);
            const humidityFromRain = fb.calc.percent(rainAmount, maxRainAmount);

            let finalHumidity = (humidityFromRain * 0.8 + (100 - humidityAdjustmentFromTemp) * 0.2);
            if (finalHumidity > 95) finalHumidity = fb.random.int(5, 10) + fb.random.flt(0, 1);
            if (finalHumidity <= 0) finalHumidity = fb.random.int(1, 3) + fb.random.flt(0, 1);
            humidity.push(finalHumidity);
        }

        this.#listHumidity = humidity;
    }

    simulator() {
        
        const steps = [
            this.#rain.bind(this),
            this.#lut.bind(this),
            this.#temperature.bind(this),
            this.#humidity.bind(this)
        ];

        for (const step of steps) {
            step();
        }

        if (this.#setRain) {
           for (let i = 0; i < this.#listRain.length; i++) {
                if (this.#listRain[i]) {
                    const tempDrop = (this.#listRain[i] / this.#fallingMiMax[1]) * fb.random.int(1, 4);
                    this.#listTemp[i] -= tempDrop;
                }
            }
        }

        return {
            averageTemp: fb.number.truncate(fb.calc.average(this.#listTemp)),
            rain: this.#setRain,
            rainList: this.#listRain,
            rainFall: this.#listFalling,
            temperature: this.#listTemp,
            humidity: this.#listHumidity,
        };
    }

    continue(days = 1) {
        let list = {};
        for (let i = 0; i < days; i++) {
            list[i] = this.simulator();
        }
        return list;
    }

    dataSend(days = 0, hours = 0) {

        if (days < 1 || days > 360) {
            throw new Error('Weather: Day must be between 1 and 360.');
        }
        if (hours < 0 || hours > 23) {
            throw new Error('Weather: Hours must be between 0 and 23.');
        }
        if (!fb.check.type([days, hours], 'number', true)) {
            throw new Error('Weather: Invalid data type for day or hours.');
        }


        const cms = new CMS();
        cms._table = 'weather';
        let info = {};

        const bfDay = days - 1;

        const bfHour = (hours - 1 + 24) % 24;
        const afHour = (hours + 1) % 24;

        const dayList = bfHour === 23 ? [bfDay, days] : [days];

        const day = dayList;

        const hour = [bfHour, hours, afHour];

        for (const dayIndex of day) {
            cms.setIndex(dayIndex);
            const data = cms.info();
            if (!data) continue;

            info[dayIndex] = {}; // Khởi tạo đối tượng cho từng ngày
            for (const hourIndex of hour) {
                
                info[dayIndex][hourIndex] = {
                    condition: data.rainList[hourIndex] ? 'rain' : 'sunny',
                    temperature: {
                        int: parseInt(data.temperature[hourIndex]),
                        dec: parseInt((data.temperature[hourIndex] - parseInt(data.temperature[hourIndex])) * 100)
                    },
                    humidity: data.humidity[hourIndex],
                    rainfall: data.rainFall[hourIndex]
                }
            }
            info[dayIndex].temperatureAvg = fb.calc.average(data.temperature);
        }

        let rewrite = fb.array.clone(info[days]);
        if (bfHour === 23) {
            rewrite[23] = fb.array.clone(info[bfDay][23]);
        }
        info = rewrite;


        return info;
    }
}
