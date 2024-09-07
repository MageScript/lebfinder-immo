//@ sourceURL = contentScript.js


function get_url_from_lbc_page_number(page_number){
    let current_url = window.location.href;
    let target_url = current_url + "&page=" + page_number;
    return target_url;
}

function get_max_number_of_pages(){
   let element = document.querySelector("#mainContent > div.relative.\\[\\&\\:has\\(\\#search-left-btf-65-xl\\.liberty-filled\\)\\]\\:min-h-\\[1296px\\].\\[\\&\\:has\\(\\#search-right-btf-70-xl\\.liberty-filled\\)\\]\\:min-h-\\[1296px\\] > div.max-w-page-max.mx-auto.my-none.px-md.box-content.md\\:pt-md > div.flex.items-center.mb-lg.md\\:mb-xl > h2");
   let text = element.textContent;
   let number_of_ad = text.split(" ")[0];
   let max_number_of_pages = int(number_of_ad / 37);
   return max_number_of_pages;
}

function delete_ads(doc=document){
    try{
        let head_ad = doc.getElementById("lht-space-ad");
        if(head_ad){
            head_ad.remove();
        }
    
        let left_ads_side = doc.getElementsByClassName("styles_sideColumn__Om95h")[0];
        if(left_ads_side){
            left_ads_side.remove();
        }
    
        let ads = get_all_ads_elements(doc);
        if(ads != false){
            ads.forEach(ad => {
                if (ad.className == "styles_ad__TwvnY") {
                    ad.remove();
                }
            });
        }
    }
    catch(error){
        console.log(error.message);
    }
}

function get_all_ads_elements(doc=document){
    let container = doc.querySelectorAll('.mb-lg');
    let ads = Array.from(container).filter(el => el.classList.length === 1 && el.classList.contains('mb-lg'));
     
    if (ads.length > 0) {
        let child_ads = Array.from(ads[0].children); // Récupère uniquement les enfants directs si le parent existe
        return child_ads;
      } else {
        return false;
    }
}

function get_ads_attributes(doc){
    // Récupérer le contenu JSON d'une balise script
    var scriptContent = doc.getElementById('__NEXT_DATA__').textContent;

    // Parser le contenu JSON en objet JavaScript
    var data = JSON.parse(scriptContent);

    let ads_attributes = data.props.pageProps.searchData.ads;

    return ads_attributes;
}

function get_html_element_from_ad_id(target_ad_id, doc){
    var ads = get_all_ads_elements(doc);
    if(ads == false) return false;
    var is_found = false;
    var found_ad = null;
    ads.forEach(ad => {
        var ad_id = 0;
        try{
            var child_a = ad.querySelector('a');
            var href = child_a.getAttribute("href");
            var ad_id = href.split('/')[3];
        }
        catch (error){
            console.log(error.message);
        }
        if(ad_id == target_ad_id){
            is_found = true;
            found_ad = ad;
        }
    });
    if(is_found == true){
        return found_ad;
    }
    return false;
}

function calculate_return_rate(average_rent_per_square_meter, price, annual_charges, square){
    let mensual_rent = square * average_rent_per_square_meter;
    let annual_real_return = mensual_rent*12 - annual_charges;
    let return_rate = (annual_real_return)/price;
    return return_rate;
}

async function scrapeLeboncoin(pages) {

    let ads_attributes = []; 
    let ads_elements = [];
    for (let page = 1; page <= pages; page++) {
        try{
            const url = get_url_from_lbc_page_number(page);
            console.log(`Fetching page ${page}...`);
            
            // Utiliser fetch pour récupérer la page HTML
            const response = await fetch(url);
            const text = await response.text();
            
            // Créer un DOMParser pour analyser la réponse HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, 'text/html');

            //supprimer les pubs
            delete_ads(doc);

            // Sélectionner les éléments HTML que tu veux extraire (par exemple, les annonces)
            let ads_attributes_for_current_page = get_ads_attributes(doc);

            //recuperer tous les ads
            ads_attributes_for_current_page.forEach(aafcp => {
                let ad_element = get_html_element_from_ad_id(aafcp.list_id.toString(), doc);
                ads_elements.push(ad_element);
            });

            //pousser les attributs de la page en question
            ads_attributes.push(ads_attributes_for_current_page); 
        }
        
        catch(error){
            console.log(error.message);
            break;
        }
    }

    // À la fin du parcours des pages, tu auras tous les résultats
    let flattened_ads_attributes = ads_attributes.flat();

    let results = flattened_ads_attributes.map((ad_attribute, index) => {
        return { ad_attributes: ad_attribute, ad_element: ads_elements[index] };
    });

    return results;
}

