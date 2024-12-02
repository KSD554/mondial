const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
    const { token } = req.cookies;

    // Vérification si le token est présent
    if (!token) {
        return next(new ErrorHandler("Please login to continue", 401));
    }

    try {
        // Décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        // Ajouter l'utilisateur dans la requête
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorHandler("User not found", 404));
        }

        next();  // Passer à la prochaine étape si tout est valide
    } catch (error) {
        // Gérer les erreurs liées à JWT (token invalide, expiré...)
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});



exports.isSeller = catchAsyncErrors(async(req,res,next) => {
    const {seller_token} = req.cookies;
    if(!seller_token){
        return next(new ErrorHandler("Please login to continue", 401));
    }

    const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

    req.seller = await Shop.findById(decoded.id);

    next();
});


exports.isAdmin = (...roles) => {
    return (req,res,next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} can not access this resources!`))
        };
        next();
    }
}