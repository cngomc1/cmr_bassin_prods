'use client'
import React, { useState, useEffect } from 'react';
import styles from './filter.module.css';
import { getFilterOptions } from '@/services/geoserver';


const AdminFilter = ({ onFilterChange }) => {
    const [regions, setRegions] = useState([]);
    const [depts, setDepts] = useState([]);
    const [communes, setCommunes] = useState([]);

    const [selectedRegion, setSelectedRegion] = useState("");
    const [selectedDept, setSelectedDept] = useState("");

    // 1. Au chargement, on récupère les régions
    useEffect(() => {
        getFilterOptions("region").then(setRegions);
    }, []);

    // 2. Quand la région change, on charge les départements
    useEffect(() => {
        if (selectedRegion) {
            getFilterOptions("departement", selectedRegion).then(setDepts);
            setCommunes([]); // On réinitialise les niveaux inférieurs
        }
    }, [selectedRegion]);

    // 3. Quand le département change, on charge les communes
    useEffect(() => {
        if (selectedDept) {
            getFilterOptions("commune", selectedDept).then(setCommunes);
        }
    }, [selectedDept]);

return (
    <div className={styles.adminPanel}>
        <select onChange={(e) => setSelectedRegion(e.target.value)}>
            <option>Région</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select disabled={!depts.length} onChange={(e) => setSelectedDept(e.target.value)}>
            <option>Département</option>
            {depts.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        <select disabled={!communes.length}>
            <option>Commune</option>
            {communes.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
    </div>
);
}
export default AdminFilter;