"use client";

import {
  startTransition,
  useEffect,
  useEffectEvent,
  useMemo,
  useState,
} from "react";
import styles from "./projectManagement.module.css";
import { formatCurrency } from "@/lib/format";

interface EquipmentHierarchyProps {
  projectId: number;
}

export default function EquipmentHierarchy({
  projectId,
}: EquipmentHierarchyProps) {
  const [assemblies, setAssemblies] = useState<Array<Record<string, unknown>>>([]);
  const [reference, setReference] = useState<Record<string, string[]>>({
    categories: [],
    orderStatuses: [],
  });
  const [filters, setFilters] = useState({
    category: "",
    assembly: "",
    vendor: "",
  });
  const [form, setForm] = useState({
    assemblyId: "",
    subassemblyId: "",
    name: "",
    drawingNumber: "",
    quantity: "1",
    material: "",
    weight: "0",
    vendorName: "",
    poNumber: "",
    unitPrice: "0",
    orderStatus: "Pending",
  });

  async function refresh() {
    const [assembliesResponse, projectsResponse] = await Promise.all([
      fetch(`/api/projects/${projectId}/assemblies`, { cache: "no-store" }),
      fetch("/api/projects", { cache: "no-store" }),
    ]);
    const assembliesPayload = await assembliesResponse.json();
    const projectsPayload = await projectsResponse.json();
    startTransition(() => {
      setAssemblies(assembliesPayload.assemblies);
      setReference(projectsPayload.reference);
    });
  }

  const load = useEffectEvent(() => {
    void refresh();
  });

  useEffect(() => {
    void load();
  }, [projectId]);

  const filteredAssemblies = useMemo(() => {
    return assemblies.filter((assembly) => {
      const categoryMatch =
        !filters.category || assembly.category_name === filters.category;
      const assemblyMatch =
        !filters.assembly || String(assembly.id) === filters.assembly;
      const vendorMatch =
        !filters.vendor ||
        (assembly.subassemblies as Array<Record<string, unknown>>).some(
          (subassembly) =>
            (subassembly.components as Array<Record<string, unknown>>).some(
              (component) =>
                String(component.vendor_name)
                  .toLowerCase()
                  .includes(filters.vendor.toLowerCase()),
            ),
        );
      return categoryMatch && assemblyMatch && vendorMatch;
    });
  }, [assemblies, filters]);

  const subassemblyOptions = useMemo(() => {
    const assembly = assemblies.find(
      (item) => String(item.id) === form.assemblyId,
    );
    return (assembly?.subassemblies as Array<Record<string, unknown>> | undefined) ?? [];
  }, [assemblies, form.assemblyId]);

  async function createComponent() {
    await fetch(`/api/projects/${projectId}/assemblies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "component",
        assemblyId: Number(form.assemblyId),
        subassemblyId: Number(form.subassemblyId),
        name: form.name,
        drawingNumber: form.drawingNumber,
        quantity: Number(form.quantity),
        material: form.material,
        weight: Number(form.weight),
        vendorName: form.vendorName,
        poNumber: form.poNumber,
        unitPrice: Number(form.unitPrice),
        orderStatus: form.orderStatus,
      }),
    });

    setForm({
      assemblyId: form.assemblyId,
      subassemblyId: form.subassemblyId,
      name: "",
      drawingNumber: "",
      quantity: "1",
      material: "",
      weight: "0",
      vendorName: "",
      poNumber: "",
      unitPrice: "0",
      orderStatus: "Pending",
    });
    await refresh();
  }

  const totalCost = filteredAssemblies.reduce(
    (sum, assembly) => sum + Number(assembly.total_cost ?? 0),
    0,
  );

  return (
    <div className={styles.stack}>
      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <div className={styles.panelTitle}>Equipment Hierarchy</div>
            <div className={styles.panelSubtext}>
              Assemblies, subassemblies, and BOM components with cost rollup.
            </div>
          </div>
          <div className={styles.metricValue}>{formatCurrency(totalCost)}</div>
        </div>
        <div className={styles.formGrid}>
          <select
            className={styles.select}
            value={filters.category}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                category: event.target.value,
              }))
            }
          >
            <option value="">All categories</option>
            {reference.categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={filters.assembly}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                assembly: event.target.value,
              }))
            }
          >
            <option value="">All assemblies</option>
            {assemblies.map((assembly) => (
              <option key={String(assembly.id)} value={String(assembly.id)}>
                {String(assembly.name)}
              </option>
            ))}
          </select>
          <input
            className={styles.field}
            placeholder="Filter by vendor"
            value={filters.vendor}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                vendor: event.target.value,
              }))
            }
          />
        </div>
      </div>

      <div className={styles.panel}>
        <div className={styles.panelHeader}>
          <div className={styles.panelTitle}>Add Component</div>
        </div>
        <div className={styles.formGrid}>
          <select
            className={styles.select}
            value={form.assemblyId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                assemblyId: event.target.value,
                subassemblyId: "",
              }))
            }
          >
            <option value="">Assembly</option>
            {assemblies.map((assembly) => (
              <option key={String(assembly.id)} value={String(assembly.id)}>
                {String(assembly.name)}
              </option>
            ))}
          </select>
          <select
            className={styles.select}
            value={form.subassemblyId}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                subassemblyId: event.target.value,
              }))
            }
          >
            <option value="">Subassembly</option>
            {subassemblyOptions.map((subassembly) => (
              <option key={String(subassembly.id)} value={String(subassembly.id)}>
                {String(subassembly.name)}
              </option>
            ))}
          </select>
          <input className={styles.field} placeholder="Component" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          <input className={styles.field} placeholder="Drawing #" value={form.drawingNumber} onChange={(event) => setForm((current) => ({ ...current, drawingNumber: event.target.value }))} />
          <input className={styles.field} placeholder="Qty" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} />
          <input className={styles.field} placeholder="Material" value={form.material} onChange={(event) => setForm((current) => ({ ...current, material: event.target.value }))} />
          <input className={styles.field} placeholder="Weight" value={form.weight} onChange={(event) => setForm((current) => ({ ...current, weight: event.target.value }))} />
          <input className={styles.field} placeholder="Vendor" value={form.vendorName} onChange={(event) => setForm((current) => ({ ...current, vendorName: event.target.value }))} />
          <input className={styles.field} placeholder="PO #" value={form.poNumber} onChange={(event) => setForm((current) => ({ ...current, poNumber: event.target.value }))} />
          <input className={styles.field} placeholder="Unit Price" value={form.unitPrice} onChange={(event) => setForm((current) => ({ ...current, unitPrice: event.target.value }))} />
          <select className={styles.select} value={form.orderStatus} onChange={(event) => setForm((current) => ({ ...current, orderStatus: event.target.value }))}>
            {reference.orderStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="button" onClick={() => void createComponent()}>
            Save Component
          </button>
        </div>
      </div>

      <div className={styles.tree}>
        {filteredAssemblies.map((assembly) => (
          <div key={String(assembly.id)} className={styles.treeNode}>
            <div className={styles.treeHeader}>
              <div>
                <strong>{String(assembly.name)}</strong>
                <div className={styles.panelSubtext}>
                  {String(assembly.category_name)} · {String(assembly.drawing_number)} ·{" "}
                  {Number(assembly.component_count ?? 0)} components
                </div>
              </div>
              <div>
                <div>{formatCurrency(Number(assembly.total_cost ?? 0))}</div>
                <div className={styles.panelSubtext}>
                  {assembly.full_kit_ready ? "Full Kit Ready" : "Kit Pending"}
                </div>
              </div>
            </div>
            <div className={styles.treeBody}>
              <div className={styles.subGrid}>
                {(assembly.subassemblies as Array<Record<string, unknown>>).map(
                  (subassembly) => (
                    <div key={String(subassembly.id)} className={styles.subCard}>
                      <strong>{String(subassembly.name)}</strong>
                      <div className={styles.tableWrap}>
                        <table className={styles.table}>
                          <thead>
                            <tr>
                              <th>Drawing</th>
                              <th>Component</th>
                              <th>Qty</th>
                              <th>Material</th>
                              <th>Weight</th>
                              <th>Vendor</th>
                              <th>PO</th>
                              <th>Unit</th>
                              <th>Total</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(
                              subassembly.components as Array<Record<string, unknown>>
                            ).map((component) => (
                              <tr key={String(component.id)}>
                                <td>{String(component.drawing_number)}</td>
                                <td>{String(component.name)}</td>
                                <td>{Number(component.quantity ?? 0)}</td>
                                <td>{String(component.material)}</td>
                                <td>{Number(component.weight ?? 0)}</td>
                                <td>{String(component.vendor_name)}</td>
                                <td>{String(component.po_number)}</td>
                                <td>{formatCurrency(Number(component.unit_price))}</td>
                                <td>{formatCurrency(Number(component.total_price))}</td>
                                <td>{String(component.order_status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
