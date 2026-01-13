'use client'

import React, { useRef, useEffect, useState } from 'react';
import styles from './navbar.module.css';


const Navbar = () => {

    
    return (
        <div className={styles.navbar}>  
            <h3>
                CMR BASSIN PROD
            </h3>

            <div className={styles.menu}>
                <a href="/" className={styles.menuItem}>Home</a>
                <a href="/stats" className={styles.menuItem}>Statistiques</a>
            </div>
        </div>
)
}

export default Navbar;