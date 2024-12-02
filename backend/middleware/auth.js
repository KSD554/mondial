const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    if (!token) {
        console.error("Token is missing");
        return next(new ErrorHandler("Please login to continue", 401));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        console.log("Decoded Token:", decoded);

        req.user = await User.findById(decoded.id);

        if (!req.user) {
            console.error("User not found in database");
            return next(new ErrorHandler("User not found", 401));
        }

        next();
    } catch (error) {
        console.error("Token verification failed:", error.message);
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});



exports.isSeller = catchAsyncErrors(async (req, res, next) => {
    const { seller_token } = req.cookies;

    if (!seller_token) {
        console.error("Seller token is missing");
        return next(new ErrorHandler("Please login to continue", 401));
    }

    try {
        const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);
        console.log("Decoded Seller Token:", decoded);

        req.seller = await Shop.findById(decoded.id);

        if (!req.seller) {
            console.error("Seller not found in database");
            return next(new ErrorHandler("Seller not found", 401));
        }

        next();
    } catch (error) {
        console.error("Seller token verification failed:", error.message);
        return next(new ErrorHandler("Invalid or expired seller token", 401));
    }
});



exports.isAdmin = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            console.error("User not authenticated for admin access");
            return next(new ErrorHandler("Authentication required", 401));
        }

        if (!roles.includes(req.user.role)) {
            console.error(`Access denied for role: ${req.user.role}`);
            return next(
                new ErrorHandler(`${req.user.role} cannot access this resource!`, 403)
            );
        }

        next();
    };
};
