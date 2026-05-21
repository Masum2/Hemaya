// WidgetType Enum 
export const WIDGET_TYPE_MAP: Record<number, { name: string; color: string; bg: string; border: string }> = {
    0: { name: "Essential", color: "#0ea5e9", bg: "rgba(14, 165, 233, 0.08)", border: "rgba(14, 165, 233, 0.2)" },
    1: { name: "Alerts", color: "#ef4444", bg: "rgba(239, 68, 68, 0.08)", border: "rgba(239, 68, 68, 0.2)" },
    2: { name: "Notifications", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.08)", border: "rgba(245, 158, 11, 0.2)" }
};

// WidgetComponents Enum 
export const WIDGET_COMPONENTS_MAP: Record<number, { name: string; group: string }> = {
    1: { name: "Referral Intake Statistics Widget", group: "Supervisor And Director" },
    3: { name: "Pending Referral Intakes Widget", group: "Investigator" },
    6: { name: "Open Referrals Widget", group: "Supervisor" },
    10: { name: "My Case Work Widget", group: "Worker" },
    12: { name: "My Case Events Widget", group: "Social Worker" },
    17: { name: "MMIP Supervisor Statistics Widget", group: "MMIP Supervisor" },
    18: { name: "MMIP Supervisor Widget", group: "MMIP Supervisor" },
    19: { name: "My MMIP Cases Missing Initial Prep Widget", group: "MMIP Worker" },
    20: { name: "My Cases Widget", group: "Social Worker" },
    22: { name: "My MMIP Case Widget", group: "MMIP Supervisor" },
    23: { name: "Placements Statistics Widget", group: "Supervisor" },
    25: { name: "Referrals Intakes Awaiting Submission Widget", group: "Supervisor and Social Worker" },
    26: { name: "Tribal Court Cases", group: "Supervisor" },
    32: { name: "Notify Case Safety Note Widget", group: "Notify" },
    35: { name: "Referral Dispositions Awaiting Supervisor Approval", group: "Supervisor" },
    38: { name: "My Resource Family Application Awaiting Submission Widget", group: "Resource Family Application" },
    39: { name: "Resource Family Application Awaiting Decision Widget", group: "Resource Family Application" },
    40: { name: "Resource Family Application Expiring Soon Widget", group: "Resource Family Application" },
    16: { name: "Foster Family Missing Parent Widget", group: "Foster Care Social Worker and Supervisor" },
    41: { name: "My Tasks Alerts Widget", group: "Tasks Alert" },
    51: { name: "Cases Awaiting Staffing Session Widget", group: "Staffing" },
    52: { name: "Cases with Recent Discharge Episode", group: "Notify SV" },
    54: { name: "Resource Family application Status", group: "Resource Family application" },
    56: { name: "Tribal Court Cases Without Case Notes", group: "ICWA Supervisor" },
    57: { name: "Placement changes in the Last 30 days", group: "Supervisor" },
    58: { name: "Open RPSA Applications", group: "Supervisor" },
    59: { name: "New Clients Added in the Last 30 days", group: "Social Worker" },
    60: { name: "Loan Tracker", group: "Social Worker" },
    61: { name: "Client Program Failures", group: "Supervisor" },
    63: { name: "RMH Referrals Approval Awaiting", group: "RMH Referrals" },
    64: { name: "My Open RPSA Applications", group: "Social Worker" },
    62: { name: "Intakes Awaiting Approval", group: "Supervisor" },
    150: { name: "Alert Notifications", group: "Alert Notification" },
    151: { name: "Upcoming Appointments", group: "Notify" },
    65: { name: "Jurisdiction Determination Reports Awaiting Decisions", group: "Supervisor" }
};

export const getComponentMeta = (componentId: number) => {
    return WIDGET_COMPONENTS_MAP[componentId] || { name: `Unknown Widget (#${componentId})`, group: "General" };
};