const searchHelper = require('../helpers/search'); 
describe('search helper function', () => {
    
    test('should return a RegExp instance with case-insensitive flag', () => {
        const query = { keyword: 'laptop' };
        const result = searchHelper(query);
        expect(result).toBeInstanceOf(RegExp);
        expect(result.ignoreCase).toBe(true);
        expect(result.source).toBe('laptop');
    });

    test('should correctly match strings case-insensitively using the generated regex', () => {
        const query = { keyword: 'iphone' };
        const regex = searchHelper(query);
        expect(regex.test('iPhone 15 Pro Max')).toBe(true);
        expect(regex.test('IPHONE')).toBe(true);
        expect(regex.test('iphone')).toBe(true);
        expect(regex.test('Samsung Galaxy')).toBe(false);
    });

    test('should handle Vietnamese text and diacritics properly', () => {
        const query = { keyword: 'điện thoại' };
        const regex = searchHelper(query);

        expect(regex.test('Cửa hàng Điện Thoại chính hãng')).toBe(true);
        expect(regex.test('laptop gaming')).toBe(false);
    });
});