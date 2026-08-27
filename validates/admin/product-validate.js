const { body, validationResult } = require('express-validator');
const sanitizeHtml = require('sanitize-html');

const runValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.flash("error", errors.array()[0].msg);
        const backUrl = req.get("Referrer") || '/';
        return res.redirect(backUrl);
    }

    if (req.body.title) {
        req.body.title = sanitizeHtml(req.body.title, { allowedTags: [], allowedAttributes: {} });
    }

    if (req.body.description) {
        req.body.description = sanitizeHtml(req.body.description, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'u', 'span', 'div', 'iframe', 'table', 'tbody', 'tr', 'td', 'th' ]),
            allowedAttributes: {
                ...sanitizeHtml.defaults.allowedAttributes,
                '*': ['style', 'class', 'id'], 
                'img': ['src', 'alt', 'title', 'width', 'height'],
                'iframe': ['src', 'width', 'height', 'frameborder', 'allowfullscreen']
            },
            allowedStyles: {
                '*': {
                    'color': [/.*/],
                    'background-color': [/.*/],
                    'text-align': [/.*/],
                    'font-size': [/.*/],
                    'font-family': [/.*/],
                    'width': [/.*/],
                    'height': [/.*/]
                }
            }
        });
    }

    if (req.body.price) req.body.price = Number(req.body.price);
    if (req.body.discountPercentage) req.body.discountPercentage = Number(req.body.discountPercentage);
    if (req.body.stock) req.body.stock = Number(req.body.stock);
    if (req.body.position) req.body.position = Number(req.body.position);

    next();
};

const productRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập tiêu đề sản phẩm!'),

    body('price')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Giá bán phải là một số!'),

    body('discountPercentage')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Phần trăm giảm giá phải là số!')
        .isInt({ min: 0, max: 100 }).withMessage('Phần trăm giảm giá phải từ 0 đến 100!'),

    body('stock')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Số lượng tồn kho phải là số!')
        .isInt({ min: 0 }).withMessage('Số lượng tồn kho không được âm!'),

    body('position')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Vị trí hiển thị phải là số!'),

    runValidation
];

module.exports.create = productRules;
module.exports.edit = productRules;