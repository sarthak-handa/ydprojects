import styles from "@/components/project-management/projectManagement.module.css";
import { getOrders } from "@/lib/database";
import { formatCurrency, formatDate } from "@/lib/format";

const columns = ["Pending", "Ordered", "In Transit", "Arrived", "Dispatched"];

export default function OrdersPage() {
  const orders = getOrders() as Array<Record<string, unknown>>;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div>
          <div className={styles.heroTitle}>Order & Dispatch Tracking</div>
          <div className={styles.heroMeta}>
            <span>Live PO, vendor, expected arrival, and dispatch visibility.</span>
            <span>Inventory pressure warnings surface where dispatch is lagging.</span>
          </div>
        </div>
      </section>

      <section className={styles.kanban}>
        {columns.map((column) => (
          <div key={column} className={styles.kanbanCol}>
            <strong>{column}</strong>
            {orders
              .filter((order) => order.order_status === column)
              .map((order) => (
                <div key={String(order.id)} className={styles.kanbanCard}>
                  <strong>{String(order.component_name)}</strong>
                  <div className={styles.panelSubtext}>
                    {String(order.project_code)} · {String(order.vendor_name)}
                  </div>
                  <div className={styles.panelSubtext}>PO {String(order.po_number)}</div>
                  <div className={styles.panelSubtext}>
                    Expected {formatDate(String(order.expected_arrival ?? ""))}
                  </div>
                  <div className={styles.panelSubtext}>
                    Value {formatCurrency(Number(order.total_price))}
                  </div>
                  {column === "Ordered" || column === "In Transit" ? (
                    <div className={styles.pill}>Factory inventory watch</div>
                  ) : null}
                </div>
              ))}
          </div>
        ))}
      </section>
    </div>
  );
}
