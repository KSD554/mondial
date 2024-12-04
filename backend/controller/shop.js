const express = require("express");
const cloudinary = require("cloudinary");
const jwt = require("jsonwebtoken");
const path = require("path");
const sendMail = require("../utils/sendMail");
const Shop = require("../model/shop");
const {
  isAuthenticated,
  isSeller,
  isAdmin,
} = require("../middleware/auth");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const sendShopToken = require("../utils/shopToken");

const router = express.Router();

/**
 * Route : Création d'une boutique
 */
router.post(
  "/create-shop",
  catchAsyncErrors(async (req, res, next) => {
    const { email, name, password, address, phoneNumber, zipCode, avatar } = req.body;

    if (!email || !name || !password || !address || !phoneNumber || !zipCode || !avatar) {
      return next(new ErrorHandler("Tous les champs sont obligatoires", 400));
    }

    const existingShop = await Shop.findOne({ email });
    if (existingShop) {
      return next(new ErrorHandler("Cet utilisateur existe déjà", 400));
    }

    const myCloud = await cloudinary.v2.uploader.upload(avatar, {
      folder: "avatars",
    });

    const seller = {
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
      address,
      phoneNumber,
      zipCode,
    };

    const activationToken = createActivationToken(seller);
    const activationUrl = `https://mondial-five.vercel.app/seller/activation/${activationToken}`;

    try {
      await sendMail({
        email: seller.email,
        subject: "Activation de votre boutique",
        message: `Bonjour ${seller.name}, veuillez activer votre boutique en cliquant sur le lien suivant : ${activationUrl}`,
      });
      res.status(201).json({
        success: true,
        message: `Veuillez vérifier votre email (${seller.email}) pour activer votre boutique.`,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }
  })
);

/**
 * Génère un token d'activation
 */
const createActivationToken = (seller) => {
  return jwt.sign(seller, process.env.ACTIVATION_SECRET, {
    expiresIn: "5m",
  });
};

/**
 * Route : Activation d'une boutique
 */
router.post(
  "/activation",
  catchAsyncErrors(async (req, res, next) => {
    const { activation_token } = req.body;

    if (!activation_token) {
      return next(new ErrorHandler("Token d'activation manquant", 400));
    }

    const newSeller = jwt.verify(activation_token, process.env.ACTIVATION_SECRET);
    if (!newSeller) {
      return next(new ErrorHandler("Token invalide ou expiré", 400));
    }

    const existingShop = await Shop.findOne({ email: newSeller.email });
    if (existingShop) {
      return next(new ErrorHandler("Cet utilisateur existe déjà", 400));
    }

    const shop = await Shop.create(newSeller);
    sendShopToken(shop, 201, res);
  })
);

/**
 * Route : Connexion à une boutique
 */
router.post(
  "/login-shop",
  catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler("Tous les champs sont obligatoires", 400));
    }

    const shop = await Shop.findOne({ email }).select("+password");
    if (!shop) {
      return next(new ErrorHandler("Utilisateur introuvable", 400));
    }

    const isPasswordValid = await shop.comparePassword(password);
    if (!isPasswordValid) {
      return next(new ErrorHandler("Informations incorrectes", 400));
    }

    sendShopToken(shop, 200, res);
  })
);

/**
 * Route : Déconnexion d'une boutique
 */
router.get(
  "/logout",
  catchAsyncErrors(async (req, res) => {
    res.cookie("seller_token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    res.status(200).json({ success: true, message: "Déconnexion réussie !" });
  })
);

/**
 * Route : Récupérer les informations d'une boutique
 */
router.get(
  "/get-shop-info/:id",
  catchAsyncErrors(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return next(new ErrorHandler("Boutique introuvable", 404));
    }

    res.status(200).json({ success: true, shop });
  })
);

/**
 * Route : Mettre à jour le profil d'une boutique
 */
router.put(
  "/update-seller-info",
  isSeller,
  catchAsyncErrors(async (req, res, next) => {
    const { name, description, address, phoneNumber, zipCode } = req.body;

    const shop = await Shop.findById(req.seller._id);
    if (!shop) {
      return next(new ErrorHandler("Boutique introuvable", 404));
    }

    if (name) shop.name = name;
    if (description) shop.description = description;
    if (address) shop.address = address;
    if (phoneNumber) shop.phoneNumber = phoneNumber;
    if (zipCode) shop.zipCode = zipCode;

    await shop.save();
    res.status(200).json({ success: true, shop });
  })
);

/**
 * Route : Supprimer une boutique (Admin)
 */
router.delete(
  "/delete-seller/:id",
  isAuthenticated,
  isAdmin("Admin"),
  catchAsyncErrors(async (req, res, next) => {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return next(new ErrorHandler("Boutique introuvable", 404));
    }

    await Shop.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Boutique supprimée avec succès !" });
  })
);

module.exports = router;
