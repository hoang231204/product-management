const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        const backUrl = req.get("Referrer") || '/';
        return res.redirect(backUrl);
    }

    ['fullname', 'phone', 'address'].forEach(field => {
        if (req.body[field]) {
            req.body[field] = sanitizeHtml(req.body[field], { allowedTags: [], allowedAttributes: {} });
        }
    });

    next();
};


module.exports.checkout = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập họ và tên!'),
        
    body('phone')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập số điện thoại!')
        .matches(/^[0-9\-\+\s()]*$/).withMessage('Số điện thoại không hợp lệ!'), // Tùy chọn: Thêm kiểm tra định dạng số điện thoại cơ bản
        
    body('address')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập địa chỉ!'),
        
    runValidation
];