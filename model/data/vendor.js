/* Dữ liệu nhà cung cấp: logistics và ngân hàng ==================================================== */

const vendor = {
    logistics: {
        1: {
            name: "743 Express",
            price: 1000000,
            loadCapacity: 1000,
            speed: 60,
            reliability: 0.4, // (0–1)
        },
        2: {
            name: "T&J Logistics",
            price: 3000000,
            loadCapacity: 3000,
            speed: 90,
            reliability: 0.6,
        },
        3: {
            name: "Vilatana Transport",
            price: 5000000,
            loadCapacity: 5000,
            speed: 120,
            reliability: 0.8,
        },
        4: {
            name: "Supper Vip Pro Logistics",
            price: 10000000,
            loadCapacity: 10000,
            speed: 150,
            reliability: 1.0,
        },
        5: {
            name: "Delay Airline Logistics",
            price: 15000000,
            loadCapacity: 20000,
            speed: 200,
            reliability: 1.2,
        }
    },

    banks: {
        1: {
            name: "Bgring Bank",
            cycles: [30, 60, 120, 360], // days
            interestRates: [0.4, 0.6, 0.8, 1.0], // %
            deadline: 0, // timestamp
            debitMin: 1000000,
            debitMax: 10000000,
        },
        2: {
            name: "Bipcombank",
            cycles: [60, 120, 360],
            interestRates: [0.5, 0.7, 0.9, 1.2],
            debitMin: 200000,
            debitMax: 20000000,
        },
        3: {
            name: "BAC Bank",
            cycles: [30, 180, 270],
            interestRates: [0.2, 0.4, 0.6, 0.8],
            debitMin: 50000000,
            debitMax: 500000000,
        },
    },
}


