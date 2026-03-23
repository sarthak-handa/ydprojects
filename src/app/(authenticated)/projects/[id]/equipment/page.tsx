import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Box, CheckCircle, Clock } from 'lucide-react';
import styles from './equipment.module.css';
import EquipmentTree from './EquipmentTree';

export const dynamic = 'force-dynamic';

export default async function EquipmentListPage({ params }: { params: { id: string } }) {
  // We'll pass the ID to a client component to fetch and render the tree
  // because we are using Next.js 14 App Router and our SQLite DB is accessible via API.

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <Link href="/dashboard/project" className={styles.backBtn}>
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <h1 className={styles.title}>Project Equipment List</h1>
          <p className={styles.subtitle}>
            Hierarchical Bill of Materials (BOM) based on imported CCPM Planning.
          </p>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className="card">
          <EquipmentTree projectId={params.id} />
        </div>
      </div>
    </div>
  );
}
