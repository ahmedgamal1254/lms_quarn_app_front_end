import dayjs from "dayjs";

export default function SessionAttendance({ sessionData }: any) {
  const checkins = sessionData.checkins || [];

  return (
    <div className="space-y-6">

      {/* Session Info */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {sessionData.title}
        </h3>

        <div className="mt-2 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <span className="font-medium">المدرس:</span>{" "}
            {sessionData.teacher_name}
          </div>
          <div>
            <span className="font-medium">الطالب:</span>{" "}
            {sessionData.student_name}
          </div>
          <div>
            <span className="font-medium">المادة:</span>{" "}
            {sessionData.subject_name}
          </div>
          <div>
            <span className="font-medium">موعد الحصة:</span>{" "}
            {sessionData.session_date}
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                الاسم
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                النوع
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                وقت الدخول
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                الحالة
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200 bg-white">
            {checkins.length ? (
              checkins.map((checkin: any) => (
                <tr key={checkin.id}>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {checkin.attendable?.name ?? "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium
                        ${
                          checkin.role === "teacher"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                        }`}
                    >
                      {checkin.role === "teacher" ? "مدرس" : "طالب"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {dayjs(checkin.checked_in_at).format(
                      "YYYY-MM-DD hh:mm A"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      حضر
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="4"
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  لا يوجد حضور مسجل
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
