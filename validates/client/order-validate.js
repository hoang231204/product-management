const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

// Middleware xử lý kết quả validation chung và chống XSS
const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        const backUrl = req.get("Referrer") || '/';
        return res.redirect(backUrl);
    }

    // Làm sạch các trường thông tin đầu vào để phòng chống XSS
    ['fullname', 'phone', 'address'].forEach(field => {
        if (req.body[field]) {
            req.body[field] = sanitizeHtml(req.body[field], { allowedTags: [], allowedAttributes: {} });
        }
    });

    next();
};

// Quy tắc validate cho phần Chỉnh sửa tài khoản / thông tin (`editPatch`)
module.exports.editPatch = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập họ tên!'),
        
    body('phone')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập số điện thoại!')
        .matches(/^[0-9\-\+\s()]*$/).withMessage('Số điện thoại không hợp lệ!'),
        
    body('address')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập địa chỉ!'),
        
    runValidation
];