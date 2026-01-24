"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  X,
  Calendar,
  Clock,
  Loader,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from 'next-intl';
import dayjs from "dayjs";
import "dayjs/locale/ar";
import { timeToUTC } from "@/utils/date";

interface Student {
  id: number;
  name: string;
}

interface Teacher {
  id: number;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

interface StudentDetails {
  id: number;
  name: string;
  email: string;
  phone: string;
  active_subscription: {
    id: number;
    plan_id: number;
    sessions_remaining: number;
    sessions_used: number;
    total_sessions: number;
    start_date: string;
    end_date: string;
  } | null;
  plan_name: string;
  remaining_sessions: number;
}

interface SingleSessionForm {
  student_id: string;
  teacher_id: string;
  subject_id: string;
  title: string;
  description: string;
  session_date: string;
  start_time: string;
  end_time: string;
  meeting_link: string;
  notes: string;
}

interface BulkSessionForm {
  monthYear: string;
  weekDays: { day: string; time: string; selected: boolean }[];
  teacher_id: string;
  subject_id: string;
  student_id: string;
  start_time: string;
}

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "single" | "bulk";
  students: Student[];
  teachers: Teacher[];
  onSubmit: (data: any, mode: "single" | "bulk") => void;
  isSubmitting: boolean;
  axiosInstance: any;
}


