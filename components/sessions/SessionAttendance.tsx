import dayjs from "dayjs";
import { useTranslations } from "next-intl";

export default function SessionAttendance({ sessionData }: any) {
  const t = useTranslations("SessionAttendance");
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
            <span className="font-medium">{t('teacher')}:</span>{" "}
            {sessionData.teacher_name}
          </div>
          <div>
            <span className="font-medium">{t('student')}:</span>{" "}
            {sessionData.student_name}
          </div>
          <div>
            <span className="font-medium">{t('subject')}:</span>{" "}
            {sessionData.subject_name}
          </div>
          <div>
            <span className="font-medium">{t('session_date')}:</span>{" "}
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
                {t('name')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                {t('type')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                {t('check_in_time')}
              </th>
              <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                {t('status')}
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
                      {checkin.role === "teacher" ? t('role_teacher') : t('role_student')}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-sm text-gray-700">
                    {dayjs(checkin.checked_in_at).format(
                      "YYYY-MM-DD hh:mm A"
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
                      {t('attended')}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-sm text-gray-500"
                >
                  {t('no_attendance')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
