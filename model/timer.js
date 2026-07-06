/*
    model/timer.js — In-game <-> real time conversion and calendar helpers.
*/

import { fb } from './utils.js';

export const timer = {
    
    scale: {
        day: (8640 / 100),
        hour: (360 / 100),
        minute: (6 / 100),
        second: (0.1 / 100)
    },

    realToIngame(realSeconds = 0) {
        const ingameTime = {
            d: Math.floor(realSeconds / timer.scale.day),
            h: Math.floor(realSeconds / timer.scale.hour % 24),
            m: Math.floor(realSeconds / timer.scale.minute % 60),
            s: Math.floor(realSeconds / timer.scale.second % 60)
        };
        return ingameTime;
    },

    ingameToReal({ d = 0, m = 0, h = 0, s = 0 } = {}) {
        const realSeconds = d * timer.scale.day + h * timer.scale.hour + m *
            timer.scale.minute + s * timer.scale.second;
        return realSeconds;
    },

    duration(duration = {}, direction = '') { 
        if (direction !== 'forward' && direction !== 'backward') return false
        if (direction === 'forward') { 
            return Date.now() + timer.ingameToReal(duration) * 1000;
        } else if (direction === 'backward') { 
            return Date.now() - timer.ingameToReal(duration) * 1000;
        }
    },

    distance(fromTime = 0, toTime = 0) {
        if (fromTime > toTime)[fromTime, toTime] = [toTime, fromTime];
        return Math.abs(fromTime - toTime);
    },

    development(startTime, endTime, forward = true, currentTime = Date.now()) {

        if (currentTime < startTime) currentTime = startTime;

        if (currentTime > endTime) currentTime = endTime;

        const data = fb.calc.inDistance(startTime, endTime, currentTime);

        if (data.outSpec === true) {

            return {
                miliseconds: {
                    lapse: data.total,
                    remains: 0
                },
                formatted: forward ? 'Completed' : '00d, 00h, 00m',
                percent: forward ? 100 : 0
            };
        }

        let { d, m, h } = {};

        if (forward) {
            ({ d, m, h } = timer.realToIngame(data.lapse / 1000));
        } else {
            ({ d, m, h } = timer.realToIngame(data.remains / 1000));
        }

        const formatted = `${fb.number.prefixZero(d)}d, ${fb.number.prefixZero(h)}h, ${fb.number.prefixZero(m)}m`;

        return {
            miliseconds: {
                lapse: data.lapse,
                remains: data.remains
            },
            formatted: formatted,
            percent: forward ? data.percent : 100 - data.percent
        }

    },

    calendar(days = 0, startWeekday = 0) {
        if (days <  1 || days > 360) return false
        const weekdays = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
        ];
        const month = Math.ceil(days / 30);
        const day = ((days - 1) % 30) + 1;
        const weekday = (startWeekday + day - 1) % 7;
        return {
            day,
            month,
            weekday,
            weekdayName: weekdays[weekday],
            monthName: months[month - 1]
        };
    },

    calendarFromDate(day, month) { // format dd/mm
        if (month < 1 || month > 12) return false;
        const daysInMonth = 30;
        if (day < 1 || day > daysInMonth) return false;

        const totalDays = (month - 1) * daysInMonth + day;
        return totalDays;
    }

}
