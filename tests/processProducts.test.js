const processProducts = require('../helpers/calculate-cart'); 
const calcuNewPrice = require('../helpers/calcu-new-price');

jest.mock('../helpers/calcu-new-price', () => ({
    priceNew: jest.fn((price, discount) => Math.round(price * (1 - discount / 100)))
}));

describe('processProducts function', () => {
    test('should filter out invalid products, calculate new prices, and compute total price', () => {
        const inputProducts = [
            { 
                product_id: { _id: 'p1', price: 100, discountPercentage: 10 }, 
                quantity: 2 
            },
            { 
                product_id: null 
            }, 
            { 
                product_id: { price: 200, discountPercentage: 0 } 
            },
            { 
                product_id: { _id: 'p2', price: 200, discountPercentage: 20 }, 
                quantity: 1 
            } 
        ];
        const result = processProducts(inputProducts);
        expect(result.products.length).toBe(2);
        expect(result.products[0].product_id.priceNew).toBe(90);
        expect(result.products[1].product_id.priceNew).toBe(160);
        expect(result.totalPrice).toBe(340); 
    });

    test('should return empty products and 0 total price when input is empty', () => {
        const result = processProducts([]);
        expect(result.products).toEqual([]);
        expect(result.totalPrice).toBe(0);
    });
});