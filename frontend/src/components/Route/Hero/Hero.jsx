import React from "react";
import { Link } from "react-router-dom";
import styles from "../../../styles/styles";

const Hero = () => {
  return (
    <div
      className={`relative min-h-[70vh] 800px:min-h-[80vh] w-full bg-no-repeat ${styles.noramlFlex}`}
      style={{
        backgroundImage:
          "url(https://themes.rslahmed.dev/rafcart/assets/images/banner-2.jpg)",
      }}
    >
      <div className={`${styles.section} w-[90%] 800px:w-[60%]`}>
        <h1
          className={`text-[50px] leading-[1.2] 800px:text-[55px] text-[#3d3a3a] font-[600] capitalize`}
        >
          Mondial
        </h1>
        <p className="pt-5 text-[16px] font-[Poppins] font-[400] text-[#000000ba]">
        Bienvenue sur Mondial, votre marketplace multivendeur où vous pouvez explorer un vaste univers de produits provenant de vendeurs du monde entier. Que vous recherchiez des articles de mode, des produits high-tech, des cosmétiques, ou des accessoires pour la maison, vous trouverez tout ce dont vous avez besoin en un seul endroit. Nous connectons des milliers de vendeurs pour vous offrir un choix inégalé, des prix compétitifs, et des offres exclusives. Profitez d'une expérience d'achat fluide, sécurisée, et rapide, avec la livraison à votre porte. Mondial Store :{" "}
        l'endroit où le monde fait ses courses !
        </p>
        <Link to="/products" className="inline-block">
            <div className={`${styles.button} mt-5`}>
                 <span className="text-[#fff] font-[Poppins] text-[18px]">
                 C'est parti !
                 </span>
            </div>
        </Link>
      </div>
    </div>
  );
};

export default Hero;
