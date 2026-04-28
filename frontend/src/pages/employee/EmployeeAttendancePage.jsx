import { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Clock3, LogIn, LogOut } from "lucide-react";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Pagination from "../../components/ui/Pagination";
import useToastStore from "../../stores/useToastStore";
import { attendanceAPI } from "../../services";

const extractAttendanceList = (res) => {
  const data = res?.data || res;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.attendances)) return data.attendances;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getLocalDateKey = (value = new Date()) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value || "").slice(0, 10);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getAttendanceDateKey = (item) => {
  const timestampValue =
    item?.checkIn ||
    item?.check_in ||
    item?.timeIn ||
    item?.checkOut ||
    item?.check_out ||
    item?.timeOut;

  if (timestampValue) {
    return getLocalDateKey(timestampValue);
  }

  return getLocalDateKey(
    item?.date || item?.attendanceDate || item?.attendance_date || item?.workDate,
  );
};

const getAttendanceDisplayDate = (item) =>
  getLocalDateKey(
    item?.date || item?.attendanceDate || item?.attendance_date || item?.workDate,
  ) || getAttendanceDateKey(item);

const EmployeeAttendancePage = () => {
  const toast = useToastStore();
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7),
  );
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAttendance = async (monthValue = selectedMonth) => {
    setIsLoading(true);
    try {
      const [yearStr, monthStr] = monthValue.split("-");
      const res = await attendanceAPI.getMyAttendance({
        month: Number(monthStr),
        year: Number(yearStr),
      });
      setRecords(extractAttendanceList(res));
    } catch (error) {
      console.error("Error fetching my attendance:", error);
      toast.error("Không thể tải lịch sử điểm danh");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedMonth);
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMonth]);

  const todayKey = getLocalDateKey();
  const todayRecord = useMemo(
    () => records.find((item) => getAttendanceDateKey(item) === todayKey) || null,
    [records, todayKey],
  );

  const hasCheckedIn = Boolean(
    todayRecord?.checkIn || todayRecord?.check_in || todayRecord?.timeIn,
  );
  const hasCheckedOut = Boolean(
    todayRecord?.checkOut || todayRecord?.check_out || todayRecord?.timeOut,
  );

  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      await attendanceAPI.checkIn();
      toast.success("Check-in thành công");
      await fetchAttendance();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Không thể check-in",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      await attendanceAPI.checkOut();
      toast.success("Check-out thành công");
      await fetchAttendance();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Không thể check-out",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const paginatedRecords = records.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Điểm danh</h1>
        <p className="mt-1 text-gray-600">
          Check-in, check-out và xem lại lịch sử công của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-3">
            <CalendarCheck className="h-5 w-5 text-coffee-700" />
            <h2 className="text-lg font-semibold text-gray-900">Hôm nay</h2>
          </div>

          <div className="mt-4 space-y-3 text-sm text-gray-700">
            <p>
              Check-in:{" "}
              <span className="font-medium text-gray-900">
                {todayRecord?.checkIn || todayRecord?.check_in || "--"}
              </span>
            </p>
            <p>
              Check-out:{" "}
              <span className="font-medium text-gray-900">
                {todayRecord?.checkOut || todayRecord?.check_out || "--"}
              </span>
            </p>
            <p>
              Trạng thái:{" "}
              <span className="font-medium text-gray-900">
                {todayRecord?.status || "Chưa ghi nhận"}
              </span>
            </p>
          </div>

          <div className="mt-5 grid gap-3">
            <Button
              onClick={handleCheckIn}
              disabled={hasCheckedIn || isSubmitting}
              isLoading={isSubmitting && !hasCheckedIn}
            >
              <LogIn className="mr-2 h-4 w-4" />
              Check-in
            </Button>
            <Button
              variant="outline"
              onClick={handleCheckOut}
              disabled={!hasCheckedIn || hasCheckedOut || isSubmitting}
              isLoading={isSubmitting && hasCheckedIn}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Check-out
            </Button>
          </div>
        </div>

        <div className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Clock3 className="h-5 w-5 text-coffee-700" />
              <h2 className="text-lg font-semibold text-gray-900">Lịch sử điểm danh</h2>
            </div>
            <Input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="max-w-[220px]"
            />
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Ngày
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Check-in
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Check-out
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : paginatedRecords.length > 0 ? (
                  paginatedRecords.map((item) => {
                    const rowId =
                      item.id ||
                      `${item.employeeId || "me"}-${item.date || item.attendanceDate}`;
                    return (
                      <tr key={rowId}>
                        <td className="px-4 py-3 text-gray-900">
                          {getAttendanceDisplayDate(item)}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.checkIn || item.check_in || "--"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.checkOut || item.check_out || "--"}
                        </td>
                        <td className="px-4 py-3 text-gray-700">
                          {item.status || "--"}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-10 text-center text-gray-500">
                      Chưa có dữ liệu điểm danh
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {!isLoading && Math.ceil(records.length / itemsPerPage) > 1 && (
            <div className="mt-4 border-t border-gray-100 pt-4">
              <Pagination
                currentPage={currentPage}
                totalPages={Math.ceil(records.length / itemsPerPage)}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeAttendancePage;
