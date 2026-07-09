class WeatherUI {
    constructor(weather = {}) {
        this.weather = weather;
        this.isFirstUpdate = true; // Biến cờ để kiểm tra lần đầu cập nhật
        this.weatherToday = null;
        this.currentHour = null;
        this.scroll = true;
    }

    #html = {
        weatherHourly(data = {}, hour) {
            // Kiểm tra dữ liệu đầu vào
            const condition = data.condition || "sun";
            const temperatureInt = data.temperature?.int;
            const temperatureDec = data.temperature?.dec;
            return `
                <div class="items d-flex flex-column align-items-center">
                    <span class="condition" name="${condition}"></span>
                    <h1 class="temperature" sup="${temperatureDec}">${temperatureInt}</h1>
                    <span class="hours">${fb.number.truncate(hour)}h</span>
                </div>`;
        },
    };

    receiver(data = {}) {
        this.weatherToday = data;
    }

    hours(hours) {
        this.currentHour = hours;
    }

    render() {

        if (!this.isFirstUpdate) {
            const nextHour = this.currentHour + 1 > 23 ? 0 : this.currentHour + 1;
            const data = this.weatherToday[nextHour];
            const newHours = this.#html.weatherHourly(data, nextHour);
            objDOM.calendarBody.append(newHours);
            const items = objDOM.calendarID.find(".items");
            items.removeClass("active");
            items.eq(2).addClass("active");
            if (this.scroll) {
                items.eq(0).fadeOut(300, () => { items.eq(0).remove() });
                objDOM.calendarBody.animate({ scrollLeft: objDOM.calendarBody[0].scrollWidth  }, 500, 'linear');
                
            } else {
                objDOM.calendarBody.scrollLeft(objDOM.calendarBody[0].scrollWidth);
                items.eq(0).remove();
            }
        } else {
            this.isFirstUpdate = false;
            const bfHour = this.currentHour - 1 < 0 ? 23 : this.currentHour - 1;
            const crHour = this.currentHour;
            const afHour = this.currentHour + 1 > 23 ? 0 : this.currentHour + 1;
            const hours = [bfHour, crHour, afHour];
            const data = this.weatherToday;
            let i = 0;
            for (const hourIndex of hours) {
                const items = objDOM.calendarItems.eq(i);
                items.find('.condition').attr('name', data[hourIndex].condition);
                items.find('.temperature').text(data[hourIndex].temperature?.int);
                items.find('.temperature').attr('sup', data[hourIndex].temperature?.dec);
                items.find('.hours').text(fb.number.truncate(hourIndex) + 'h');
                i++;
            }
        }

        
        USU.secretary({
            calendarTemperatureAverage: {
                text: `${fb.number.truncate(this.weatherToday?.temperatureAvg ?? 0)}℃`
            },
            calendarAmount: {
                text: `${fb.number.truncate(this.weatherToday?.[this.currentHour]?.rainfall ?? 0)}mm`
            },
            calendarHumidity: {
                text: `${fb.number.truncate(this.weatherToday?.[this.currentHour]?.humidity ?? 0)}%`
            }
        });
    }
}

const WUI = new WeatherUI();

