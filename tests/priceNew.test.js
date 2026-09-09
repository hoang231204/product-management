const { priceNew } = require('../helpers/calcu-new-price'); 

describe('priceNew function', () => {
    test('should calculate the discounted price and round it correctly', () => {
        expect(priceNew(1000, 10)).toBe(900); 
        expect(priceNew(2000, 15)).toBe(1700);
    });

    test('should handle 0% discount correctly', () => {
        expect(priceNew(500, 0)).toBe(500);
    });

    test('should handle decimal rounding correctly', () => {
        expect(priceNew(100, 33)).toBe(67);
    });
});