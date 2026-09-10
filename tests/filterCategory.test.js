const PostCategory = require('../models/post-category-model');
const filterCategory = require('../helpers/filter-category'); 
jest.mock('../models/post-category-model');

describe('filterCategory helper function', () => {
    
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should fetch categories, add "Tất cả", and set active class on default (empty slug) when query.slugCategory is missing', async () => {
        const mockCategoriesFromDB = [
            { _id: '1', title: 'Công nghệ', slug: 'cong-nghe' },
            { _id: '2', title: 'Đời sống', slug: 'doi-song' }
        ];
        PostCategory.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockCategoriesFromDB)
            })
        });

        const query = {};
        const result = await filterCategory(query);
        expect(result[0]).toEqual({ title: 'Tất cả', slug: '', class: 'active' });
        expect(result[1].class).toBe('');
        expect(result[2].class).toBe('');
        expect(result.length).toBe(3);
    });

    test('should set active class on specific category when query.slugCategory matches', async () => {
        const mockCategoriesFromDB = [
            { _id: '1', title: 'Công nghệ', slug: 'cong-nghe' },
            { _id: '2', title: 'Đời sống', slug: 'doi-song' }
        ];

        PostCategory.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue(mockCategoriesFromDB)
            })
        });

        const query = { slugCategory: 'cong-nghe' };
        const result = await filterCategory(query);
        const allItem = result.find(item => item.slug === '');
        expect(allItem.class).toBe('');
        const targetItem = result.find(item => item.slug === 'cong-nghe');
        expect(targetItem.class).toBe('active');
    });

    test('should handle empty categories database result gracefully', async () => {
        PostCategory.find.mockReturnValue({
            select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([])
            })
        });

        const query = {};
        const result = await filterCategory(query);
        expect(result).toEqual([
            { title: 'Tất cả', slug: '', class: 'active' }
        ]);
    });
});