const mongoose = require('mongoose');

const cached = global.mongoose || (global.mongoose = { conn: null, promise: null });

module.exports.connect = async () => {
    if (cached.conn && mongoose.connection.readyState === 1) {
        return cached.conn;
    }

    if (cached.promise) {
        cached.conn = await cached.promise;
        return cached.conn;
    }

    if (mongoose.connection.readyState === 0) {
        cached.conn = null;
        cached.promise = null;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO, {
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000
        });
    }

    try {
        cached.conn = await cached.promise;
        return cached.conn;
    } catch (error) {
        cached.promise = null;
        cached.conn = null;
        throw error;
    }
};