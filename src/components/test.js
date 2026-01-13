// app/map/page.jsx
'use client'
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import styles from './map.module.css';
import AdminFilter from '@/components/adminFilter';

// Importation dynamique sans SSR
const Map = dynamic(() => import('@/components/map'), {
    ssr: false,
    loading: () => <div className={styles.loading}>Chargement de la carte...</div>
});

const MapPage = () => {
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(null);
    const [activeFiliere, setActiveFiliere] = useState(null);

    return (
        <div className={styles.mapWrap}>  
            {/* 1. FILTRES FILIÈRES */}
            <div className={styles.filiereBar}>
                <button className={styles.filiereBtn} onClick={() => setActiveFiliere('agriculture')}>
                    🌾 Agriculture
                </button>
                <button className={styles.filiereBtn} onClick={() => setActiveFiliere('peche')}>
                    🐟 Pêche
                </button>
                <button className={styles.filiereBtn} onClick={() => setActiveFiliere('elevage')}>
                    🐄 Élevage
                </button>
            </div>

            {/* 2. BOUTON ADMIN */}
            <button className={styles.toggleAdminBtn} onClick={() => setIsAdminOpen(!isAdminOpen)}>
                {isAdminOpen ? '✖ Fermer' : '📍 Zones Admin'}
            </button>

            {/* 3. PANNEAU ADMIN */}
            {isAdminOpen && (
                <div className={styles.adminPanelContainer}>
                    <AdminFilter onFilterChange={(sel) => setCurrentSelection(sel)}/>
                </div>
            )}

            {/* LA CARTE (On lui passe les ordres par les props) */}
            <Map 
                currentSelection={currentSelection} 
                activeFiliere={activeFiliere} 
            />

            <div className={styles.legend}>
                <small>Production du Cameroun</small>
            </div>
        </div>
    );
};

export default MapPage;