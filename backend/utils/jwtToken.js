// Create token and save it in cookies
const sendToken = (user, statusCode, res) => {
  // Generate JWT token
  const token = user.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 jours
    httpOnly: true, // Empêche l'accès via JavaScript côté client
    sameSite: "none", // Permet les requêtes cross-origin
    secure: true, // Nécessite HTTPS pour envoyer le cookie
  };

  // Réponse avec le token et les informations utilisateur
  res.status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      message: "Token generated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Facultatif : Ajoutez les champs pertinents
      },
      token, // Facultatif : Inclure ou non dans la réponse selon votre stratégie
    });
};

module.exports = sendToken;
