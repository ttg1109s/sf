/* Cấu trúc hiển thị chi tiết cho từng loại sản phẩm/vật phẩm ====================================== */

const productDetail = {
    seed: {
        name: ['Name: ', null],
        group: ['Group: ', null],
        yield: ['Yield per planting: ', null, 'grams'],
        growthTime: ['Growth Time: ', null],
        freshTime: ['Fresh Time: ', null],
        water: ['Water usage per total area: ', null, '%'],
        price: [['Seed price: ', null, 'VND'], ['Product price: ', null, 'VND']],
        pests: ['Pest Resistance: ', null, '%'],
        downLifeScore: ['Soil lifespan impact: -', null, '%'],
        reqLevel: ['Required Level: ', null],
        season: ['Best Season: ', null],
    },
    fertilizer: {
        name: ['Name: ', null],
        group: ['Group: ', null],
        brand: ['Brand: ', null],
        live: ['Effect Duration: ', null],
        yield: ['Yield Increase: +', null, '%'],
        price: ['Price: ', null, 'VND'],
        priceBuff: ['Price Subsidy: ', null, '%'],
    },

    shovel: {
        name: ['Name: ', null],
        effectiveness: ['Plow effectiveness: +', null, '%'],
        reqLevel: ['Required Level: ', null],
        price: ['Price: ', null, 'VND'],

    },
    sickle: {
        name: ['Name: ', null],
        effectiveness: ['Harvest effectiveness: +', null, '%'],
        reqLevel: ['Required Level: ', null],
        price: ['Price: ', null, 'VND'],
    },
    watercan: {
        name: ['Name: ', null],
        brand: ['Brand: ', null],
        upWater: ['Water supply capacity: ', null, 'litters'],
        price: ['Price: ', null, 'VND'],
    },
    bucket: {
        name: ['Name: ', null],
        brand: ['Brand: ', null],
        unWater: ['Drainage capacity: ', null, 'litters'],
        price: ['Price: ', null, 'VND'],
    },
    pesticide: {
        name: ['Name: ', null],
        formula: ['Chemical Formula: ', null],
        brand: ['Brand: ', null],
        effectiveness: ['Reduce pests : +', null, '%'],
        downLifeScore: ['Soil lifespan impact: -', null, '%'],
        price: ['Price: ', null, 'VND'],
    }
}



