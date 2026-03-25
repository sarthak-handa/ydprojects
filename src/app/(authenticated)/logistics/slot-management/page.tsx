"use client";

import React, { useState } from "react";
import { Truck, CalendarDays, Clock, MapPin } from "lucide-react";
import styles from "./logistics.module.css";
import { formatDate } from "@/lib/format";

export default function SlotManagementPage() {
  const [activeTab, setActiveTab] = useState("calendar");
  
  // Simulated schedule fetched from API representing inbound yard logic
  const schedule = [
    { id: 1, po: "PO-UC-007", vendor: "Mahalaxmi Steel", vehicle: "Flatbed 40ft", eta: "2026-03-24", time: "09:00 AM", dock: "Dock A (Heavy Raw)", status: "Confirmed" },
    { id: 2, po: "PO-LV-003", vendor: "Flotek Systems", vehicle: "Box Truck", eta: "2026-03-24", time: "11:30 AM", dock: "Dock C (Parts)", status: "In Transit" },
    { id: 3, po: "PO-RC-009", vendor: "SKF India", vehicle: "Courier LCV", eta: "2026-03-25", time: "10:00 AM", dock: "Dock C (Parts)", status: "Pending Slot" },
    { id: 4, po: "PO-B-001",  vendor: "Prime Fab", vehicle: "Flatbed 20ft", eta: "2026-03-25", time: "14:00 PM", dock: "Dock B (Fab)", status: "Confirmed" },
  ];

  const getStatusClass = (status: string) => {
      if (status === "Confirmed") return styles.bgGreen;
      if (status === "In Transit") return styles.bgBlue;
      return styles.bgYellow;
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
            <h1 className={styles.title}>Inbound Yard & Slot Management</h1>
            <p className={styles.subtitle}>Coordinate incoming deliveries from vendors with warehouse dock availability.</p>
        </div>
        <button className="btn btn-primary" onClick={() => alert("Simulate: Book New Delivery Slot")}>
            <CalendarDays size={16}/> Book Delivery
        </button>
      </div>

      <div className={styles.statsGrid}>
          <div className={styles.statBox}>
              <div className={styles.statLabel}>Expected Today</div>
              <div className={styles.statValue}>2 Trucks</div>
          </div>
          <div className={styles.statBox}>
              <div className={styles.statLabel}>Available Docks</div>
              <div className={styles.statValue}>Dock A, Dock B</div>
          </div>
          <div className={styles.statBox}>
              <div className={styles.statLabel}>Unslotted POs</div>
              <div className={`${styles.statValue} ${styles.textRed}`}>1 PO</div>
          </div>
      </div>

      <div className="card">
         <div className={styles.viewTabs}>
             <button className={`${styles.viewBtn} ${activeTab === 'calendar' ? styles.activeView : ''}`} onClick={() => setActiveTab('calendar')}>Daily Schedule View</button>
             <button className={`${styles.viewBtn} ${activeTab === 'list' ? styles.activeView : ''}`} onClick={() => setActiveTab('list')}>Logistics Ledger</button>
         </div>

         {activeTab === 'calendar' ? (
             <div className={styles.timelineView}>
                 <div className={styles.timelineLabels}>
                     <div className={styles.timeLabel}>09:00</div>
                     <div className={styles.timeLabel}>10:00</div>
                     <div className={styles.timeLabel}>11:00</div>
                     <div className={styles.timeLabel}>12:00</div>
                     <div className={styles.timeLabel}>13:00</div>
                     <div className={styles.timeLabel}>14:00</div>
                 </div>
                 <div className={styles.timelineDocks}>
                     {["Dock A (Heavy Raw)", "Dock B (Fab)", "Dock C (Parts)"].map(dock => (
                         <div key={dock} className={styles.dockRow}>
                             <div className={styles.dockTitle}>{dock}</div>
                             <div className={styles.dockTrack}>
                                 {schedule.filter(s => s.dock === dock && s.eta === "2026-03-24").map(s => (
                                     <div key={s.id} className={`${styles.slotBlock} ${getStatusClass(s.status)}`} style={{ left: s.time === "09:00 AM" ? '0%' : '50%', width: '25%' }}>
                                         <div className={styles.slotPO}>{s.po}</div>
                                         <div className={styles.slotVendor}>{s.vendor}</div>
                                     </div>
                                 ))}
                             </div>
                         </div>
                     ))}
                 </div>
             </div>
         ) : (
             <table className={styles.table}>
                 <thead>
                     <tr>
                         <th>Vendor & PO</th>
                         <th>ETA & Slot Time</th>
                         <th>Vehicle & Dock</th>
                         <th>Status</th>
                     </tr>
                 </thead>
                 <tbody>
                     {schedule.map(s => (
                         <tr key={s.id}>
                             <td>
                                 <div className={styles.poNo}>{s.po}</div>
                                 <div className={styles.vendorNo}>{s.vendor}</div>
                             </td>
                             <td>
                                 <div className={styles.dateSlot}>{formatDate(s.eta)}</div>
                                 <div className={styles.timeSlot}><Clock size={12}/> {s.time}</div>
                             </td>
                             <td>
                                 <div className={styles.vehicleType}><Truck size={12}/> {s.vehicle}</div>
                                 <div className={styles.dockName}><MapPin size={12}/> {s.dock}</div>
                             </td>
                             <td>
                                 <span className={styles.statusChip}>{s.status}</span>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
         )}
      </div>
    </div>
  );
}
