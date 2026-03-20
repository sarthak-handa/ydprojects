export const PROJECT_CATEGORIES = [
  "Category 1",
  "Category 2",
  "Category 3",
  "Category 4",
  "Category 5",
] as const;

export const PROJECT_PHASES = [
  "Engineering",
  "Ordering & Manufacturing",
  "Assembly",
  "Dispatch",
  "Project End",
] as const;

export const ORDER_STATUSES = [
  "Pending",
  "Ordered",
  "In Transit",
  "Arrived",
  "Dispatched",
] as const;

export const PAYMENT_STATUSES = ["Due", "Paid", "Partial"] as const;
export const RED_FLAG_PRIORITIES = ["Critical", "High", "Medium"] as const;
export const RED_FLAG_STATUSES = ["Open", "In Progress", "Resolved"] as const;

export type ProjectPhase = (typeof PROJECT_PHASES)[number];
export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];
export type RedFlagPriority = (typeof RED_FLAG_PRIORITIES)[number];
export type RedFlagStatus = (typeof RED_FLAG_STATUSES)[number];
