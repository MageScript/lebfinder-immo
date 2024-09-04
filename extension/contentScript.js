//@ sourceURL = contentScript.js

function sort_ads() {

    let ads_selector = "#mainContent > div.relative.\\[\\&\\:has\\(\\#search-left-btf-65-xl\\.liberty-filled\\)\\]\\:min-h-\\[1296px\\].\\[\\&\\:has\\(\\#search-right-btf-70-xl\\.liberty-filled\\)\\]\\:min-h-\\[1296px\\] > div.max-w-page-max.mx-auto.my-none.px-md.box-content.md\\:pt-md > div.styles_Listing__isoog.styles_listing--bigPicture__VQWTl > div.styles_classifiedColumn__Vz9uL > div:nth-child(3) > div";
    let ads = document.querySelectorAll(ads_selector);  

    // Tableau pour stocker les annonces et leurs prix
    let adsArray = [];

    // Parcourir toutes les annonces
    ads.forEach(ad => {
        if (ad.className == "styles_adCard__JzKik") {
            // Récupérer le prix de l'annonce
            let priceElement = ad.querySelector("a > div > div > div> div > div > div > p");
            
            if (priceElement) {
                let priceText = priceElement.textContent.trim();

                // Extraire le nombre (prix) du texte (enlever les symboles de monnaie)
                let price = parseFloat(priceText.replace(/[^\d,.-]/g, '').replace(',', '.'));
                
                // Ajouter l'annonce et son prix dans le tableau
                adsArray.push({
                    element: ad,
                    price: price
                });
            }
        }

        else{
            ad.remove();
        }
    });

    // Trier les annonces par prix croissant
    adsArray.sort((a, b) => a.price - b.price);

    // Sélectionner le conteneur parent des annonces pour les réorganiser
    let parentElement = document.querySelector(ads_selector).parentNode;

    // Réorganiser les annonces dans le DOM
    adsArray.forEach(adObj => {
        parentElement.appendChild(adObj.element);  // Réajouter chaque annonce triée dans le DOM
    });


}

sort_ads();