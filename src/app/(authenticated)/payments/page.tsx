"use client";

import React, { useEffect, useState } from "react";
import { DollarSign, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import styles from "./payments.module.css";
import { formatCurrency, formatDate } from "@/lib/format";

type PaymentRow = {
  id: string;
  project_code: string;
  vendor_name: string;
  po_number: string;
  invoice_number: string;
  amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  approval_state: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [summary, setSummary] = useState({ total_payable: 0, total_paid: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPayments() {
      try {
        const res = await fetch("/api/payments");
        const data = await res.json();
        setPayments(data.rows);
        setSummary(data.summary);
      } catch (err) {
        console.error("Failed to load payments");
      } finally {
        setLoading(false);
      }
    }
    fetchPayments();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <span className={`${styles.badge} ${styles.badgeGreen}`}><CheckCircle2 size={12}/> Paid</span>;
      case "Partial":
        return <span className={`${styles.badge} ${styles.badgeYellow}`}><Clock size={12}/> Partial</span>;
      default:
        return <span className={`${styles.badge} ${styles.badgeRed}`}><AlertCircle size={12}/> Due</span>;
    }
  };

  if (loading) return <div className="loading-spinner" />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Payment Records</h1>
        <p className={styles.subtitle}>Track vendor payments, invoices, and outstanding balances across all projects.</p>
      </div>

      <div className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <div className={styles.summaryLabel}>Total Payable (All Projects)</div>
          <div className={styles.summaryValue}>{formatCurrency(summary.total_payable)}</div>
        </div>
        <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Paid out</div>
            <div className={`${styles.summaryValue} ${styles.textGreen}`}>{formatCurrency(summary.total_paid)}</div>
        </div>
        <div className={styles.summaryCard}>
            <div className={styles.summaryLabel}>Total Outstanding</div>
            <div className={`${styles.summaryValue} ${styles.textRed}`}>{formatCurrency(summary.outstanding)}</div>
        </div>
      </div>

      <div className="card">
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Project</th>
              <th>Vendor</th>
              <th>PO Number</th>
              <th>Invoice Number</th>
              <th>Due Date</th>
              <th>Total Amount</th>
              <th>Paid Amount</th>
              <th>Outstanding</th>
              <th>Status</th>
              <th>Approval</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(p => {
              const outstanding = p.amount - p.paid_amount;
              return (
                <tr key={p.id}>
                  <td><span className={styles.projectCode}>{p.project_code}</span></td>
                  <td className={styles.fontWeight600}>{p.vendor_name}</td>
                  <td>{p.po_number || "-"}</td>
                  <td>{p.invoice_number || "-"}</td>
                  <td>{formatDate(p.due_date)}</td>
                  <td>{formatCurrency(p.amount)}</td>
                  <td className={styles.textGreen}>{formatCurrency(p.paid_amount)}</td>
                  <td className={styles.textRed}>{formatCurrency(outstanding)}</td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td>
                    <span className={styles.approvalState}>{p.approval_state}</span>
                  </td>
                </tr>
              )
            })}
            {payments.length === 0 && (
              <tr>
                <td colSpan={10} className={styles.emptyState}>No payment records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
