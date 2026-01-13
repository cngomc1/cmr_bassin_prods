// Dans ce fichier, nous définissons une fonction pour interagir avec GeoServer et récupérer les données GeoJSON
const GEOSERVER_WFS_URL = process.env.NEXT_PUBLIC_GEOSERVER_WFS_URL ;
const GEOSERVER_WFS_LAYER = process.env.NEXT_PUBLIC_GEOSERVER_WFS_LAYER ;

export const fetchProductionGeoJSON = async (filiere, region = null, product = null) => {
    let cqlFilter = `filiere='${filiere}'`;
    if (region) cqlFilter += ` AND region='${region}'`;
    if (product) cqlFilter += ` AND product='${region}'`;
   
    const params = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: GEOSERVER_WFS_LAYER,
        outputFormat: 'application/json',
        CQL_FILTER: cqlFilter
    });

    const response = await fetch(`${GEOSERVER_WFS_URL}?${params.toString()}`);
    return await response.json();
};

// Fonction pour récupérer uniquement les noms (pour les filtres)
export const getFilterOptions = async (level, parentName = null) => {
    
    // On construit le filtre selon le niveau
    let cqlFilter = "";
    let propertyName = "";

    if (level === "region") {
        propertyName = "region"; // On veut la liste des régions
    } else if (level === "departement") {
        propertyName = "departement";
        cqlFilter = `region='${parentName}'`; // Uniquement ceux de la région X
    } else if (level === "commune") {
        propertyName = "arrondissement";
        cqlFilter = `departement='${parentName}'`;
    }

    const params = new URLSearchParams({
        service: 'WFS',
        version: '1.0.0',
        request: 'GetFeature',
        typeName: 'sig:admin_layers',
        outputFormat: 'application/json',
        propertyName: propertyName, // CRUCIAL : on ne demande que le nom, pas la carte !
        ...(cqlFilter && { CQL_FILTER: cqlFilter })
    });

    const response = await fetch(`${GEOSERVER_WFS_URL}?${params.toString()}`);
    const data = await response.json();
    
    // On nettoie les doublons (GeoServer renvoie une feature par polygone)
    const list = data.features.map(f => f.properties[propertyName]);
    return [...new Set(list)].sort(); 
};