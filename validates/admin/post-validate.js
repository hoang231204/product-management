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

    const mceOptions = {
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
    };
    if (req.body.description) {
        req.body.description = sanitizeHtml(req.body.description, mceOptions);
    }
    if (req.body.content) {
        req.body.content = sanitizeHtml(req.body.content, mceOptions);
    }
    if (req.body.position) req.body.position = Number(req.body.position);

    next();
};

const postRules = [
    body('title')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập tiêu đề bài viết!'),

    body('position')
        .optional({ checkFalsy: true })
        .isNumeric().withMessage('Vị trí phải là một số!')
        .isInt({ min: 1 }).withMessage('Vị trí phải lớn hơn hoặc bằng 1!'),

    body('featured')
        .optional()
        .isIn(['0', '1']).withMessage('Giá trị bài viết nổi bật không hợp lệ!'),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'pending']).withMessage('Trạng thái bài viết không hợp lệ!'),

    runValidation
];

module.exports.create = postRules;
module.exports.edit = postRules;