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

const Map = ({ currentSelection, activeFiliere }) => {
    // Références pour manipuler la carte et les couches sans déclencher de re-renders inutiles
    const mapContainer = useRef(null);
    const map = useRef(null);
    const currentLayer = useRef(null); // Pour stocker la couche GeoJSON actuelle

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

 
    // Réagir aux changements de Filière (Agriculture, etc.)
    useEffect(() => {
        if (activeFiliere) {
            try {
                fetchProductionGeoJSON(activeFiliere).then(displayGeoData);
            } catch (error) {
                console.error("Erreur lors du chargement des données GeoJSON :", error);
            }
        }
    }, [activeFiliere]);

    // Réagir aux changements de Sélection Admin (Région, Dept)
    useEffect(() => {
        if (currentSelection) {
            fetchProductionGeoJSON(currentSelection.type, currentSelection.value).then(displayGeoData);
        }
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

 

  

    return (
        <div className={styles.mapWrap}>  
            <div ref={mapContainer} className={styles.map}/>
        </div>
    );
};

export default Map;