import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  Printer,
  Wallet,
  Calculator,
  CheckCircle,
  DollarSign,
  Lock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import useAuthStore from "../../stores/useAuthStore";
import useToastStore from "../../stores/useToastStore";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import {
  attendanceAPI,
  employeeAPI,
  payrollAPI,
  payrollPeriodAPI,
} from "../../services";
import { formatCurrency } from "../../utils/formatDate";
import {
  calculatePayrollByAttendance,
  PAYROLL_CONSTANTS,
} from "../../utils/payrollCalculator";
import Pagination from "../../components/ui/Pagination";

const AdminPayrollPage = () => {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const location = useLocation();
  const roleId = Number(user?.roleId || user?.role_id || user?.role || 0);
  const isEmployeePortal = location.pathname.startsWith("/employee");
  const isHR = !isEmployeePortal && (roleId === 1 || roleId === 5);

  const [reportType, setReportType] = useState("month");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({ totalEmployees: 0, totalSalary: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [emptyMessage, setEmptyMessage] = useState("Chưa có dữ liệu lương");
  const [employees, setEmployees] = useState([]);
  const lastErrorRef = useRef("");
  const [periods, setPeriods] = useState([]);
  const [reloadToggle, setReloadToggle] = useState(false);
  const [attendanceByEmployee, setAttendanceByEmployee] = useState({});
  const [myEmployeeProfile, setMyEmployeeProfile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedPayrollRows, setExpandedPayrollRows] = useState({});
  const itemsPerPage = 6;
  const internalEmployeeId = myEmployeeProfile?.id || myEmployeeProfile?.employeeId || null;

  const getPeriodMonthValue = (period) => {
    if (!period) return null;
    const month =
      Number(period.monthNo || period.month_no || period.month || 0) || null;
    const year =
      Number(period.yearNo || period.year_no || period.year || 0) || null;

    if (month && year) {
      return `${year}-${String(month).padStart(2, "0")}`;
    }

    const start = period.startDate || period.start_date || period.fromDate || period.from_date;
    if (!start) return null;

    const date = new Date(start);
    if (Number.isNaN(date.getTime())) return null;
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  useEffect(() => {
    if (!isHR) return;
    const fetchEmployees = async () => {
      try {
        const res = await employeeAPI.getAllEmployees({ page: 1, limit: 300 });
        const list = res?.data || [];
        setEmployees(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, [isHR]);

  useEffect(() => {
    let isMounted = true;

    const fetchMyEmployeeProfile = async () => {
      if (![3, 4, 5].includes(Number(roleId))) {
        setMyEmployeeProfile(null);
        return;
      }

      try {
        const res = await employeeAPI.getMyProfile();
        if (isMounted) {
          setMyEmployeeProfile(res?.data || res || null);
        }
      } catch {
        if (isMounted) {
          setMyEmployeeProfile(null);
        }
      }
    };

    fetchMyEmployeeProfile();

    return () => {
      isMounted = false;
    };
  }, [roleId]);

  useEffect(() => {
    if (!isHR) {
      setPeriods([]);
      return;
    }

    const fetchPeriods = async () => {
      try {
        const res = await payrollPeriodAPI.getAllPeriods();
        const data = res?.data || res;
        const list =
          data?.payrollPeriods ||
          data?.items ||
          data?.periods ||
          data?.rows ||
          data?.data ||
          data ||
          [];
        const normalizedList = Array.isArray(list) ? list : [];
        setPeriods(normalizedList);

        if (normalizedList.length > 0) {
          const hasCurrentPeriod = normalizedList.some(
            (period) => getPeriodMonthValue(period) === selectedMonth,
          );

          if (!hasCurrentPeriod) {
            const latestPeriod = [...normalizedList].sort((a, b) => {
              const aValue = getPeriodMonthValue(a) || "";
              const bValue = getPeriodMonthValue(b) || "";
              return bValue.localeCompare(aValue);
            })[0];

            const latestMonth = getPeriodMonthValue(latestPeriod);
            if (latestMonth) {
              setSelectedMonth(latestMonth);
              const latestYear = Number(latestMonth.split("-")[0]);
              if (latestYear) {
                setSelectedYear(latestYear);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error fetching payroll periods:", error);
      }
    };
    fetchPeriods();
  }, [isHR, selectedMonth]);

  useEffect(() => {
    if (!isHR || reportType !== "month") {
      setAttendanceByEmployee({});
      return;
    }

    const fetchAttendanceByMonth = async () => {
      try {
        const [yearStr, monthStr] = selectedMonth.split("-");
        const res = await attendanceAPI.getAllAttendance(1, 2000, {
          month: Number(monthStr),
          year: Number(yearStr),
        });
        const data = res?.data || res;
        const list =
          data?.attendances ||
          data?.items ||
          data?.rows ||
          data?.data ||
          data ||
          [];

        if (!Array.isArray(list)) {
          setAttendanceByEmployee({});
          return;
        }

        const grouped = list.reduce((acc, item) => {
          const employeeId =
            item.employeeId ||
            item.employee_id ||
            item.employee?.id ||
            item.userId ||
            item.user_id;
          if (!employeeId) return acc;
          const key = String(employeeId);
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
        setAttendanceByEmployee(grouped);
      } catch (error) {
        console.error("Error fetching attendance for payroll formula:", error);
        setAttendanceByEmployee({});
      }
    };

    fetchAttendanceByMonth();
  }, [isHR, reportType, selectedMonth]);

  const resolvePeriodId = () => {
    if (!Array.isArray(periods) || periods.length === 0) return null;
    const [yearStr, monthStr] = selectedMonth.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr);
    const match = periods.find((p) => {
      const start = p.startDate || p.start_date || p.from_date || p.fromDate;
      const end = p.endDate || p.end_date || p.to_date || p.toDate;
      if (start) {
        const d = new Date(start);
        if (!Number.isNaN(d.getTime())) {
          return d.getFullYear() === year && d.getMonth() + 1 === month;
        }
      }
      if (p.month && p.year) {
        return Number(p.month) === month && Number(p.year) === year;
      }
      if (p.monthNo && p.yearNo) {
        return Number(p.monthNo) === month && Number(p.yearNo) === year;
      }
      if (p.month_no && p.year_no) {
        return Number(p.month_no) === month && Number(p.year_no) === year;
      }
      if (p.name || p.periodName) {
        const label = String(p.name || p.periodName).toLowerCase();
        return label.includes(`${month}`) && label.includes(`${year}`);
      }
      return false;
    });
    return match?.id || null;
  };

  const employeeMap = useMemo(() => {
    return employees.reduce((acc, emp) => {
      acc[emp.id] =
        emp.userName ||
        emp.username ||
        emp.user_name ||
        emp.name ||
        emp.fullName ||
        emp.employee_name ||
        emp.user?.name ||
        emp.user?.fullName ||
        "";
      return acc;
    }, {});
  }, [employees]);

  const employeeBaseSalaryMap = useMemo(() => {
    return employees.reduce((acc, emp) => {
      const id = emp.id || emp.userId || emp.employeeId;
      if (!id) return acc;
      acc[String(id)] = Number(
        emp.baseSalary ||
          emp.base_salary ||
          emp.currentPosition?.baseSalary ||
          emp.currentPosition?.base_salary ||
          emp.currentSalary ||
          emp.current_salary ||
          emp.position?.baseSalary ||
          0,
      );
      return acc;
    }, {});
  }, [employees]);

  const employeeAllowanceMap = useMemo(() => {
    return employees.reduce((acc, emp) => {
      const id = emp.id || emp.userId || emp.employeeId;
      if (!id) return acc;
      acc[String(id)] = Number(
          emp.currentPosition?.allowanceAmount ||
          0,
      );
      return acc;
    }, {});
  }, [employees]);

  const getMonthYear = () => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    return { year: Number(yearStr), month: Number(monthStr) };
  };

  const extractList = (res) => {
    const data = res?.data || res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.attendances)) return data.attendances;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.payrolls)) return data.payrolls;
    if (Array.isArray(data?.rows)) return data.rows;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const normalizeRow = (item, fallbackName) => {
    const salaryPayload = item.salary || item.payroll || {};
    const employeePayload = item.employee || item.user || {};
    const periodPayload = item.period || {};
    const employeeId =
      item.employeeId ||
      item.employee_id ||
      item.employee?.id ||
      employeePayload.id ||
      item.userId ||
      item.user?.id ||
      item.user_id;
    const name =
      item.employeeName ||
      item.employee_name ||
      item.employee?.name ||
      item.employee?.fullName ||
      employeePayload.name ||
      employeePayload.fullName ||
      item.userName ||
      item.username ||
      item.user?.name ||
      item.user?.fullName ||
      item.name ||
      employeeMap[employeeId] ||
      fallbackName ||
      "N/A";
    const baseSalary = Number(
      item.baseSalary ||
        item.base_salary ||
        salaryPayload.baseSalary ||
        salaryPayload.base_salary ||
        item.basicSalary ||
        item.basic_salary ||
        item.salary_base ||
        item.positionSalary ||
        0,
    );
    const workDays =
      item.workDays ||
      item.work_days ||
      item.attendanceDays ||
      item.attendance_days ||
      null;
    const salary = Number(
      item.totalSalary ||
        item.total_salary ||
        item.netSalary ||
        item.net_salary ||
        item.payableSalary ||
        item.payable_salary ||
        salaryPayload.totalSalary ||
        salaryPayload.total_salary ||
        salaryPayload.netSalary ||
        salaryPayload.net_salary ||
        salaryPayload.payableSalary ||
        salaryPayload.payable_salary ||
        0,
    );
    const periodLabel =
      item.periodName ||
      item.period_name ||
      item.period ||
      periodPayload.code ||
      periodPayload.periodCode ||
      (periodPayload.monthNo && periodPayload.yearNo
        ? `${periodPayload.monthNo}/${periodPayload.yearNo}`
        : "") ||
      item.month ||
      item.label ||
      "";
    const status = item.status || item.payrollStatus || "";
    const allowance = Number(
      item.allowanceTotal ||
        item.allowance_total ||
        salaryPayload.allowanceTotal ||
        salaryPayload.allowance_total ||
        0,
    );
    const bonus = Number(
      item.bonusTotal ||
        item.bonus_total ||
        item.bonus ||
        salaryPayload.bonusTotal ||
        salaryPayload.bonus_total ||
        0,
    );
    const insurance = Number(
      item.insuranceAmount ||
        item.insurance_amount ||
        salaryPayload.insuranceAmount ||
        salaryPayload.insurance_amount ||
        0,
    );
    const tax = Number(
      item.taxAmount ||
        item.tax_amount ||
        salaryPayload.taxAmount ||
        salaryPayload.tax_amount ||
        0,
    );
    return {
      id:
        item.id ||
        `${employeeId || name}-${periodLabel || item.periodId || item.period_id || ""}`,
      employeeId,
      name,
      baseSalary,
      workDays,
      salary,
      periodLabel,
      status,
      allowance,
      bonus,
      insurance,
      tax,
    };
  };

  const buildSummary = (list) => {
    return list.reduce(
      (acc, row) => ({
        totalEmployees: acc.totalEmployees + (row.name ? 1 : 0),
        totalSalary: acc.totalSalary + Number(row.salary || 0),
      }),
      { totalEmployees: 0, totalSalary: 0 },
    );
  };

  const applySelectedMonth = (monthValue) => {
    if (!monthValue) return;
    setSelectedMonth(monthValue);
    const nextYear = Number(String(monthValue).split("-")[0]);
    if (nextYear) {
      setSelectedYear(nextYear);
    }
  };

  const findLatestAdminPayrollPeriod = async () => {
    const sortedPeriods = [...periods].sort((a, b) => {
      const aValue = getPeriodMonthValue(a) || "";
      const bValue = getPeriodMonthValue(b) || "";
      return bValue.localeCompare(aValue);
    });

    for (const period of sortedPeriods) {
      if (!period?.id) continue;
      const res = await payrollAPI.getPayrolls({ periodId: period.id }).catch(() => null);
      const list = extractList(res).map((item) => normalizeRow(item));
      if (list.length > 0) {
        return { rows: list, period };
      }
    }

    return null;
  };

  const extractMonthlyRowsFromYearly = (yearlyRes, fallbackName) => {
    const payload = yearlyRes?.data || yearlyRes || {};
    const months = payload?.months || payload?.monthlyPayrolls || payload?.data?.months || [];
    if (!Array.isArray(months)) return [];

    return months.map((item) => {
      const periodMonth = Number(item.monthNo || item.month || item.periodMonth || 0) || null;
      const periodYear = Number(item.yearNo || item.year || selectedYear) || selectedYear;
      return {
        id: item.id || `month-${periodYear}-${periodMonth || "x"}`,
        employeeId: item.employeeId || null,
        name: fallbackName,
        baseSalary: Number(item.baseSalary || 0),
        workDays: item.workDays || item.work_days || null,
        salary: Number(
          item.totalSalary ||
            item.total_salary ||
            item.netSalary ||
            item.net_salary ||
            item.payableSalary ||
            item.payable_salary ||
            0,
        ),
        periodLabel:
          item.periodCode ||
          item.period ||
          (periodMonth ? `${periodMonth}/${periodYear}` : `${periodYear}`),
        monthValue: periodMonth
          ? `${periodYear}-${String(periodMonth).padStart(2, "0")}`
          : null,
        status: item.status || "",
      };
    });
  };

  useEffect(() => {
    let isMounted = true;
    const fetchPayroll = async () => {
      setIsLoading(true);
      try {
        if (isHR) {
          setEmptyMessage("Chưa có dữ liệu lương");
          const periodId = reportType === "month" ? resolvePeriodId() : null;
          const params =
            reportType === "month" ? { periodId } : { year: selectedYear };

          if (reportType === "month" && !periodId) {
            const fallback = await findLatestAdminPayrollPeriod();
            if (!isMounted) return;
            if (fallback) {
              setRows(fallback.rows);
              setSummary(buildSummary(fallback.rows));
              const monthValue = getPeriodMonthValue(fallback.period);
              if (monthValue && monthValue !== selectedMonth) {
                applySelectedMonth(monthValue);
              }
            } else {
              setRows([]);
              setSummary({ totalEmployees: 0, totalSalary: 0 });
            }
            lastErrorRef.current = "";
            return;
          }

          const payrollRes = await payrollAPI.getPayrolls(params);
          let list = extractList(payrollRes);
          let normalized = list.map((item) => normalizeRow(item));

          if (reportType === "month" && normalized.length === 0) {
            const fallback = await findLatestAdminPayrollPeriod();
            if (fallback) {
              normalized = fallback.rows;
              const monthValue = getPeriodMonthValue(fallback.period);
              if (monthValue && monthValue !== selectedMonth) {
                applySelectedMonth(monthValue);
              }
            }
          }

          if (reportType === "year") {
            const grouped = new Map();
            normalized.forEach((row) => {
              const key = row.employeeId || row.name;
              const existing = grouped.get(key) || {
                ...row,
                salary: 0,
                workDays: 0,
              };
              existing.salary += Number(row.salary || 0);
              if (row.workDays) {
                existing.workDays += Number(row.workDays || 0);
              }
              grouped.set(key, existing);
            });
            normalized = Array.from(grouped.values());
          }

          if (!isMounted) return;
          setRows(normalized);
          lastErrorRef.current = "";

          try {
            const statsRes = await payrollAPI.getPayrollStatistics(params);
            const stats = statsRes?.data || statsRes;
            if (stats?.totalSalary || stats?.totalEmployees) {
              setSummary({
                totalEmployees:
                  stats.totalEmployees ||
                  stats.total_employees ||
                  normalized.length,
                totalSalary: stats.totalSalary || stats.total_salary || 0,
              });
            } else {
              setSummary(buildSummary(normalized));
            }
          } catch (error) {
            setSummary(buildSummary(normalized));
          }
        } else {
          const fallbackName =
            myEmployeeProfile?.user?.name ||
            myEmployeeProfile?.userName ||
            myEmployeeProfile?.name ||
            user?.name ||
            user?.fullName ||
            "Tôi";
          if (reportType === "month") {
            const params = getMonthYear();
            let list = [];

            let normalized = list.map((item) =>
              normalizeRow(item, fallbackName),
            );

            if (normalized.length === 0) {
              const attendanceRes = await attendanceAPI
                .getMyAttendance(params)
                .catch(() => null);
              const attendances = extractList(attendanceRes);
              const baseSalary = Number(
                myEmployeeProfile?.baseSalary ||
                  myEmployeeProfile?.base_salary ||
                  myEmployeeProfile?.currentPosition?.baseSalary ||
                  myEmployeeProfile?.currentPosition?.base_salary ||
                  myEmployeeProfile?.currentSalary ||
                  myEmployeeProfile?.current_salary ||
                  myEmployeeProfile?.position?.baseSalary ||
                  0,
              );
              const allowance = Number(
                myEmployeeProfile?.allowanceAmount ||
                  myEmployeeProfile?.allowance_amount ||
                  myEmployeeProfile?.currentPosition?.allowanceAmount ||
                  myEmployeeProfile?.currentPosition?.allowance_amount ||
                  0,
              );

              if (attendances.length > 0) {
                const breakdown = calculatePayrollByAttendance({
                  baseSalary,
                  allowance,
                  bonus: 0,
                  attendances,
                });
                const previewNetSalary = Math.max(
                  0,
                  baseSalary +
                    breakdown.allowance +
                    breakdown.bonus +
                    breakdown.overtimePay -
                    breakdown.insuranceAmount -
                    breakdown.taxAmount -
                    breakdown.lateDeduction -
                    breakdown.leaveDeduction,
                );

                normalized = [
                  {
                    id: `preview-${selectedMonth}`,
                    employeeId: internalEmployeeId,
                    name: fallbackName,
                    baseSalary,
                    workDays: breakdown.workDays,
                    salary: previewNetSalary,
                    allowance: breakdown.allowance,
                    bonus: breakdown.bonus,
                    insurance: breakdown.insuranceAmount,
                    tax: breakdown.taxAmount,
                    overtimeHours: breakdown.overtimeHours,
                    lateDeduction: breakdown.lateDeduction,
                    leaveDeduction: breakdown.leaveDeduction,
                    status: "PREVIEW",
                    periodLabel: selectedMonth,
                  },
                ];
              }
            }

            if (!isMounted) return;
            setRows(normalized);
            setSummary(buildSummary(normalized));
            setEmptyMessage(
              normalized.length > 0
                ? "Bảng lương đang hiển thị tạm tính từ chấm công"
                : "Tháng này chưa có dữ liệu chấm công",
            );
            lastErrorRef.current = "";
          } else {
            const params = { year: selectedYear };
            const baseSalary = Number(
              myEmployeeProfile?.baseSalary ||
                myEmployeeProfile?.base_salary ||
                myEmployeeProfile?.currentPosition?.baseSalary ||
                myEmployeeProfile?.currentPosition?.base_salary ||
                myEmployeeProfile?.currentSalary ||
                myEmployeeProfile?.current_salary ||
                myEmployeeProfile?.position?.baseSalary ||
                0,
            );
            const allowance = Number(
              myEmployeeProfile?.allowanceAmount ||
                myEmployeeProfile?.allowance_amount ||
                myEmployeeProfile?.currentPosition?.allowanceAmount ||
                myEmployeeProfile?.currentPosition?.allowance_amount ||
                0,
            );
            const normalized = [];

            for (let month = 1; month <= 12; month += 1) {
              const attendanceRes = await attendanceAPI
                .getMyAttendance({ year: params.year, month })
                .catch(() => null);
              const attendances = extractList(attendanceRes);
              if (!attendances.length) continue;

              const breakdown = calculatePayrollByAttendance({
                baseSalary,
                allowance,
                bonus: 0,
                attendances,
              });
              const previewNetSalary = Math.max(
                0,
                baseSalary +
                  breakdown.allowance +
                  breakdown.bonus +
                  breakdown.overtimePay -
                  breakdown.insuranceAmount -
                  breakdown.taxAmount -
                  breakdown.lateDeduction -
                  breakdown.leaveDeduction,
              );

              normalized.push({
                id: `preview-${selectedYear}-${month}`,
                employeeId: internalEmployeeId,
                name: `Tháng ${month}`,
                baseSalary,
                workDays: breakdown.workDays,
                salary: previewNetSalary,
                allowance: breakdown.allowance,
                bonus: breakdown.bonus,
                insurance: breakdown.insuranceAmount,
                tax: breakdown.taxAmount,
                overtimeHours: breakdown.overtimeHours,
                lateDeduction: breakdown.lateDeduction,
                leaveDeduction: breakdown.leaveDeduction,
                status: "PREVIEW",
                periodLabel: `${month}/${selectedYear}`,
              });
            }

            if (!isMounted) return;
            setRows(normalized);
            setSummary(buildSummary(normalized));
            setEmptyMessage(
              normalized.length > 0
                ? "Bảng lương năm đang hiển thị tạm tính từ chấm công"
                : "Năm này chưa có dữ liệu chấm công",
            );
            lastErrorRef.current = "";
          }
        }
      } catch (error) {
        console.error("Error fetching payroll:", error);
        const key = `${reportType}-${selectedMonth}-${selectedYear}-${isHR}-${reloadToggle}`;
        if (lastErrorRef.current !== key) {
          toast.error("Không thể tải dữ liệu lương");
          lastErrorRef.current = key;
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchPayroll();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    reportType,
    selectedMonth,
    selectedYear,
    isHR,
    internalEmployeeId,
    employeeMap,
    user,
    reloadToggle,
  ]);

  const payrollRows = useMemo(() => {
    if (!isHR || reportType !== "month") return rows;

    if (rows.length > 0) {
      return rows;
    }

    // Nếu backend chưa generate payroll, vẫn hiển thị bảng lương dự kiến từ chấm công.
    return Object.entries(attendanceByEmployee).map(
      ([employeeId, attendances]) => {
        const baseSalary = Number(employeeBaseSalaryMap[employeeId] || 0);
        const allowance = Number(employeeAllowanceMap[employeeId] || 0);
        const breakdown = calculatePayrollByAttendance({
          baseSalary,
          allowance,
          bonus: 0,
          attendances,
        });

        return {
          id: `preview-${employeeId}`,
          employeeId: Number(employeeId),
          name: employeeMap[employeeId] || `Nhân viên #${employeeId}`,
          baseSalary,
          salary: breakdown.netSalary,
          workDays: breakdown.workDays,
          overtimeHours: breakdown.overtimeHours,
          allowance: breakdown.allowance,
          bonus: breakdown.bonus,
          insurance: breakdown.insuranceAmount,
          tax: breakdown.taxAmount,
          lateDays: breakdown.lateDays,
          leaveDays: breakdown.leaveDays,
          lateDeduction: breakdown.lateDeduction,
          leaveDeduction: breakdown.leaveDeduction,
          status: "PREVIEW",
        };
      },
    );
  }, [
    isHR,
    reportType,
    rows,
    attendanceByEmployee,
    employeeBaseSalaryMap,
    employeeAllowanceMap,
    employeeMap,
  ]);

  const displaySummary = useMemo(() => {
    if (isHR && reportType === "month") {
      return buildSummary(payrollRows);
    }
    return summary;
  }, [isHR, reportType, payrollRows, summary]);

  const handleGeneratePayroll = async () => {
    try {
      if (reportType !== "month") {
        return toast.error("Vui lòng chọn Theo tháng để tính lương");
      }
      setIsLoading(true);
      const [yearStr, monthStr] = selectedMonth.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);

      let pId = resolvePeriodId();
      if (!pId) {
        const startDate = new Date(year, month - 1, 1)
          .toISOString()
          .split("T")[0];
        const endDate = new Date(year, month, 0).toISOString().split("T")[0];
        const payload = {
          code: `PR-${year}${month.toString().padStart(2, "0")}`,
          name: `Bảng lương tháng ${month}/${year}`,
          monthNo: month,
          yearNo: year,
          startDate,
          endDate,
          status: "OPEN",
        };

        try {
          const res = await payrollPeriodAPI.createPeriod(payload);
          pId = res?.data?.id || res?.data?.data?.id || res?.id;
        } catch (err) {
          const errorText =
            typeof err === "string"
              ? err
              : err?.message ||
                err?.error ||
                err?.detail ||
                JSON.stringify(err || {});
          const normalizedErrorText = String(errorText).toLowerCase();
          const isConflict =
            err?.response?.status === 409 ||
            err?.status === 409 ||
            err?.statusCode === 409 ||
            normalizedErrorText.includes("409") ||
            normalizedErrorText.includes("ton tai") ||
            normalizedErrorText.includes("ky luong thang");

          if (!isConflict) {
            console.error("Create period error detail:", err);
            throw err;
          }
        }

        // Always re-fetch periods after create attempt
        const pRes = await payrollPeriodAPI.getAllPeriods();
        const dataOrig = pRes?.data || pRes;
        const pList =
          dataOrig?.payrollPeriods ||
          dataOrig?.items ||
          dataOrig?.periods ||
          dataOrig?.rows ||
          dataOrig?.data ||
          dataOrig ||
          [];
        const validList = Array.isArray(pList) ? pList : [];
        setPeriods(validList);

        if (!pId) {
          const match = validList.find(
            (p) =>
              (p.monthNo === month && p.yearNo === year) ||
              (Number(p.month_no) === month && Number(p.year_no) === year),
          );
          if (match) pId = match.id;
        }
      }

      if (!pId) throw new Error("Không thể tạo kỳ lương");

      const genRes = await payrollAPI.generatePayrolls({ periodId: pId });
      const genData = genRes?.data || genRes;
      const generated = genData?.generated || 0;
      const skipped = genData?.skipped || 0;
      toast.success(
        `Đã tính lương: ${generated} NV thành công, ${skipped} bỏ qua`,
      );
      setReloadToggle((prev) => !prev);
    } catch (err) {
      console.error("Generate Payroll Error full detail:", err);
      let msg = err.message || "Lỗi khi tính lương";
      if (err.errors && Array.isArray(err.errors)) {
        msg = err.errors.map((e) => e.msg || e.message).join(", ");
      }
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinalize = async (payrollId) => {
    try {
      await payrollAPI.finalizePayroll(payrollId);
      toast.success("Đã chốt bảng lương");
      setReloadToggle((prev) => !prev);
    } catch (err) {
      toast.error(err.message || "Không thể chốt bảng lương");
    }
  };

  const handleMarkPaid = async (payrollId) => {
    try {
      await payrollAPI.markPayrollPaid(payrollId);
      toast.success("Đã đánh dấu đã trả lương");
      setReloadToggle((prev) => !prev);
    } catch (err) {
      toast.error(err.message || "Không thể đánh dấu đã trả");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const togglePayrollDetails = (rowId) => {
    setExpandedPayrollRows((prev) => ({
      ...prev,
      [rowId]: !prev[rowId],
    }));
  };

  const showWorkDays = reportType === "month";
  const isYearView = reportType === "year";
  const showActions = isHR && reportType === "month";
  const compactHrMonthView = showWorkDays && isHR;
  const displayRows = isHR && reportType === "month" ? payrollRows : rows;
  const firstColumnLabel = isHR
    ? "Nh\u00e2n vi\u00ean"
    : reportType === "year"
      ? "K\u1ef3 l\u01b0\u01a1ng"
      : "Nh\u00e2n vi\u00ean";

  const STATUS_BADGE = {
    DRAFT: "bg-yellow-100 text-yellow-800",
    FINALIZED: "bg-blue-100 text-blue-800",
    PAID: "bg-green-100 text-green-800",
    PREVIEW: "bg-slate-100 text-slate-700",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bảng lương</h1>
        <p className="text-gray-600 mt-1">
          Theo dõi lương theo tháng hoặc tổng kết năm
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={reportType}
          onChange={(e) => setReportType(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-coffee-500"
        >
          <option value="month">Theo tháng</option>
          <option value="year">Theo năm</option>
        </select>
        {reportType === "month" ? (
          <Input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="max-w-[200px]"
          />
        ) : (
          <Input
            type="number"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="max-w-[140px]"
          />
        )}
        {isHR && reportType === "month" && (
          <Button
            onClick={handleGeneratePayroll}
            className="bg-coffee-600 hover:bg-coffee-700 text-white"
          >
            <Calculator className="w-4 h-4 mr-2" />
            Tính lương
          </Button>
        )}
        <Button onClick={handlePrint} variant="outline">
          <Printer className="w-4 h-4 mr-2" />
          In bảng lương
        </Button>
      </div>

      {isHR && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-600">Tổng nhân sự</p>
            <p className="text-2xl font-bold text-gray-900">
              {displaySummary.totalEmployees}
            </p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-600">Tổng quỹ lương</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(displaySummary.totalSalary)}
            </p>
          </div>
        </div>
      )}

      {!isHR && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-600">Tổng nhân sự</p>
              <p className="text-2xl font-bold text-gray-900">
                {displaySummary.totalEmployees}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <p className="text-sm text-gray-600">Tổng quỹ lương</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(displaySummary.totalSalary)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Cách tính lương
            </h2>
            <p className="text-sm text-gray-600">
              Lương thực lãnh = (Lương cơ bản /{" "}
              {PAYROLL_CONSTANTS.STANDARD_WORK_DAYS_PER_MONTH} x Ngày công) +
              Phụ cấp + Thưởng + OT(giờ) x{" "}
              {formatCurrency(PAYROLL_CONSTANTS.OVERTIME_RATE_PER_HOUR)} - Bảo
              hiểm({PAYROLL_CONSTANTS.INSURANCE_RATE * 100}% lương cơ bản) -
              Thuế({PAYROLL_CONSTANTS.TAX_RATE * 100}% lương cơ bản) - Trễ(
              {formatCurrency(PAYROLL_CONSTANTS.LATE_PENALTY_PER_DAY)}/ngày) -
              Trừ nghỉ vượt {PAYROLL_CONSTANTS.MAX_PAID_LEAVE_DAYS} ngày
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Quy ước: {PAYROLL_CONSTANTS.STANDARD_WORK_MINUTES_PER_DAY} phút =
              1 ngày công, phần vượt tính OT.
            </p>
          </div>
        </>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="w-5 h-5 text-coffee-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {isHR ? "Danh sách bảng lương" : "Bảng lương của tôi"}
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {firstColumnLabel}
                </th>
                {!isYearView && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {"L\u01b0\u01a1ng c\u01a1 b\u1ea3n"}
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {"Th\u1ef1c l\u00e3nh"}
                </th>
                {compactHrMonthView && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {"Chi ti\u1ebft"}
                  </th>
                )}
                {showActions && (
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {"Tr\u1ea1ng th\u00e1i"}
                  </th>
                )}
                {showActions && (
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    {"Thao t\u00e1c"}
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={compactHrMonthView ? (showActions ? 6 : 4) : showActions ? 5 : 3}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {"\u0110ang t\u1ea3i d\u1eef li\u1ec7u..."}
                  </td>
                </tr>
              ) : displayRows.length > 0 ? (
                displayRows
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((row) => {
                    const deductionTotal =
                      Number(row.lateDeduction || 0) + Number(row.leaveDeduction || 0);
                    const isExpanded = Boolean(expandedPayrollRows[row.id]);

                    if (compactHrMonthView) {
                      return [
                        <tr key={row.id}>
                          <td className="px-4 py-3 text-gray-900">
                            {row.name || row.periodLabel || "--"}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900">
                            {formatCurrency(row.baseSalary || 0)}
                          </td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">
                            {formatCurrency(row.salary || 0)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              type="button"
                              onClick={() => togglePayrollDetails(row.id)}
                              className="inline-flex items-center gap-1 rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-3.5 h-3.5" />
                                  {"\u1ea8n"}
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                  {"Xem"}
                                </>
                              )}
                            </button>
                          </td>
                          {showActions && (
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || "bg-gray-100 text-gray-600"}`}
                              >
                                {row.status === "DRAFT"
                                  ? "Nh\u00e1p"
                                  : row.status === "FINALIZED"
                                    ? "\u0110\u00e3 ch\u1ed1t"
                                    : row.status === "PAID"
                                      ? "\u0110\u00e3 tr\u1ea3"
                                      : row.status === "PREVIEW"
                                        ? "T\u1ea1m t\u00ednh"
                                        : row.status || "--"}
                              </span>
                            </td>
                          )}
                          {showActions && (
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                {row.status === "DRAFT" && (
                                  <button
                                    onClick={() => handleFinalize(row.id)}
                                    className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1"
                                    title={"Ch\u1ed1t b\u1ea3ng l\u01b0\u01a1ng"}
                                  >
                                    <Lock className="w-3 h-3" /> {"Ch\u1ed1t"}
                                  </button>
                                )}
                                {row.status === "FINALIZED" && (
                                  <button
                                    onClick={() => handleMarkPaid(row.id)}
                                    className="px-2 py-1 text-xs bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center gap-1"
                                    title={"\u0110\u00e1nh d\u1ea5u \u0111\u00e3 tr\u1ea3 l\u01b0\u01a1ng"}
                                  >
                                    <DollarSign className="w-3 h-3" /> {"\u0110\u00e3 tr\u1ea3"}
                                  </button>
                                )}
                                {row.status === "PAID" && (
                                  <span className="text-xs text-green-600 flex items-center gap-1">
                                    <CheckCircle className="w-3 h-3" /> {"Ho\u00e0n t\u1ea5t"}
                                  </span>
                                )}
                              </div>
                            </td>
                          )}
                        </tr>,
                        isExpanded ? (
                          <tr key={`${row.id}-details`} className="bg-stone-50/55">
                            <td
                              colSpan={showActions ? 6 : 4}
                              className="px-4 pb-4 pt-0 text-sm text-gray-600"
                            >
                              <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-stone-200 pt-3">
                                <span><strong>{"Ng\u00e0y c\u00f4ng:"}</strong> {Number(row.workDays || 0).toFixed(2)}</span>
                                <span><strong>OT:</strong> {Number(row.overtimeHours || 0).toFixed(2)} {"gi\u1edd"}</span>
                                <span><strong>{"Ph\u1ee5 c\u1ea5p:"}</strong> {formatCurrency(row.allowance || 0)}</span>
                                <span><strong>{"Th\u01b0\u1edfng:"}</strong> {formatCurrency(row.bonus || 0)}</span>
                                <span><strong>{"B\u1ea3o hi\u1ec3m:"}</strong> -{formatCurrency(row.insurance || 0)}</span>
                                <span><strong>{"Thu\u1ebf:"}</strong> -{formatCurrency(row.tax || 0)}</span>
                                <span><strong>{"Tr\u1eeb tr\u1ec5 + ngh\u1ec9:"}</strong> -{formatCurrency(deductionTotal)}</span>
                              </div>
                            </td>
                          </tr>
                        ) : null,
                      ];
                    }

                    return (
                      <tr key={row.id}>
                        <td className="px-4 py-3 text-gray-900">
                          {row.name || row.periodLabel || "--"}
                        </td>
                        {!isYearView && (
                          <td className="px-4 py-3 text-right text-gray-900">
                            {formatCurrency(row.baseSalary || 0)}
                          </td>
                        )}
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">
                          {formatCurrency(row.salary || 0)}
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td
                    colSpan={compactHrMonthView ? (showActions ? 6 : 4) : showActions ? 5 : 3}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {emptyMessage}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {!isLoading && Math.ceil(displayRows.length / itemsPerPage) > 1 && (
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(displayRows.length / itemsPerPage)}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPayrollPage;
