'use client';
import styles from './page.module.css';
import dynamic from 'next/dynamic';
import Stats from '@/components/stats';
import MapPage from '@/components/test';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
});

export default function Home() {
  return (
    <main className={styles.main}>
      <MapPage />
      <Stats/>
    </main>
  )
}