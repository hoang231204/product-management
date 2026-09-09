const paginationHelper = require('../helpers/pagination'); 

describe('paginationHelper function', () => {
    test('should return default pagination when query has no page and limit is omitted', () => {
        const query = {};
        const countData = 50;
        
        const result = paginationHelper(query, countData);

        expect(result).toEqual({
            currentPage: 1,
            limitPage: 8,     
            skipPage: 0,       
            totalPage: 7    
        });
    });

    test('should calculate pagination correctly with query page and custom limit', () => {
        const query = { page: '3' };
        const countData = 45;
        const limit = 10;
        
        const result = paginationHelper(query, countData, limit);

        expect(result).toEqual({
            currentPage: 3,
            limitPage: 10,
            skipPage: 20,       
            totalPage: 5      
        });
    });

    test('should handle zero countData correctly', () => {
        const query = {};
        const countData = 0;
        const limit = 5;

        const result = paginationHelper(query, countData, limit);

        expect(result).toEqual({
            currentPage: 1,
            limitPage: 5,
            skipPage: 0,
            totalPage: 0  
        });
    });
});