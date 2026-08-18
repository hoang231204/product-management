const User = require('../../models/user-model');
const Session = require('../../models/session-model');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const ACCESS_TOKEN_TTL = process.env.ACCESS_TOKEN_TTL || '15m';
module.exports.checkLogin = async (req, res, next) =>{
    const token = req.cookies.token;
    if(token){
        try {
            const decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-hashedPassword").lean();
            if(user){
                res.locals.user = user;
            }
        } catch (error) {
            res.clearCookie('token');
        }
    }
    else{
        const oldRefreshToken = req.cookies.refreshToken;
        if (oldRefreshToken) {
            try {
                //Tìm token trong DB
                const tokenRecord = await Session.findOne({ token: oldRefreshToken });
                if(tokenRecord && tokenRecord.expiresAt > new Date()){
                    res.locals.user = await User.findById(tokenRecord.userId).select("-hashedPassword").lean();
                    //Xoay vòng (Rotation): Xóa cái cũ, tạo cái mới
                    await Session.deleteOne({ token: oldRefreshToken });
                    const newAccessToken = jwt.sign({ userId: tokenRecord.userId }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_TTL });
                    const newRefreshToken = crypto.randomBytes(64).toString('hex');
                    // Lưu mới vào DB
                    await Session.create({
                        userId: tokenRecord.userId,
                        token: newRefreshToken,
                        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    });
                    //Cập nhật Cookie
                    res.cookie('token', newAccessToken, { httpOnly: true, maxAge: 15 * 60 * 1000 });
                    res.cookie('refreshToken', newRefreshToken, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
                    }
            }catch (error) {
                console.error('Error during token refresh:', error);
            }
        } 
    }
    next();
}