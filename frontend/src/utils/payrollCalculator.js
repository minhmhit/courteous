export const PAYROLL_CONSTANTS = {
  STANDARD_WORK_MINUTES_PER_DAY: 540,
  STANDARD_WORK_DAYS_PER_MONTH: 26,
  OVERTIME_RATE_PER_HOUR: 100000,
  INSURANCE_RATE: 0.105,
  TAX_RATE: 0,
  LATE_PENALTY_PER_DAY: 100000,
  MAX_PAID_LEAVE_DAYS: 3,
};

const LATE_STATUSES = new Set(["LATE", "DELAY"]);
const LEAVE_STATUSES = new Set(["ABSENT", "UNPAID_LEAVE"]);

const toNumber = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getWorkMinutesFromAttendance = (item) => {
  const rawMinutes = toNumber(
    item.workMinutes ?? item.work_minutes ?? item.workMinute,
  );
  if (rawMinutes > 0) return rawMinutes;

  const checkIn = item.checkIn || item.check_in;
  const checkOut = item.checkOut || item.check_out;
  if (!checkIn || !checkOut) return 0;

  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime()))
    return 0;
  return Math.max(
    0,
    Math.round((outDate.getTime() - inDate.getTime()) / 60000),
  );
};

export const calculatePayrollByAttendance = ({
  baseSalary = 0,
  allowance = 0,
  bonus = 0,
  attendances = [],
}) => {
  const safeBaseSalary = toNumber(baseSalary);
  const safeAllowance = toNumber(allowance);
  const safeBonus = toNumber(bonus);
  const salaryPerDay =
    safeBaseSalary / PAYROLL_CONSTANTS.STANDARD_WORK_DAYS_PER_MONTH;

  let workDays = 0;
  let overtimeMinutes = 0;
  let lateDays = 0;
  let leaveDays = 0;

  attendances.forEach((item) => {
    const status = String(item.status || "").toUpperCase();
    const minutes = getWorkMinutesFromAttendance(item);
    const regularMinutes = Math.min(
      minutes,
      PAYROLL_CONSTANTS.STANDARD_WORK_MINUTES_PER_DAY,
    );

    workDays +=
      regularMinutes / PAYROLL_CONSTANTS.STANDARD_WORK_MINUTES_PER_DAY;

    const overtimeFromPayload = toNumber(
      item.overtimeMinutes ?? item.overtime_minutes,
    );
    overtimeMinutes +=
      overtimeFromPayload > 0
        ? overtimeFromPayload
        : Math.max(
            0,
            minutes - PAYROLL_CONSTANTS.STANDARD_WORK_MINUTES_PER_DAY,
          );

    if (LATE_STATUSES.has(status)) lateDays += 1;
    if (LEAVE_STATUSES.has(status)) leaveDays += 1;
  });

  const overtimeHours = overtimeMinutes / 60;
  const overtimePay = overtimeHours * PAYROLL_CONSTANTS.OVERTIME_RATE_PER_HOUR;
  const insuranceAmount = safeBaseSalary * PAYROLL_CONSTANTS.INSURANCE_RATE;
  const taxAmount = safeBaseSalary * PAYROLL_CONSTANTS.TAX_RATE;
  const lateDeduction = lateDays * PAYROLL_CONSTANTS.LATE_PENALTY_PER_DAY;
  const excessLeaveDays = Math.max(
    0,
    leaveDays - PAYROLL_CONSTANTS.MAX_PAID_LEAVE_DAYS,
  );
  const leaveDeduction = excessLeaveDays * salaryPerDay;

  const workSalary = salaryPerDay * workDays;
  const grossSalary = workSalary + safeAllowance + safeBonus + overtimePay;
  const netSalary =
    grossSalary - insuranceAmount - taxAmount - lateDeduction - leaveDeduction;

  return {
    workDays,
    leaveDays,
    lateDays,
    overtimeMinutes,
    overtimeHours,
    workSalary,
    overtimePay,
    insuranceAmount,
    taxAmount,
    lateDeduction,
    leaveDeduction,
    allowance: safeAllowance,
    bonus: safeBonus,
    grossSalary,
    netSalary,
  };
};
