const fs = require('fs');

// Lire le fichier JSON
fs.readFile('search.json', 'utf8', (err, data) => {
    if (err) {
        console.error("Erreur lors de la lecture du fichier JSON:", err);
        return;
    }

    // Parser le JSON
    const jsonData = JSON.parse(data);

    // Créer une liste pour stocker les valeurs
    var valuesList = [{}];

    // Parcourir toutes les annonces
    jsonData.ads.forEach(ad => {
        // Vérifier si l'index 20 existe dans les attributs
        if (ad.attributes.length > 20) {
            // Récupérer la valeur et l'ajouter à la liste
            viager = false
            ad.attributes.forEach(att =>{
                if(att.key == "immo_sell_type"){
                    if(att.value == "viager"){
                        viager = true;
                    }
                }
            });

            if(viager == false){
                ad.attributes.forEach(att =>{
                    if(att.key == "price_per_square_meter"){
                        values = {
                            "price_per_square_meter": att.value,
                            "ad_id": ad.list_id
                        }
                        valuesList.push(values);
                    }
                });
            }
        }
    });

    valuesList.sort((a, b) => a.price_per_square_meter - b.price_per_square_meter);


    // Afficher la liste des valeurs récupérées
    console.log(valuesList);
});
