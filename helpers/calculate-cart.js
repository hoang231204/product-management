const calcuNewPrice = require('./calcu-new-price'); 

module.exports = (products) => {
    const validProducts = products.filter(item => item.product_id && typeof item.product_id === 'object' && item.product_id._id);
    validProducts.forEach(item => {
        const price = item.product_id.price || 0;
        const discount = item.product_id.discountPercentage || 0;
        item.product_id.priceNew = calcuNewPrice.priceNew(price, discount);
    });
    const totalPrice = validProducts.reduce((total, item) => {
        const itemPrice = (item.product_id.priceNew || 0) * item.quantity;
        return total + itemPrice;
    }, 0);
    return {
        products: validProducts,
        totalPrice
    };
};