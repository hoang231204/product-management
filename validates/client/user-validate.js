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

    // Làm sạch các trường dữ liệu chuỗi đề phòng chống XSS
    ['fullname', 'email', 'newEmail'].forEach(field => {
        if (req.body[field]) {
            req.body[field] = sanitizeHtml(req.body[field], { allowedTags: [], allowedAttributes: {} });
        }
    });

    next();
};

// 1. Đăng ký tài khoản
module.exports.register = [
    body('fullname')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập họ và tên!'),
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu!')
        .isLength({ min: 6 }).withMessage('Mật khẩu phải có ít nhất 6 ký tự!')
        .isString().withMessage('Mật khẩu không hợp lệ!'),
    runValidation
];

// 2. Đăng nhập
module.exports.login = [
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu!'),
    runValidation
];

// 3. Quên mật khẩu
module.exports.forgotPassword = [
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),
    runValidation
];

// 4. Xác thực OTP (Quên mật khẩu)
module.exports.otp = [
    body('email')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email!')
        .isEmail().withMessage('Email không hợp lệ!'),
    body('otp')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập mã OTP!'),
    runValidation
];

// 5. Đặt lại mật khẩu mới
module.exports.resetPassword = [
    body('password')
        .notEmpty().withMessage('Vui lòng nhập mật khẩu mới!')
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự!'),
    body('confirmPassword')
        .notEmpty().withMessage('Vui lòng nhập lại mật khẩu mới!')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Mật khẩu mới và xác nhận mật khẩu mới không khớp!');
            }
            return true;
        }),
    runValidation
];

// 6. Cập nhật thông tin / Đổi mật khẩu trong Profile
module.exports.profile = [
    body('password')
        .optional({ checkFalsy: true })
        .isLength({ min: 6 }).withMessage('Mật khẩu cũ phải có ít nhất 6 ký tự!'),
    body('newPassword')
        .optional({ checkFalsy: true })
        .isLength({ min: 6 }).withMessage('Mật khẩu mới phải có ít nhất 6 ký tự!'),
    body().custom((value, { req }) => {
        const { password, newPassword, confirmNewPassword } = req.body;

        // Nếu có nhập mật khẩu mới hoặc xác nhận mà thiếu mật khẩu cũ
        if ((newPassword || confirmNewPassword) && !password) {
            throw new Error('Vui lòng nhập mật khẩu cũ để thay đổi mật khẩu mới!');
        }

        // Nếu có nhập mật khẩu cũ mà thiếu 1 trong 2 ô mật khẩu mới
        if (password && (!newPassword || !confirmNewPassword)) {
            throw new Error('Vui lòng nhập đầy đủ thông tin để thay đổi mật khẩu!');
        }

        // Kiểm tra khớp mật khẩu mới
        if (newPassword && newPassword !== confirmNewPassword) {
            throw new Error('Mật khẩu mới và xác nhận mật khẩu mới không khớp!');
        }

        return true;
    }),
    runValidation
];

// 7. Yêu cầu đổi email
module.exports.changeEmail = [
    body('newEmail')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email mới!')
        .isEmail().withMessage('Email mới không hợp lệ!'),
    runValidation
];

// 8. Xác thực OTP đổi email
module.exports.changeEmailOtp = [
    body('newEmail')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập email mới!')
        .isEmail().withMessage('Email mới không hợp lệ!'),
    body('otp')
        .trim()
        .notEmpty().withMessage('Vui lòng nhập mã OTP!'),
    runValidation
];