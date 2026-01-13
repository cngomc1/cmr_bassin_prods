'use client'

import React, { useRef, useEffect, useState } from 'react';
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import styles from './map.module.css';
import { MaptilerLayer } from "@maptiler/leaflet-maptilersdk";
import { GeocodingControl } from "@maptiler/geocoding-control/leaflet";
import "@maptiler/geocoding-control/style.css";

// Importation de ton service GeoServer
import { fetchProductionGeoJSON } from '@/services/geoserver';
import AdminFilter from './adminFilter';

const Map = () => {
    // Références pour manipuler la carte et les couches sans déclencher de re-renders inutiles
    const mapContainer = useRef(null);
    const map = useRef(null);
    const currentLayer = useRef(null); // Pour stocker la couche GeoJSON actuelle

    // États de l'interface
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(null);

    const center = { lat: 7.3697, lng: 12.3547 };
    const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;

    // --- 1. INITIALISATION DE LA CARTE (Une seule fois) ---
    useEffect(() => {
        if (map.current) return; 

        map.current = new L.Map(mapContainer.current, {
            center: L.latLng(center.lat, center.lng),
            zoom: 6,
            zoomControl: false // On le désactive pour le placer en bas à droite
        });

        // Fond de carte MapTiler
        new MaptilerLayer({ apiKey: key }).addTo(map.current);

        // Barre de recherche (Geocoding)
        const gc = new GeocodingControl({ apiKey: key, position: 'topright' });
        map.current.addControl(gc);

        // Boutons de zoom en bas à droite
        L.control.zoom({ position: 'bottomright' }).addTo(map.current);
    }, [key, center.lat, center.lng]);

    // --- 2. RÉACTION AUX FILTRES ADMINISTRATIFS ---
    useEffect(() => {
        if (!currentSelection || !map.current) return;

        const { type, value } = currentSelection;
        
        const updateAdminLayer = async () => {
            try {
                // Ici on appelle GeoServer pour la zone admin (Région ou Dept)
                // Note: Tu devras peut-être créer une fonction fetchAdminGeoJSON spécifique
                const data = await fetchProductionGeoJSON(type, value); 
                displayGeoData(data);
            } catch (error) {
                console.error("Erreur lors du chargement de la zone admin:", error);
            }
        };

        updateAdminLayer();
    }, [currentSelection]);

    // --- 3. FONCTIONS UTILITAIRES ---

    // Fonction centrale pour afficher les données GeoJSON et zoomer
    const displayGeoData = (geojson) => {
        if (!map.current) return;

        // On retire la couche précédente si elle existe
        if (currentLayer.current) {
            map.current.removeLayer(currentLayer.current);
        }

        // On crée la nouvelle couche
        currentLayer.current = L.geoJSON(geojson, {
            style: {
                color: "#2e7d32",
                weight: 2,
                fillOpacity: 0.4,
                fillColor: "#4caf50"
            },
            onEachFeature: (feature, layer) => {
                const name = feature.properties.nom || feature.properties.arrondissement || "Zone";
                layer.bindPopup(`<b>${name}</b>`);
            }
        }).addTo(map.current);

        // Focus automatique (FlyTo) sur la zone chargée
        const bounds = currentLayer.current.getBounds();
        if (bounds.isValid()) {
            map.current.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
        }
    };

    // Gestion du clic sur les filières (Agriculture, Pêche, Élevage)
    const handleFiliereFilter = async (filiere) => {
        try {
            const data = await fetchProductionGeoJSON(filiere);
            displayGeoData(data);
        } catch (error) {
            console.error("Erreur filière:", error);
        }
    };

    // Réception des filtres administratifs (enfant -> parent)
    const handleAdminSelection = (selection) => {
        setCurrentSelection(selection);
    };

    return (
        <div className={styles.mapWrap}>  
            
            {/* BARRE DES FILIÈRES (FLOTTANTE EN HAUT) */}
            <div className={styles.filiereBar}>
                <button className={styles.filiereBtn} onClick={() => handleFiliereFilter('agriculture')}>
                    🌾 Agriculture
                </button>
                <button className={styles.filiereBtn} onClick={() => handleFiliereFilter('peche')}>
                    🐟 Pêche
                </button>
                <button className={styles.filiereBtn} onClick={() => handleFiliereFilter('elevage')}>
                    🐄 Élevage
                </button>
            </div>

            {/* BOUTON D'OUVERTURE DES FILTRES ADMIN */}
            <button className={styles.toggleAdminBtn} onClick={() => setIsAdminOpen(!isAdminOpen)}>
                {isAdminOpen ? '✖ Fermer' : '📍 Zones Admin'}
            </button>

            {/* COMPOSANT FILTRES ADMINISTRATIFS (FLOTTANT À GAUCHE) */}
            {isAdminOpen && (
                <div className={styles.adminPanelContainer}>
                    <AdminFilter onFilterChange={handleAdminSelection}/>
                </div>
            )}

            {/* LE CONTENEUR DE LA CARTE LEAFLET */}
            <div ref={mapContainer} className={styles.map}/>

            {/* LÉGENDE (Optionnelle) */}
            <div className={styles.legend}>
                <small>Production du Cameroun (Tonnes)</small>
                {/* Ajouter des échelles de couleurs ici */}
            </div>
        </div>
    );
};

export default Map;