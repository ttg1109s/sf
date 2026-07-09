/* Update Single UI ====================================================================================== */

class UpdateSingleUI {
    constructor(objDOM = {}, options = {}) {
    }

    #structureForm = {};

    #createTextField = (textDOM) => ({
        textDOM,
        defaultText: 'N/A',
        oldText: null,
    });

    #createPercentField = (textDOM, percentDOM, defaultPercent = 20, percentStyle = 'width') => ({
        textDOM,
        percentDOM,
        defaultText: 'N/A',
        defaultPercent,
        percentStyle,
        oldText: null,
        oldPercent: null
    });

    addField(key, textDOM, percentDOM = null, defaultPercent = 20, percentStyle = 'width') {
        if (percentDOM) {
            this.#structureForm[key] = this.#createPercentField(textDOM, percentDOM, defaultPercent, percentStyle);
        } else {
            this.#structureForm[key] = this.#createTextField(textDOM);
        }
    }

    removeField(key) {
        if (this.#structureForm[key]) {
            delete this.#structureForm[key];
        }
    }

    #updateText(place, newText) {
        if (place.textDOM && place.oldText !== newText) {
            place.textDOM.text(newText);
            place.oldText = newText;
        }
    }

    #updatePercent(place, newPercent) {
        if (!place.percentDOM || !place.percentStyle) return;
        if (place.oldPercent === newPercent) return;

        let percentValue;
        if (place.percentStyle.startsWith('--')) {
            percentValue = newPercent;
        } else {
            percentValue = `${Math.min(Math.max(newPercent, 0), 100)}%`;
        }

        place.percentDOM.css(place.percentStyle, percentValue);
        place.oldPercent = newPercent;
    }

    #updateDOM(key, value = {}) {
        const place = this.#structureForm[key];
        if (!place) {
            console.warn(`Key "${key}" không tồn tại trong structureForm.`);
            return;
        }

        this.#updateText(place, value.text ?? place.defaultText);

        const percent = value.percent ?? place.defaultPercent ?? 20;
        this.#updatePercent(place, percent);
    }

    secretary(content = {}) {
        const updates = [];
        for (const key of Object.keys(content)) {
            const place = this.#structureForm[key];
            if (!place) continue;
            updates.push({ place, value: content[key] });
        }
        requestAnimationFrame(() => {
            for (const { place, value } of updates) {
                this.#updateText(place, value.text ?? place.defaultText);
                const percent = value.percent ?? place.defaultPercent ?? 20;
                this.#updatePercent(place, percent);
            }
            content = null;
            updates.length = 0;
        });
        
    }
}

const USU = new UpdateSingleUI(objDOM);

USU.addField('landName', objDOM.landNameText);
USU.addField('landType', objDOM.landTypeText);
USU.addField('landSlot', objDOM.landSlotText, objDOM.landSlotPercent);
USU.addField('landLife', objDOM.landLifeText, objDOM.landLifePercent);
USU.addField('landState', objDOM.landStateText, objDOM.landStatePercent);
USU.addField('landWater', objDOM.landWaterText, objDOM.landWaterPercent);
USU.addField('landFertility', objDOM.landFertilityText, objDOM.landFertilityPercent);
USU.addField('plantSeed', objDOM.plantSeed);
USU.addField('plantDisease', objDOM.plantDiseaseText, objDOM.plantDiseasePercent);
USU.addField('plantYield', objDOM.plantYieldText, objDOM.plantYieldPercent);
USU.addField('plantGrowth', objDOM.plantGrowthText, objDOM.plantGrowthPercent, 0, '--progress');
USU.addField('systemTime', objDOM.calendarTime);    
USU.addField('calendar', objDOM.calendarInfo);
USU.addField('calendarWeeks', objDOM.calendarWeeks);
USU.addField('calendarTemperatureAverage', objDOM.calendarTemperatureAverage);
USU.addField('calendarAmount', objDOM.calendarAmount);
USU.addField('calendarHumidity', objDOM.calendarHumidity);


