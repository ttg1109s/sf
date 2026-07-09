/* Dữ liệu sản phẩm nông nghiệp (hạt giống, phân bón, dụng cụ...) ================================== */


const products = {

    seed: {
        1: {
            name: "Spinach",
            group: "vegetable",
            yield: 100,
            growthTime: { d: 0, h: 6, m: 0 },
            freshTime: { d: 7, h: 0, m: 0 },
            water: 0.43, // litter need = percent of x square * 0.1m * 1000 
            price: 5000,
            pests: 0.15,
            downLifeScore: 0.05,
            reqLevel: 1,
            season: ["spring","autumn"]
        },
        2: {
            name: "Cabbage",
            group: "vegetable",
            yield: 225,
            growthTime: { d: 0, h: 12, m: 0 },
            freshTime: { d: 8, h: 0, m: 0 },
            water: 0.45,
            price: 11000,
            pests: 0.25,
            downLifeScore: 0.08,
            reqLevel: 1,
            season: ["spring","autumn"]
        },
        3: {
            name: "Malabar Spinach",
            group: "vegetable",
            yield: 125,
            growthTime: { d: 0, h: 14, m: 0 },
            freshTime: { d: 6, h: 0, m: 0 },
            water: 0.4,
            price: 16000,
            pests: 0.20,
            downLifeScore: 0.07,
            reqLevel: 1,
            season: ["summer","autumn"]
        },
        4: {
            name: "Carrot",
            group: "vegetable",
            yield: 200,
            growthTime: { d: 1, h: 0, m: 0 },
            freshTime: { d: 9, h: 0, m: 0 },
            water: 0.5,
            price: 10000,
            pests: 0.35,
            downLifeScore: 0.10,
            reqLevel: 2,
            season: ["spring","autumn"]
        },
        5: {
            name: "Potato",
            group: "vegetable",
            yield: 300,
            growthTime: { d: 1, h: 6, m: 0 },
            freshTime: { d: 10, h: 0, m: 0 },
            water: 0.55,
            price: 10000,
            pests: 0.30,
            downLifeScore: 0.12,
            reqLevel: 2,
            season: ["autumn"]
        },
        6: {
            name: "Tomato",
            group: "vegetable",
            yield: 175,
            growthTime: { d: 1, h: 12, m: 0 },
            freshTime: { d: 8, h: 0, m: 0 },
            water: 0.6,
            price: 30000,
            pests: 0.25,
            downLifeScore: 0.10,
            reqLevel: 3,
            season: ["summer"]
        },
        7: {
            name: "Lettuce",
            group: "vegetable",
            yield: 88,
            growthTime: { d: 0, h: 18, m: 0 },
            freshTime: { d: 5, h: 0, m: 0 },
            water: 0.35,
            price: 25000,
            pests: 0.10,
            downLifeScore: 0.03,
            reqLevel: 4,
            season: ["spring"]
        },
        8: {
            id: 8,
            name: "Apple",
            group: "fruit",
            yield: 125,
            growthTime: { d: 1, h: 18, m: 0 },
            freshTime: { d: 12, h: 0, m: 0 },
            water: 0.75,
            price: 50000,
            pests: 0.35,
            downLifeScore: 0.15,
            reqLevel: 3,
            season: ["spring","summer","autumn"]
        },
        9: {
            name: "Banana",
            group: "fruit",
            yield: 300,
            growthTime: { d: 1, h: 12, m: 0 },
            freshTime: { d: 10, h: 0, m: 0 },
            water: 0.6,
            price: 35000,
            pests: 0.30,
            downLifeScore: 0.10,
            reqLevel: 2,
            season: ["spring","summer"]
        },
        10: {
            name: "Orange",
            group: "fruit",
            yield: 200,
            growthTime: { d: 2, h: 0, m: 0 },
            freshTime: { d: 14, h: 0, m: 0 },
            water: 0.65,
            price: 45000,
            pests: 0.30,
            downLifeScore: 0.12,
            reqLevel: 4,
            season: ["summer","autumn"]
        },
        11: {
            name: "Rice",
            group: "grain",
            yield: 625,
            growthTime: { d: 1, h: 18, m: 0 },
            freshTime: { d: 20, h: 0, m: 0 },
            water: 0.7,
            price: 8000,
            pests: 0.15,
            downLifeScore: 0.10,
            reqLevel: 10,
            season: ["spring","summer"]
        },
        12: {
            name: "Wheat",
            group: "grain",
            yield: 500,
            growthTime: { d: 1, h: 12, m: 0 },
            freshTime: { d: 18, h: 0, m: 0 },
            water: 0.53,
            price: 9000,
            pests: 0.20,
            downLifeScore: 0.08,
            reqLevel: 8,
            season: ["autumn","winter"]
        },
        13: {
            name: "Corn",
            group: "grain",
            yield: 750,
            growthTime: { d: 2, h: 0, m: 0 },
            freshTime: { d: 15, h: 0, m: 0 },
            water: 0.57,
            price: 7000,
            pests: 0.20,
            downLifeScore: 0.09,
            reqLevel: 6,
            season: ["summer","autumn"]
        }
    },

        
    fertilizer: {
        1: {
            name: "Earthroot",
            group: "Bio",
            brand: "GreenFields Co.",
            live: { d:1, h:5, m:0},
            yield: 0.15,
            price: 50000,
            priceBuff: 0.3,
            story: "Infused with the vitality of the earth, perfect for nurturing young crops."
        },
        2: {
            name: "Moonveil",
            group: "Bio",
            brand: "LunarAgri",
            live: {d:2, h:17, m:0},
            yield: 0.18,
            price: 120000,
            priceBuff: 0.4,
            story: "Blessed by moonlight, it subtly enhances plant vitality over time."
        },
        3: {
            name: "Starfall",
            group: "Eco",
            brand: "Celestial Harvest",
            live: {d:3, h:0, m:0},
            yield: 0.30,
            price: 250000,
            priceBuff: 0.12,
            story: "Meteoric minerals infuse the soil, granting crops a steady boost."
        },
        4: {
            name: "Titan Bloom",
            group: "Eco",
            brand: "EpicGrow",
            live: {d:5, h:0, m:0},
            yield: 0.40,
            price: 500000,
            priceBuff: 0.15,
            story: "Forged from the rarest elements, it maximizes harvest potential."
        },
        5: {
            name: "Dragon Soil",
            group: "Eco",
            brand: "Mythic Farms",
            live: {d:5, h:12, m:0},
            yield: 0.50,
            price: 1000000,
            priceBuff: 0.25,
            story: "Enchanted by dragon essence, crops flourish with fiery vigor."
        },
        6: {
            name: "Phoenix Ash",
            group: "Chemical",
            brand: "Rebirth Agri",
            live: {d:10, h:0, m:0},
            yield: 0.60,
            price: 2000000,
            priceBuff: -0.20,
            story: "From the ashes of mythical birds, it dramatically boosts yield over long periods."
        },
        7: {
            name: "Elder Compost",
            group: "Chemical",
            brand: "Ancient Roots",
            live: {d:14, h:0, m:0},
            yield: 0.70,
            price: 4000000,
            priceBuff: -0.30,
            story: "Composted with rare minerals, it increases crop output significantly but affects market value."
        },
        8: {
            name: "Biochar",
            group: "Chemical",
            brand: "Infinity Labs",
            live: {d:20, h:0, m:0},
            yield: 0.75,
            price: 8000000,
            priceBuff: -0.40,
            story: "Harnessing concentrated elements, it maximizes yield at the cost of selling price."
        },
        9: {
            name: "Quantum Fertilizer",
            group: "Chemical",
            brand: "Infinity Labs",
            live: {d:30, h:0, m:0},
            yield: 0.80,
            price: 16000000,
            priceBuff: -0.35,
            story: "Harnessing the secrets of the quantum realm, it unlocks near-limitless crop potential."
        }
    },

    shovel: {
        1: {
            name: 'Wooden Spade',
            effectivess: 0.05,
            reqLevel: 1,
            price: 30000,
            story: 'A humble wooden spade, the first tool for budding farmers.'
        },
        2: {
            name: 'Stone Shovel',
            effectivess: 0.15,
            reqLevel: 10,
            price: 80000,
            story: 'Crafted from sturdy stone, it digs efficiently and reliably.'
        },
        3: {
            name: 'Iron Digger',
            effectivess: 0.25,
            reqLevel: 20,
            price: 150000,
            story: 'Forged in the flames of industry, a solid companion for any field.'
        },
        4: {
            name: 'Steel Excavator',
            effectivess: 0.40,
            reqLevel: 35,
            price: 300000,
            story: 'Sharper and stronger, it conquers the hardest soil with ease.'
        },
        5: {
            name: 'Titanium Tiller',
            effectivess: 0.60,
            reqLevel: 50,
            price: 500000,
            story: 'Forged from rare titanium, every dig is precise and effortless.'
        },
        6: {
            name: 'Diamond Star',
            effectivess: 0.80,
            reqLevel: 65,
            price: 1000000,
            story: 'Embedded with diamond edges, it cuts through the earth like magic.'
        },
        7: {
            name: 'Celestial Spade',
            effectivess: 1.10,
            reqLevel: 80,
            price: 2500000,
            story: 'Blessed by the stars, this shovel brings divine efficiency to every harvest.'
        },
        8: {
            name: 'Eternal Digger',
            effectivess: 1.50,
            reqLevel: 95,
            price: 5000000,
            story: 'Forged from timeless metals, it works tirelessly for legendary yields.'
        },
        9: {
            name: 'Bitcoin Savitor',
            effectivess: 2.00,
            reqLevel: 100,
            price: 0,
            story: 'A legendary shovel of ultimate value, empowering farmers beyond imagination.'
        }
    },


    sickle: {
        1: {
            name: 'Iron Fang',
            effectivess: 0.02,
            reqLevel: 1,
            price: 35000,
            story: 'A sharp iron fang, perfect for the first steps of a farmer’s journey.'
        },
        2: {
            name: 'Thunder Edge',
            effectivess: 0.06,
            reqLevel: 10,
            price: 85000,
            story: 'Crackling with energy, this edge strikes with the force of lightning.'
        },
        3: {
            name: 'Shadow Scythe',
            effectivess: 0.12,
            reqLevel: 20,
            price: 160000,
            story: 'Forged in the dark of night, it cuts through crops like shadows through fog.'
        },
        4: {
            name: 'Flame Cleaver',
            effectivess: 0.20,
            reqLevel: 35,
            price: 310000,
            story: 'Engulfed in eternal fire, every swing scorches the field and multiplies the harvest.'
        },
        5: {
            name: 'Storm Reaper',
            effectivess: 0.35,
            reqLevel: 50,
            price: 510000,
            story: 'Summoning the fury of storms, this legendary sickle dominates the harvest.'
        },
        6: {
            name: 'Titan Edge',
            effectivess: 0.50,
            reqLevel: 65,
            price: 1010000,
            story: 'Forged by giants, its swings rend the earth and gather crops effortlessly.'
        },
        7: {
            name: 'Celestial Scythe',
            effectivess: 0.70,
            reqLevel: 80,
            price: 1510000,
            story: 'Touched by the stars themselves, this blade enhances yield beyond mortal limits.'
        },
        8: {
            name: 'Aurora Fang',
            effectivess: 1.2,
            reqLevel: 95,
            price: 2510000,
            story: 'Its radiant glow captures the dawn, blessing every harvest with brilliance.'
        },
        9: {
            name: 'Communist',
            effectivess: 2,
            reqLevel: 100,
            price: 0,
            story: 'Workers of the world, unite! - Marx, K., & Engels, F. (1848). The Communist Manifesto'
        }
    },

    watercan: {
        1: {
            name: 'Crystal Dew',
            brand: 'BlueSpring Co.',
            upWater: 10,
            price: 5000,
            story: 'Harvested from the morning dew of enchanted fields, this water brings life to the youngest crops.'
        },
        2: {
            name: 'RiverFlow Pack',
            brand: 'AquaValley Ltd.',
            upWater: 20,
            price: 20000,
            story: 'Captured from the mystical valley streams, it strengthens the roots of vegetables and herbs alike.'
        },
        3: {
            name: 'Golden Well',
            brand: 'SunHarvest',
            upWater: 50,
            price: 50000,
            story: 'Drawn from an ancient well blessed by the sun, it guarantees a bountiful harvest for those who use it.'
        },
        4: {
            name: 'StormDrop Sack',
            brand: 'ThunderRain Inc.',
            upWater: 100,
            price: 120000,
            story: 'Infused with the power of tempestuous storms, it imbues crops with untamed energy and growth.'
        },
        5: {
            name: 'Sacred Spring',
            brand: 'Moonlight Collective',
            upWater: 200,
            price: 300000,
            story: 'Flowing from the hidden lunar spring, this water awakens the magic within the plants it touches.'
        },
        6: {
            name: 'OceanMist Pouch',
            brand: 'DeepBlue Co.',
            upWater: 300,
            price: 700000,
            story: 'Mist from the deep ocean condensed into a pouch, it nourishes fruits to full succulent glory.'
        },
        7: {
            name: 'Ancient Glacier',
            brand: 'FrostPeak Ltd.',
            upWater: 500,
            price: 1500000,
            story: 'Forged from the melting glaciers of forgotten mountains, its chill brings unparalleled freshness to crops.'
        },
        8: {
            name: 'Eternal Aqua',
            brand: 'Celestial Waters',
            upWater: 1000,
            price: 10000000,
            story: 'A gift from the gods themselves, this eternal water grants legendary power to the most precious fields.'
        }
    },

   bucket: {
        1: {
            name: "Dopper",
            brand: "AquaCraft",
            unWater: 10,
            price: 10000,
            story: "A small but reliable bucket, perfect for quick watering in tight spaces."
        },
        2: {
            name: "Pot",
            brand: "GreenFields Co.",
            unWater: 80,
            price: 35000,
            story: "Sturdy and simple, this pot can carry water enough for a small plot."
        },
        3: {
            name: "Shove",
            brand: "EpicGrow",
            unWater: 130,
            price: 80000,
            story: "Forged from reinforced materials, it allows faster irrigation over medium areas."
        },
        4: {
            name: "Tube",
            brand: "HydroMax",
            unWater: 210,
            price: 150000,
            story: "A long tube-shaped container, designed for efficient water flow and coverage."
        },
        5: {
            name: "Suction",
            brand: "Mythic Farms",
            unWater: 340,
            price: 300000,
            story: "Harnesses vacuum principles to carry a large volume with minimal effort."
        },
        6: {
            name: "Truck",
            brand: "Rebirth Agri",
            unWater: 550,
            price: 500000,
            story: "A portable water truck, capable of irrigating wide fields with ease."
        },
        7: {
            name: "Tank",
            brand: "Infinity Labs",
            unWater: 890,
            price: 900000,
            story: "A colossal tank that stores massive amounts of water, ideal for epic-scale farming."
        },
        8: {
            name: "Quantum Vessel",
            brand: "Celestial Harvest",
            unWater: 1500,
            price: 2000000,
            story: "A mysterious vessel from beyond the stars, capable of holding almost infinite water per use."
        }
   },

    pesticide: {
        1: {
            name: "Bug Away",
            formula: "C2H4O2 + C3H8O",
            brand: "GreenFields Co.",
            effectiveness: 0.10,
            downLifeScore: 0.05,
            price: 40000,
            story: "A gentle pesticide made from natural ingredients, safe for young plants."
        },
        2: {
            name: "Insecto Guard",
            formula: "C6H5Cl + C2H5OH",
            brand: "LunarAgri",
            effectiveness: 0.15,
            downLifeScore: 0.10,
            price: 60000,
            story: "A powerful pesticide that effectively repels a wide range of insects."
        },
        3: {
            name: "PestX",
            formula: "C9H10Cl2",
            brand: "EpicGrow",
            effectiveness: 0.25,
            downLifeScore: 0.15,
            price: 150000,
            story: "A potent chemical pesticide designed for maximum effectiveness against stubborn pests."
        },
        4: {
            name: "Terminator",
            formula: "C10H15N + C4H10O",
            brand: "Mythic Farms",
            effectiveness: 0.35,
            downLifeScore: 0.20,
            price: 300000,
            story: "A high-strength pesticide that quickly eliminates even the most resilient pests."
        }
    },
}

let productsCustom = {}

