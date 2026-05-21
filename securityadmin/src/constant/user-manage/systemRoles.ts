
//  Enum Data Object Structure for grouping roles by category
export const SYSTEM_ROLES = [
    { id: 1, name: 'SuperAdmin', category: 'CW', label: 'Super Admin' },
    { id: 2, name: 'Admin', category: 'CW', label: 'Admin' },
    { id: 3, name: 'Director', category: 'CW', label: 'Director' },
    { id: 4, name: 'Supervisor', category: 'CW', label: 'Supervisor (FSP)' },
    { id: 6, name: 'CaseInvestigator', category: 'CW', label: 'Case Investigator (FSP)' },
    { id: 8, name: 'ICWTSocialWorker', category: 'CW', label: 'ICWT Social Worker' },
    { id: 9, name: 'ICWTSupervisor', category: 'CW', label: 'ICWT Supervisor' },
    { id: 91, name: 'Manager', category: 'CW', label: 'Manager' },

    { id: 10, name: 'FPSupervisor', category: 'FP', label: 'FP Supervisor' },
    { id: 11, name: 'FPSocialWorker', category: 'FP', label: 'FP Social Worker' },

    { id: 21, name: 'FCSocialWorker', category: 'FC', label: 'FC Social Worker' },
    { id: 22, name: 'FCSupervisor', category: 'FC', label: 'FC Supervisor' },
    { id: 23, name: 'FCProgramManager', category: 'FC', label: 'FC Program Manager' },

    { id: 31, name: 'RMHSocialWorker', category: 'RMH', label: 'RMH Social Worker' },
    { id: 32, name: 'RMHSupervisor', category: 'RMH', label: 'RMH Supervisor' }
];

// Category mapping for user-friendly display names
 export const CATEGORY_NAMES: { [key: string]: string } = {
    CW: "Child Welfare (CW)",
    FP: "Family Preservation (FP)",
    FC: "Foster Care (FC)",
    RMH: "Rehab Mental Health (RMH)"
};