const addMinutes = (time: string, minutes: number): string => {
  const [hours, mins] = time.split(":").map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60) % 24;
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, "0")}:${String(newMins).padStart(2, "0")}`;
};

export default function SessionModal({
  isOpen,
  onClose,
  mode,
  students,
  teachers,
  onSubmit,
  isSubmitting,
  axiosInstance,
}: SessionModalProps) {
  const t = useTranslations('SessionModal');
  dayjs.locale("ar");
  
  const weekDays = [
    { value: 'monday', label: t('monday') },
    { value: 'tuesday', label: t('tuesday') },
    { value: 'wednesday', label: t('wednesday') },
    { value: 'thursday', label: t('thursday') },
    { value: 'friday', label: t('friday') },
    { value: 'saturday', label: t('saturday') },
    { value: 'sunday', label: t('sunday') }
  ];

  const [singleForm, setSingleForm] = useState<SingleSessionForm>({
    student_id: "",
    teacher_id: "",
    subject_id: "",
    title: "",
    description: "",
    session_date: "",
    start_time: "",
    end_time: "",
    meeting_link: "",
    notes: "",
  });

  const [bulkForm, setBulkForm] = useState<BulkSessionForm>({
    monthYear: "",
    weekDays: weekDays.map(d => ({ day: d.label, time: '10:00', selected: false })),
    teacher_id: "",
    subject_id: "",
    student_id: "",
    start_time: "10:00",
  });

  const [showPreview, setShowPreview] = useState(false);
  const [previewSchedule, setPreviewSchedule] = useState<any[]>([]);

  const currentForm = mode === "single" ? singleForm : bulkForm;
  const selectedStudentId = currentForm.student_id;
  const selectedTeacherId = currentForm.teacher_id;

  // Fetch student details
  const { data: studentData, isLoading: isLoadingStudent } = useQuery({
    queryKey: ["student-details", selectedStudentId],
    queryFn: async () => {
      if (!selectedStudentId) return null;
      const response = await axiosInstance.get(
        `/students/${selectedStudentId}`,
      );
      return response.data.data as StudentDetails;
    },
    enabled: !!selectedStudentId && isOpen,
  });

  // Fetch teacher subjects
  const { data: teacherSubjectsData, isLoading: isLoadingSubjects } = useQuery({
    queryKey: ["teacher-subjects", selectedTeacherId],
    queryFn: async () => {
      if (!selectedTeacherId) return null;
      const response = await axiosInstance.get(
        `/subjects/teacher/${selectedTeacherId}`,
      );
      return response.data.data;
    },
    enabled: !!selectedTeacherId && isOpen,
  });

  const teacherSubjects = teacherSubjectsData?.subjects || [];

  // Reset subject when teacher changes handled in form change handlers

  const handleSingleFormChange = (
    field: keyof SingleSessionForm,
    value: string,
  ) => {
    setSingleForm((prev) => {
      const updates: any = { [field]: value };
      if (field === "teacher_id") {
        updates.subject_id = "";
      }
      return { ...prev, ...updates };
    });
  };

  const handleBulkFormChange = (field: keyof BulkSessionForm, value: any) => {
    setBulkForm((prev) => {
      const updates: any = { [field]: value };
      if (field === "teacher_id") {
        updates.subject_id = "";
      }
      return { ...prev, ...updates };
    });
  };

  const generateBulkPreview = () => {
    if (
      !bulkForm.monthYear ||
      !bulkForm.student_id ||
      !bulkForm.teacher_id ||
      !bulkForm.subject_id
    ) {
      toast.error(t('fill_all_required'));
      return;
    }

    const selectedDays = bulkForm.weekDays.filter((d) => d.selected);
    if (selectedDays.length === 0) {
      toast.error(t('select_at_least_one_day'));
      return;
    }

    // Check remaining sessions
    if (studentData?.active_subscription) {
      const remainingSessions =
        studentData.active_subscription.sessions_remaining;
      const [year, month] = bulkForm.monthYear.split("-");
      const daysInMonth = new Date(
        parseInt(year),
        parseInt(month),
        0,
      ).getDate();
      const dayMap: { [key: string]: number } = {
        [t('sunday')]: 0,
        [t('monday')]: 1,
        [t('tuesday')]: 2,
        [t('wednesday')]: 3,
        [t('thursday')]: 4,
        [t('friday')]: 5,
        [t('saturday')]: 6,
      };

      let estimatedSessions = 0;
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(parseInt(year), parseInt(month) - 1, day);
        const dayOfWeek = date.getDay();
        if (selectedDays.some((d) => dayMap[d.day] === dayOfWeek)) {
          estimatedSessions++;
        }
      }

      if (estimatedSessions > remainingSessions) {
        toast.error(`${t('add_count_sessions').replace('{count}', estimatedSessions.toString())} > ${t('remaining_sessions')} (${remainingSessions})`);
        return;
      }
    }

    const [year, month] = bulkForm.monthYear.split("-");
    const daysInMonth = new Date(parseInt(year), parseInt(month), 0).getDate();
    const dayMap: { [key: string]: number } = {
      [t('sunday')]: 0,
      [t('monday')]: 1,
      [t('tuesday')]: 2,
      [t('wednesday')]: 3,
      [t('thursday')]: 4,
      [t('friday')]: 5,
      [t('saturday')]: 6,
    };

    const preview: any[] = [];
    const selectedStudent = students.find(
      (s) => s.id === parseInt(bulkForm.student_id),
    );
    const selectedTeacher = teachers.find(
      (t) => t.id === parseInt(bulkForm.teacher_id),
    );
    const selectedSubject = teacherSubjects.find(
      (s: Subject) => s.id === parseInt(bulkForm.subject_id),
    );

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(parseInt(year), parseInt(month) - 1, day);
      const dayOfWeek = date.getDay();

      const selectedDay = selectedDays.find((d) => dayMap[d.day] === dayOfWeek);

      if (selectedDay) {
        const dateStr = date.toISOString().split("T")[0];
        const endTime = addMinutes(selectedDay.time, 60);

        preview.push({
          id: 0,
          title: `${t('add_session')} - ${selectedDay.day}`,
          session_date: dateStr,
          start_time: selectedDay.time,
          end_time: endTime,
          duration_minutes: 60,
          status: "scheduled",
          meeting_link: null,
          student_name: selectedStudent?.name || "",
          teacher_name: selectedTeacher?.name || "",
          subject_name: selectedSubject?.name || "",
        });
      }
    }

    setPreviewSchedule(preview);
    setShowPreview(true);
  };

  const handleSubmitSingle = () => {
    if (
      !singleForm.student_id ||
      !singleForm.teacher_id ||
      !singleForm.subject_id ||
      !singleForm.title ||
      !singleForm.session_date ||
      !singleForm.start_time ||
      !singleForm.end_time
    ) {
      toast.error(t('fill_all_required'));
      return;
    }

    // Check remaining sessions
    if (studentData?.active_subscription) {
      if (studentData.active_subscription.sessions_remaining <= 0) {
        toast.error(t('no_remaining_sessions'));
        return;
      }
    } else {
      toast.error(t('student_no_subscription'));
      return;
    }

    onSubmit(
      {
        student_id: parseInt(singleForm.student_id),
        teacher_id: parseInt(singleForm.teacher_id),
        subject_id: parseInt(singleForm.subject_id),
        title: singleForm.title,
        description: singleForm.description,
        session_date: singleForm.session_date,
        start_time: timeToUTC(singleForm.start_time, singleForm.session_date),
        end_time: timeToUTC(singleForm.end_time, singleForm.session_date),
        meeting_link: singleForm.meeting_link,
        notes: singleForm.notes,
      },
      "single",
    );
  };

  const handleSubmitBulk = () => {
    if (previewSchedule.length === 0) {
      toast.error(t('preview_first'));
      return;
    }

    const sessionsData = previewSchedule.map((session) => ({
      student_id: parseInt(bulkForm.student_id),
      teacher_id: parseInt(bulkForm.teacher_id),
      subject_id: parseInt(bulkForm.subject_id),
      title: session.title,
      session_date: session.session_date,
      start_time: timeToUTC(session.start_time, session.session_date),
      end_time: timeToUTC(session.end_time, session.session_date),
    }));

    const subscriptionId = studentData?.active_subscription?.id;
    if (!subscriptionId) {
      toast.error(t('no_active_sub'));
      return;
    }

    onSubmit(
      {
        subscription_id: subscriptionId,
        sessions: sessionsData,
      },
      "bulk",
    );
  };

  const handleClose = () => {
    setSingleForm({
      student_id: "",
      teacher_id: "",
      subject_id: "",
      title: "",
      description: "",
      session_date: "",
      start_time: "",
      end_time: "",
      meeting_link: "",
      notes: "",
    });
    setBulkForm({
      monthYear: "",
      weekDays: weekDays.map(d => ({ day: d.label, time: '10:00', selected: false })),
      teacher_id: "",
      subject_id: "",
      student_id: "",
      start_time: "10:00",
    });
    setShowPreview(false);
    setPreviewSchedule([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'single' ? t('add_single_session') : t('add_multi_sessions')}
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {mode === "single" ? (
            // Single Session Form
            <div className="space-y-5">
              {/* Student Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('student')} *
                </label>
                <select
                  value={singleForm.student_id}
                  onChange={(e) =>
                    handleSingleFormChange("student_id", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">{t('select_student')}</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Info Card */}
              {isLoadingStudent && singleForm.student_id && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <Loader className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm text-blue-700">
                    {t('loading_student_data')}
                  </span>
                </div>
              )}

              {studentData && singleForm.student_id && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <h3 className="font-semibold text-gray-900">
                        {t('student_info')}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-600">{t('plan')}: </span>
                          <span className="font-medium text-gray-900">
                            {studentData.plan_name || t('not_available')}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">
                            {t('remaining_sessions')}:{" "}
                          </span>
                          <span
                            className={`font-bold ${studentData.remaining_sessions > 5 ? "text-green-600" : "text-red-600"}`}
                          >
                            {studentData.active_subscription
                              ?.sessions_remaining || 0}
                          </span>
                          <span className="text-gray-500">
                            {" "}
                            /{" "}
                            {studentData.active_subscription?.total_sessions ||
                              0}
                          </span>
                        </div>
                        {studentData.active_subscription && (
                          <div className="grid grid-cols-1 md:grid-cols-2">
                            <div>
                              <span className="text-gray-600">
                                {t('start_date')}:{" "}
                              </span>
                              <span className="font-medium text-gray-900">
                                {dayjs(
                                  studentData.active_subscription.start_date,
                                ).format("DD MMMM YYYY")}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                {t('end_date')}:{" "}
                              </span>
                              <span className="font-medium text-gray-900">
                                {dayjs(
                                  studentData.active_subscription.end_date,
                                ).format("DD MMMM YYYY")}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                      {(!studentData.active_subscription ||
                        studentData.remaining_sessions <= 0) && (
                        <div className="mt-2 bg-red-100 border border-red-300 rounded px-3 py-2 text-sm text-red-700">
                          ⚠️{" "}
                          {!studentData.active_subscription
                            ? t('student_no_subscription')
                            : t('no_remaining_sessions')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                {/* Teacher Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('teacher')} *
                  </label>
                  <select
                    value={singleForm.teacher_id}
                    onChange={(e) =>
                      handleSingleFormChange("teacher_id", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('select_teacher')}</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Subject Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subject')} *
                  </label>
                  <select
                    value={singleForm.subject_id}
                    onChange={(e) =>
                      handleSingleFormChange("subject_id", e.target.value)
                    }
                    disabled={!singleForm.teacher_id || isLoadingSubjects}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {!singleForm.teacher_id ? t('teacher_first') : isLoadingSubjects ? t('loading') : t('select_subject')}
                    </option>
                    {teacherSubjects.map((subject: Subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('title')} *
                  </label>
                  <input
                    type="text"
                    value={singleForm.title}
                    onChange={(e) =>
                      handleSingleFormChange("title", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('title_placeholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('session_date')} *
                  </label>
                  <input
                    type="date"
                    value={singleForm.session_date}
                    onChange={(e) =>
                      handleSingleFormChange("session_date", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')}
                </label>
                <textarea
                  value={singleForm.description}
                  onChange={(e) =>
                    handleSingleFormChange("description", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder={t('description_placeholder')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('start_time')} *
                  </label>
                  <input
                    type="time"
                    value={singleForm.start_time}
                    onChange={(e) =>
                      handleSingleFormChange("start_time", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('end_time')} *
                  </label>
                  <input
                    type="time"
                    value={singleForm.end_time}
                    onChange={(e) =>
                      handleSingleFormChange("end_time", e.target.value)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('meeting_link')}
                </label>
                <input
                  type="url"
                  value={singleForm.meeting_link}
                  onChange={(e) =>
                    handleSingleFormChange("meeting_link", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://zoom.us/..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('notes')}
                </label>
                <textarea
                  value={singleForm.notes}
                  onChange={(e) =>
                    handleSingleFormChange("notes", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={2}
                  placeholder={t('notes_placeholder')}
                />
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  {t('cancel')}
                </button>
                <button
                  onClick={handleSubmitSingle}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? t('loading') : t('add')}
                </button>
              </div>
            </div>
          ) : (
            // Bulk Sessions Form
            <div className="space-y-5">
              {!showPreview ? (
                <>
                  {/* Student Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('student')} *
                    </label>
                    <select
                      value={bulkForm.student_id}
                      onChange={(e) =>
                        handleBulkFormChange("student_id", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">{t('select_student')}</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Student Info Card */}
                  {isLoadingStudent && bulkForm.student_id && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 flex items-center gap-3">
                      <Loader className="w-5 h-5 animate-spin text-indigo-600" />
                      <span className="text-sm text-indigo-700">
                        {t('loading_student_data')}
                      </span>
                    </div>
                  )}

                  {studentData && bulkForm.student_id && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Info className="w-5 h-5 text-indigo-600 mt-0.5" />
                        <div className="flex-1 space-y-2">
                          <h3 className="font-semibold text-gray-900">
                            {t('student_info')}
                          </h3>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <span className="text-gray-600">{t('plan')}: </span>
                              <span className="font-medium text-gray-900">
                                {studentData.plan_name || t('not_available')}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">
                                {t('remaining_sessions')}:{" "}
                              </span>
                              <span
                                className={`font-bold ${studentData.remaining_sessions > 5 ? "text-green-600" : "text-red-600"}`}
                              >
                                {studentData.active_subscription
                                  ?.sessions_remaining || 0}
                              </span>
                              <span className="text-gray-500">
                                {" "}
                                /{" "}
                                {studentData.active_subscription
                                  ?.total_sessions || 0}
                              </span>
                            </div>
                            {studentData.active_subscription && (
                              <>
                                <div>
                                  <span className="text-gray-600">
                                    {t('start_date')}:{" "}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {studentData.active_subscription.start_date}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-600">
                                    {t('end_date')}:{" "}
                                  </span>
                                  <span className="font-medium text-gray-900">
                                    {studentData.active_subscription.end_date}
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                          {(!studentData.active_subscription ||
                            studentData.remaining_sessions <= 0) && (
                            <div className="mt-2 bg-red-100 border border-red-300 rounded px-3 py-2 text-sm text-red-700">
                              ⚠️ {!studentData.active_subscription ? t('student_no_subscription') : t('no_remaining_sessions')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Teacher Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('teacher')} *
                      </label>
                      <select
                        value={bulkForm.teacher_id}
                        onChange={(e) =>
                          handleBulkFormChange("teacher_id", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">{t('select_teacher')}</option>
                        {teachers.map((teacher) => (
                          <option key={teacher.id} value={teacher.id}>
                            {teacher.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Subject Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('subject')} *
                      </label>
                      <select
                        value={bulkForm.subject_id}
                        onChange={(e) =>
                          handleBulkFormChange("subject_id", e.target.value)
                        }
                        disabled={!bulkForm.teacher_id || isLoadingSubjects}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!bulkForm.teacher_id ? t('teacher_first') : isLoadingSubjects ? t('loading') : t('select_subject')}
                        </option>
                        {teacherSubjects.map((subject: Subject) => (
                          <option key={subject.id} value={subject.id}>
                            {subject.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('month_year')} *
                      </label>
                      <input
                        type="month"
                        value={bulkForm.monthYear}
                        onChange={(e) =>
                          handleBulkFormChange("monthYear", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      {t('week_days')} *
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {bulkForm.weekDays.map((day, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 border border-gray-300 rounded-lg hover:border-indigo-400 transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={day.selected}
                            onChange={(e) => {
                              const newDays = [...bulkForm.weekDays];
                              newDays[index].selected = e.target.checked;
                              handleBulkFormChange("weekDays", newDays);
                            }}
                            className="w-4 h-4 rounded text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="flex-1 text-sm font-medium text-gray-700">
                            {day.day}
                          </span>
                          <input
                            type="time"
                            value={day.time}
                            onChange={(e) => {
                              const newDays = [...bulkForm.weekDays];
                              newDays[index].time = e.target.value;
                              handleBulkFormChange("weekDays", newDays);
                            }}
                            disabled={!day.selected}
                            className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:bg-gray-100"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleClose}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      {t('cancel')}
                    </button>
                    <button
                      onClick={generateBulkPreview}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                    >
                      {t('preview')}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      {t('sessions_preview').replace('{count}', previewSchedule.length.toString())}
                    </h3>

                    {studentData?.active_subscription && (
                      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                        <span className="text-sm text-gray-700">
                          {t('remaining_after')}: 
                        </span>
                        <span
                          className={`font-bold text-lg ${
                            studentData.active_subscription.sessions_remaining -
                              previewSchedule.length >
                            5
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {studentData.active_subscription.sessions_remaining -
                            previewSchedule.length}
                        </span>
                      </div>
                    )}

                    <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100 sticky top-0">
                          <tr>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">#</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('date')}</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('day')}</th>
                            <th className="px-4 py-3 text-right font-semibold text-gray-700">{t('time')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {previewSchedule.map((session, idx) => (
                            <tr
                              key={idx}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-700">
                                {idx + 1}
                              </td>
                              <td className="px-4 py-3 text-gray-900 font-medium">
                                {session.session_date}
                              </td>
                              <td className="px-4 py-3">
                                <span className="inline-flex px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                  {session.title.replace(`${t('add_session')} - `, '')}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-gray-700 flex items-center gap-1">
                                <Clock size={14} className="text-gray-400" />
                                {session.start_time} - {session.end_time}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                      {t('back_to_edit')}
                    </button>
                    <button
                      onClick={handleSubmitBulk}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          {t('loading')}
                        </>
                      ) : (
                        t('add_count_sessions').replace('{count}', previewSchedule.length.toString())
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
