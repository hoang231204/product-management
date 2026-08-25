const Order = require('../models/order-model');
const Product = require('../models/product-model'); 

let workerInterval = null;

const startOrderExpirationWorker = () => {
    workerInterval = setInterval(async () => {
        try {
            const now = new Date();
            const expiredOrders = await Order.find({
                paymentStatus: 'unpaid',
                expiresAt: { $lt: now }
            });

            if (expiredOrders.length > 0) {
                for (const order of expiredOrders) {
                    const bulkOps = order.products.map(item => ({
                        updateOne: {
                            filter: { _id: item.product_id },
                            update: { $inc: { stock: item.quantity } }
                        }
                    }));
                    await Product.bulkWrite(bulkOps);
                    order.paymentStatus = 'expired';
                    await order.save();
                }
            }
        } catch (error) {
            console.error('Lỗi khi chạy background job hoàn kho:', error);
        }
    }, 60 * 1000);
};

const stopOrderExpirationWorker = () => {
    if (workerInterval) {
        clearInterval(workerInterval);
        console.log('[Worker] Order Expiration Worker đã dừng.');
    }
};

module.exports = {
    startOrderExpirationWorker,
    stopOrderExpirationWorker
};