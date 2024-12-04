const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");
const Shop = require("../model/shop");

// Middleware pour vérifier si l'utilisateur est authentifié
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

        // Vérifier si l'utilisateur existe dans la base de données
        if (!req.user) {
            return next(new ErrorHandler("User not found", 404));
        }

        next();  // Passer à la prochaine étape si tout est valide
    } catch (error) {
        // Gérer les erreurs liées à JWT (token invalide, expiré...)
        return next(new ErrorHandler("Invalid or expired token", 401));
    }
});

// Middleware pour vérifier si le vendeur est authentifié
exports.isSeller = catchAsyncErrors(async (req, res, next) => {
    const { seller_token } = req.cookies;

    // Vérifier la présence du token vendeur
    if (!seller_token) {
        return next(new ErrorHandler("Please login to continue", 401));
    }

    try {
        // Décoder le token du vendeur
        const decoded = jwt.verify(seller_token, process.env.JWT_SECRET_KEY);

        // Trouver le vendeur dans la base de données
        req.seller = await Shop.findById(decoded.id);

        // Vérifier si le vendeur existe
        if (!req.seller) {
            return next(new ErrorHandler("Seller not found", 404));
        }

        next();  // Passer à la prochaine étape si tout est valide
    } catch (error) {
        // Gérer les erreurs liées au token vendeur (token invalide, expiré...)
        return next(new ErrorHandler("Invalid or expired seller token", 401));
    }
});

// Middleware pour vérifier si l'utilisateur a un rôle spécifique (admin)
exports.isAdmin = (...roles) => {
    return (req, res, next) => {
        // Vérifier que l'utilisateur a un rôle valide et qu'il correspond à l'un des rôles permis
        if (!roles.includes(req.user.role)) {
            return next(new ErrorHandler(`${req.user.role} cannot access this resource!`, 403)); // Code 403 pour interdire l'accès
        }
        next();
    };
};
