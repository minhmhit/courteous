const MANAGER_KEYWORDS = [
  "manager",
  "lead",
  "head",
  "supervisor",
  "truong",
  "pho",
  "quan ly",
  "quanli",
];

const normalizeText = (value) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const extractPositionText = (profile) =>
  profile?.currentPosition?.name ||
  profile?.currentPositionName ||
  profile?.positionName ||
  profile?.position?.name ||
  profile?.jobTitle ||
  profile?.title ||
  "";

export const isManagementEmployee = (roleId, employeeProfile) => {
  if (![4, 5].includes(Number(roleId))) {
    return true;
  }

  const normalizedPosition = normalizeText(extractPositionText(employeeProfile));
  if (!normalizedPosition) {
    return false;
  }

  return MANAGER_KEYWORDS.some((keyword) =>
    normalizedPosition.includes(keyword),
  );
};

export const getEnterpriseLandingPath = (roleId, employeeProfile) => {
  const normalizedRole = Number(roleId);

  if (normalizedRole === 1) return "/admin/dashboard";
  if (normalizedRole === 3) return "/admin/warehouse-dashboard";

  if (normalizedRole === 4) {
    return isManagementEmployee(normalizedRole, employeeProfile)
      ? "/admin/sales-dashboard"
      : "/employee/dashboard";
  }

  if (normalizedRole === 5) {
    return isManagementEmployee(normalizedRole, employeeProfile)
      ? "/admin/hrm-dashboard"
      : "/employee/dashboard";
  }

  if (normalizedRole === 2) {
    return employeeProfile ? "/employee/dashboard" : "/";
  }

  return "/";
};

export const getEnterpriseWorkspacePath = (roleId, employeeProfile) => {
  const normalizedRole = Number(roleId);

  if (normalizedRole === 1) return "/admin/dashboard";
  if (normalizedRole === 3) return "/admin/warehouse-dashboard";

  if (normalizedRole === 4) {
    return isManagementEmployee(normalizedRole, employeeProfile)
      ? "/admin/sales-dashboard"
      : "/admin/orders";
  }

  if (normalizedRole === 5) {
    return isManagementEmployee(normalizedRole, employeeProfile)
      ? "/admin/hrm-dashboard"
      : "/admin/leave";
  }

  return getEnterpriseLandingPath(roleId, employeeProfile);
};
