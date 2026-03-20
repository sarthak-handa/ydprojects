"use client";

import { startTransition, useEffect, useEffectEvent, useState } from "react";
import styles from "./projectManagement.module.css";
import { formatCurrency } from "@/lib/format";

interface PaymentsBoardProps {
  projectId: number;
}

export default function PaymentsBoard({ projectId }: PaymentsBoardProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);
  const [summary, setSummary] = useState<Record<string, unknown>>({});
  const [form, setForm] = useState({
    vendorName: "",
    poNumber: "",
    invoiceNumber: "",
    amount: "",
    paidAmount: "",
    status: "Due",
    dueDate: "",
    approvalState: "Pending PM",
  });

  async function refresh() {
    const response = await fetch(`/api/payments?projectId=${projectId}`, {
      cache: "no-store",
    });
    const payload = await response.json();
    startTransition(() => {
      setRows(payload.rows);
      setSummary(payload.summary);
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, [projectId]);

  async function createPayment() {
    await fetch("/api/payments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId,
        ...form,
        amount: Number(form.amount),
        paidAmount: Number(form.paidAmount || 0),
      }),
    });
    setForm({
      vendorName: "",
      poNumber: "",
      invoiceNumber: "",
      amount: "",
      paidAmount: "",
      status: "Due",
      dueDate: "",
      approvalState: "Pending PM",
    });
    await refresh();
  }

  return (
    <div className={styles.stack}>
      <div className={styles.grid}>
        <div className={styles.summaryCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Total Payable</div>
            <div className={styles.metricValue}>
              {formatCurrency(Number(summary.total_payable ?? 0))}
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Total Paid</div>
            <div className={styles.metricValue}>
              {formatCurrency(Number(summary.total_paid ?? 0))}
            </div>
          </div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.metricCard}>
            <div className={styles.metricLabel}>Outstanding</div>
            <div className={styles.metricValue}>
              {formatCurrency(Number(summary.outstanding ?? 0))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Add Payment Record</div>
        </div>
        <div className={styles.formGrid}>
          <input className={styles.field} placeholder="Vendor" value={form.vendorName} onChange={(event) => setForm((current) => ({ ...current, vendorName: event.target.value }))} />
          <input className={styles.field} placeholder="PO #" value={form.poNumber} onChange={(event) => setForm((current) => ({ ...current, poNumber: event.target.value }))} />
          <input className={styles.field} placeholder="Invoice #" value={form.invoiceNumber} onChange={(event) => setForm((current) => ({ ...current, invoiceNumber: event.target.value }))} />
          <input className={styles.field} placeholder="Amount" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} />
          <input className={styles.field} placeholder="Paid Amount" value={form.paidAmount} onChange={(event) => setForm((current) => ({ ...current, paidAmount: event.target.value }))} />
          <select className={styles.select} value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}>
            {["Due", "Partial", "Paid"].map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input className={styles.field} type="date" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
          <input className={styles.field} placeholder="Approval workflow" value={form.approvalState} onChange={(event) => setForm((current) => ({ ...current, approvalState: event.target.value }))} />
          <button className="btn btn-primary" type="button" onClick={() => void createPayment()}>
            Save Payment
          </button>
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Payment Ledger</div>
            <div className={styles.panelSubtext}>
              Vendor-wise payment status and approval workflow indicator.
            </div>
          </div>
          <a className="btn btn-outline" href={`/api/export/${projectId}`}>
            Export Payment Summary
          </a>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Vendor</th>
                <th>PO</th>
                <th>Invoice</th>
                <th>Amount</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Due Date</th>
                <th>Approval</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={String(row.id)}>
                  <td>{String(row.vendor_name)}</td>
                  <td>{String(row.po_number)}</td>
                  <td>{String(row.invoice_number)}</td>
                  <td>{formatCurrency(Number(row.amount))}</td>
                  <td>{formatCurrency(Number(row.paid_amount))}</td>
                  <td>{String(row.status)}</td>
                  <td>{String(row.due_date)}</td>
                  <td>{String(row.approval_state)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
