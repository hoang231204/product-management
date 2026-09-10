const createTree = require('../helpers/create-tree');

describe('createTree helper function', () => {
    
    test('should return an empty array when categories list is empty', () => {
        const result = createTree([]);
        expect(result).toEqual([]);
    });

    test('should build a flat tree of root items and assign sequential indices', () => {
        const categories = [
            { _id: 1, title: 'Category 1', parent_id: null },
            { _id: 2, title: 'Category 2', parent_id: null }
        ];

        const result = createTree(categories);

        expect(result).toEqual([
            { _id: 1, title: 'Category 1', parent_id: null, index: 1 },
            { _id: 2, title: 'Category 2', parent_id: null, index: 2 }
        ]);
    });

    test('should build a nested tree hierarchy with correct children and indices', () => {
        const categories = [
            { _id: 1, title: 'Electronics', parent_id: null },
            { _id: 2, title: 'Smartphones', parent_id: 1 },
            { _id: 3, title: 'Laptops', parent_id: 1 },
            { _id: 4, title: 'Fashion', parent_id: null }
        ];

        const result = createTree(categories);

        expect(result).toEqual([
            {
                _id: 1,
                title: 'Electronics',
                parent_id: null,
                index: 1,
                children: [
                    { _id: 2, title: 'Smartphones', parent_id: 1, index: 2 },
                    { _id: 3, title: 'Laptops', parent_id: 1, index: 3 }
                ]
            },
            {
                _id: 4,
                title: 'Fashion',
                parent_id: null,
                index: 4
            }
        ]);
    });

    test('should handle multi-level deep nesting correctly', () => {
        const categories = [
            { _id: 1, title: 'Root', parent_id: null },
            { _id: 2, title: 'Level 1', parent_id: 1 },
            { _id: 3, title: 'Level 2', parent_id: 2 }
        ];

        const result = createTree(categories);

        expect(result).toEqual([
            {
                _id: 1,
                title: 'Root',
                parent_id: null,
                index: 1,
                children: [
                    {
                        _id: 2,
                        title: 'Level 1',
                        parent_id: 1,
                        index: 2,
                        children: [
                            { _id: 3, title: 'Level 2', parent_id: 2, index: 3 }
                        ]
                    }
                ]
            }
        ]);
    });

    test('should reset count variable across multiple function calls', () => {
        const categories = [
            { _id: 1, title: 'A', parent_id: null }
        ];

        const firstRun = createTree(categories);
        expect(firstRun[0].index).toBe(1);
        const secondRun = createTree(categories);
        expect(secondRun[0].index).toBe(1);
    });
});