function add_pictures(results){
    results.forEach(res => {
        try{
            let picture_url = res.ad_attributes.images.small_url;
            let image_element = res.ad_element.querySelector('.adcard_9ec456820 > .adcard_f346042c5 > .relative');
            let style_injection = "url(\'" + picture_url + "\')"
            image_element.style.backgroundImage = style_injection;
            image_element.style.backgroundRepeat = "no-repeat";
            image_element.style.backgroundSize = "cover";
            image_element.style.backgroundPosition = "center";
    
            //changer la taille des images
            let picture_container = res.ad_element.querySelector('.adcard_7c1e7cd4d  > a');
            picture_container.style.width = "35%";
        }
        catch(error){
            console.log(error.message);
        }
    });
}

async function sort_ads() {

    // supprimer les pubs
    delete_ads();

    //scraper un certain nombre de page
    let results  = await scrapeLeboncoin(5);  

    // Tableau pour stocker les rendements net de charges foncières
    let return_rates = [];

    // Parcourir toutes les annonces
    results.forEach(res => {
        
        //chercher le prix de l'ad
        let price = parseInt(res.ad_attributes.price[0], 10);

        //chercher le type de bien en question
        let real_estate_type = "unknown";
        res.ad_attributes.attributes.forEach(att => {
            if(att.key == "real_estate_type"){
                real_estate_type = att.value_label;
            }
        });

        //chercher le loyer moyen au m2
        let average_rent_per_square_meter = 11.8;

        //chercher les charge de copro de l'ad et le nombre de m2
        let annual_charges = 0;
        let square = 0;
        if(real_estate_type == "Appartement"){
            res.ad_attributes.attributes.forEach(att => {
                if(att.key == "annual_charges"){
                    annual_charges = parseInt(att.value, 10);
                }
                if(att.key == "square"){
                    square = parseInt(att.value, 10);
                }
            });

            if(annual_charges != 0 && square != 0){
                return_rates.push({
                    element: res.ad_element,
                    rate: calculate_return_rate(average_rent_per_square_meter, price, annual_charges, square)
                });
            }
            else{
                return_rates.push({
                    element: res.ad_element,
                    rate: 0
                });
            }
        }
        else if(real_estate_type == "Maison"){
            res.ad_attributes.attributes.forEach(att => {
                if(att.key == "square"){
                    square = parseInt(att.value, 10);
                }
            });

            if(square != 0){
                return_rates.push({
                    element: res.ad_element,
                    rate: calculate_return_rate(average_rent_per_square_meter, price, annual_charges, square)
                });
            }
        }
        else{
            return_rates.push({
                element: res.ad_element,
                rate: 0
            });
        }
    });

    // Trier les annonces par rendement décroissant
    return_rates.sort((a, b) => b.rate - a.rate);

    // Sélectionner le conteneur parent des annonces pour les réorganiser
    let container = document.querySelectorAll('.mb-lg');
    let container_filtered = Array.from(container).filter(el => el.classList.length === 1 && el.classList.contains('mb-lg'));
    let container_filtered_good_one = container_filtered[0];

    //supprimer les elements de la page
    let current_ads = get_all_ads_elements();
    current_ads.forEach(current_ad => {
        current_ad.remove();
    });

    //ajouter les photos
    add_pictures(results);

    // Réorganiser les annonces dans le DOM
    return_rates.forEach(return_rate => {

        // Appliquer des styles initiaux pour la transition
        return_rate.element.style.opacity = '0';  // Commencer avec une opacité de 0 (invisible)
        return_rate.element.style.transform = 'translateY(20px)';  // Position de départ (en dessous)
        
        // Appliquer la transition pour l'opacité et la transformation
        return_rate.element.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';

        // Réajouter l'élément trié dans le DOM
        container_filtered_good_one.appendChild(return_rate.element);

        // Forcer le navigateur à reconnaître l'ajout et lancer la transition
        setTimeout(() => {
            return_rate.element.style.opacity = '1';  // L'élément devient visible
            return_rate.element.style.transform = 'translateY(0)';  // L'élément revient à sa position normale
        }, 50);  // Délai pour déclencher la transition après l'ajout dans le DOM

        container_filtered_good_one.appendChild(return_rate.element);  // Réajouter chaque annonce triée dans le DOM

        //afficher la renta à coté de l'annonce
        let style = document.createElement('style');
        style.innerHTML = `
            .return_rate {
                position: absolute;
                left: 50%;
                top: 50%;
                font-size: x-large;
                color: green;
                font-family: fantasy;
            }
        `;
        document.head.appendChild(style);

        let virtual_return_display = document.getElementById(return_rate.rate.toString());
        if(!virtual_return_display){
            let return_display = document.createElement('div');
            return_display.className = "return_rate";
            return_display.id = return_rate.rate.toString();
            return_display.textContent = (return_rate.rate * 100).toFixed(2) + " %";
            return_rate.element.appendChild(return_display);
        }
    });
}


sort_ads();
