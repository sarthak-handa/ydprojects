"use client";

import React, { useEffect, useState } from "react";
import { Package, Truck, Clock, TruckIcon } from "lucide-react";
import styles from "./orders.module.css";

type OrderRow = {
  id: string;
  project_code: string;
  assembly_name: string;
  component_name: string;
  po_number: string;
  vendor_name: string;
  order_status: string;
  quantity: number;
  total_price: number;
  expected_arrival: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setOrders(data.orders ?? []);
      } catch {
        console.error("Failed to load orders");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending": return "var(--status-dark-red)";
      case "Ordered": return "var(--status-yellow)";
      case "In Transit": return "var(--status-blue)";
      case "Arrived": return "var(--status-green)";
      case "Dispatched": return "var(--status-deep-green)";
      default: return "var(--text-muted)";
    }
  };

  const pending = orders.filter((o) => o.order_status === "Pending");
  const ordered = orders.filter((o) => o.order_status === "Ordered" || o.order_status === "In Transit");
  const arrived = orders.filter((o) => o.order_status === "Arrived");
  const dispatched = orders.filter((o) => o.order_status === "Dispatched");

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Order & Dispatch Tracking</h1>
        <p className={styles.subtitle}>Manage material flow from procurement to factory arrival and site dispatch.</p>
      </div>

      <div className={styles.kanbanBoard}>
        {/* Pending Column */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <Clock size={16} /> Pending ({pending.length})
          </div>
          <div className={styles.columnBody}>
            {pending.map((o) => (
              <OrderCard key={o.id} order={o} color={getStatusColor("Pending")} />
            ))}
            {pending.length === 0 && <div className={styles.emptyCol}>No pending items</div>}
          </div>
        </div>

        {/* Ordered / Transit Column */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <Truck size={16} /> Ordered / Transit ({ordered.length})
          </div>
          <div className={styles.columnBody}>
            {ordered.map((o) => (
              <OrderCard key={o.id} order={o} color={getStatusColor("Ordered")} />
            ))}
            {ordered.length === 0 && <div className={styles.emptyCol}>No active orders</div>}
          </div>
        </div>

        {/* Arrived (Factory) Column */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <Package size={16} /> Arrived at Factory ({arrived.length})
          </div>
          <div className={styles.columnBody}>
            {arrived.map((o) => (
              <OrderCard key={o.id} order={o} color={getStatusColor("Arrived")} />
            ))}
            {arrived.length === 0 && <div className={styles.emptyCol}>No items at factory</div>}
          </div>
        </div>

        {/* Dispatched Column */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>
            <TruckIcon size={16} /> Dispatched to Site ({dispatched.length})
          </div>
          <div className={styles.columnBody}>
            {dispatched.map((o) => (
              <OrderCard key={o.id} order={o} color={getStatusColor("Dispatched")} />
            ))}
            {dispatched.length === 0 && <div className={styles.emptyCol}>No dispatched items</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderCard({ order, color }: { order: OrderRow; color: string }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className={styles.projectCode}>{order.project_code}</span>
        <span className={styles.statusDot} style={{ backgroundColor: color }} />
      </div>
      <div className={styles.cardBody}>
        <div className={styles.componentName}>{order.component_name}</div>
        <div className={styles.assemblyName}>{order.assembly_name}</div>
        <div className={styles.poRow}>
          <span>PO: {order.po_number || "TBD"}</span>
          <span>{order.vendor_name || "Unassigned"}</span>
        </div>
        <div className={styles.expectedRow}>
          Exp: {order.expected_arrival || "N/A"}
        </div>
      </div>
    </div>
  );
}
