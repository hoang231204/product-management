const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        const backUrl = req.get("Referrer") || '/';
        return res.redirect(backUrl);
    }
    if (req.body.fullname) {
        req.body.fullname = sanitizeHtml(req.body.fullname, { allowedTags: [], allowedAttributes: {} });
    }
    if (req.body.email) {
        req.body.email = sanitizeHtml(req.body.email, { allowedTags: [], allowedAttributes: {} });
    }

    next();
};

module.exports.create = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập họ và tên!'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),
    
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu!'),

    runValidation
];

module.exports.edit = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập họ và tên!'),
    
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),

    runValidation
];