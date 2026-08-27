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
    if (req.body.position) req.body.position = Number(req.body.position);

    next();
};


const categoryRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập tiêu đề danh mục!'),

    body('position')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Vị trí phải là một số!')
        .isInt({ min: 1 }).withMessage('Vị trí phải lớn hơn hoặc bằng 1!'),

    runValidation
];

module.exports.create = categoryRules;
module.exports.edit = categoryRules;