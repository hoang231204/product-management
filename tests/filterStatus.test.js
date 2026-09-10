const filterStatus = require('../helpers/filter-status');

describe('filterStatus helper function', () => {
    
    test('should return default status with empty string active when query.status is missing', () => {
        const query = {};
        const result = filterStatus(query, 'product');
        const defaultItem = result.find(item => item.status === '');
        expect(defaultItem.class).toBe('active');
        const activeItems = result.filter(item => item.class === 'active');
        expect(activeItems.length).toBe(1);
    });

    test('should filter correct statuses for order type and set active class', () => {
        const query = { status: 'pending' };
        const result = filterStatus(query, 'order');
        const statuses = result.map(item => item.status);
        expect(statuses).toEqual(['', 'pending', 'confirmed', 'shipping', 'delivered', 'canceled']);
        const pendingItem = result.find(item => item.status === 'pending');
        expect(pendingItem.class).toBe('active');
    });

    test('should filter correct statuses for blog type', () => {
        const query = { status: 'inactive' };
        const result = filterStatus(query, 'blog');

        const statuses = result.map(item => item.status);
        expect(statuses).toEqual(['', 'active', 'inactive', 'pending']);

        const inactiveItem = result.find(item => item.status === 'inactive');
        expect(inactiveItem.class).toBe('active');
    });

    test('should handle user and account types identically', () => {
        const query = { status: 'active' };
        const userResult = filterStatus(query, 'user');
        const accountResult = filterStatus(query, 'account');

        expect(userResult).toEqual(accountResult);
        
        const activeItem = userResult.find(item => item.status === 'active');
        expect(activeItem.class).toBe('active');
    });

    test('should filter category type correctly', () => {
        const query = {};
        const result = filterStatus(query, 'category');

        const statuses = result.map(item => item.status);
        expect(statuses).toEqual(['', 'active', 'inactive']);
    });
});