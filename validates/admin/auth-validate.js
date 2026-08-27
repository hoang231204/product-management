const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        const backUrl = req.get("Referrer") || '/';
        return res.redirect(backUrl);
    }
    if (req.body.email) {
        req.body.email = sanitizeHtml(req.body.email, { allowedTags: [], allowedAttributes: {} });
    }

    next();
};

module.exports.login = [
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu!'),

    runValidation
];