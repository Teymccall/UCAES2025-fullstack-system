export type Currency = "GHS" | "USD" | "EUR";

export type RevenueType =
  | "tuition"
  | "research_grant"
  | "donation"
  | "hostel"
  | "auxiliary"
  | "other";

export type ExpenseType =
  | "salary"
  | "research_funding"
  | "infrastructure"
  | "utilities"
  | "procurement"
  | "vendor_payment"
  | "other";

export interface FinanceTransaction {
  id?: string;
  kind: "revenue" | "expense";
  type: RevenueType | ExpenseType | string;
  amount: number;
  currency: Currency;
  date: string | Date;
  reference?: string;
  description?: string;
  departmentId?: string;
  programmeId?: string;
  studentId?: string; // for tuition
  vendorId?: string; // for expenses/procurement
  createdBy: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  status?: "posted" | "pending_approval" | "rejected";
}

export interface Budget {
  id?: string;
  departmentId: string;
  year: string; // e.g. 2025/2026
  semester?: string; // First Semester, Second Semester
  amount: number;
  currency: Currency;
  usedAmount: number;
  createdBy: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface PayrollItem {
  id?: string;
  staffId: string;
  staffName: string;
  baseSalary: number;
  allowances?: number;
  deductions?: number; // tax, pension, insurance
  netPay: number;
  month: string; // e.g., 2025-08
  currency: Currency;
  status: "pending_approval" | "approved" | "paid";
  createdBy: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface FinanceDashboardSummary {
  totals: {
    revenue: number;
    expenses: number;
    netCashFlow: number;
  };
  revenueBreakdown: Partial<Record<RevenueType, number>>;
  expenseBreakdown: Partial<Record<ExpenseType, number>>;
  pendingApprovals: {
    transactions: number;
    payroll: number;
  };
  alerts: string[];
  currency: Currency;
}






