'use client';

import { useState, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Search, Edit, Trash2, X, Download, CheckCircle, Calendar, User, Book, Upload, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Pagination from '@/components/Pagination';
import { DatePicker, DatePickerProps } from 'antd';

interface Homework {
  id: number;
  title: string;
  description: string;
  due_date: string;
  status: string;
  total_marks: number;
  obtained_marks: number | null;
  teacher_feedback: string | null;
  student: { id: number; name: string };
  subject: { id: number; name: string };
  file_name?: string | null;
  file_url?: string | null;
  student_file_name?: string | null;
  student_file_url?: string | null;
  is_late: boolean;
}

interface HomeworkResponse {
  success: boolean;
  data: {
    homework: Homework[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}

interface HomeworkFormData {
  title: string;
  description: string;
  student_id: number;
  subject_id: number;
  due_date: string;
  total_marks: number;
}

interface GradeFormData {
  obtained_marks: number;
  teacher_feedback?: string;
}

const extractUniqueStudentsAndSubjects = (homework: Homework[]) => {
  const studentsMap = new Map<number, string>();
  const subjectsMap = new Map<number, string>();

  homework.forEach(hw => {
    studentsMap.set(hw.student.id, hw.student.name);
    subjectsMap.set(hw.subject.id, hw.subject.name);
  });

  const students = Array.from(studentsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const subjects = Array.from(subjectsMap.entries())
    .map(([id, name]) => ({ id, name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { students, subjects };
};


export default function HomeworkPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState<number>(1);
  const [per_page, setPerPage] = useState(5);
  const [dateFilter, setDateFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [gradingId, setGradingId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [homeworkToDelete, setHomeworkToDelete] = useState<Homework | null>(null);

  const deleteHomework=(hw:Homework)=>{
    setHomeworkToDelete(hw);
    setIsModalDeleteOpen(true);

  }

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<HomeworkFormData>();
  const { register: registerGrade, handleSubmit: handleSubmitGrade, reset: resetGrade, setValue: setValueGrade } = useForm<GradeFormData>();

  // Fetch homework
  const { data: homeworkData, isLoading: homeworkLoading } = useQuery<HomeworkResponse>({
    queryKey: ['teacher-homework', page, per_page, statusFilter, searchTerm, dateFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("per_page", per_page.toString());
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      if (dateFilter) params.append('date', dateFilter);
      const response = await axiosInstance.get(`/teacher/homework?${params.toString()}`);
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  const homework = useMemo(() => {
    return (homeworkData?.data?.homework || []).sort((a, b) => 
      new Date(b.due_date).getTime() - new Date(a.due_date).getTime()
    );
  }, [homeworkData]);

  const { students, subjects } = useMemo(() => {
    return extractUniqueStudentsAndSubjects(homework);
  }, [homework]);


  const mutation = useMutation({
    mutationFn: async (formData: HomeworkFormData) => {
      const data = new FormData();
      data.append('title', formData.title);
      data.append('description', formData.description || '');
      data.append('student_id', formData.student_id.toString());
      data.append('subject_id', formData.subject_id.toString());
      data.append('due_date', formData.due_date);
      data.append('total_marks', formData.total_marks.toString());

      // نضيف الملف من الـ state المستقل
      if (selectedFile) {
        data.append('file', selectedFile);
      }

      if (editingId) {
        return axiosInstance.post(`/teacher/homework/${editingId}`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        return axiosInstance.post(`/teacher/homework`, data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-homework'] });
      closeModal();
      toast.success(editingId ? 'تم تعديل الواجب بنجاح' : 'تم إنشاء الواجب بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء حفظ الواجب');
    }
  });

  const gradeMutation = useMutation({
    mutationFn: async (gradeData: GradeFormData) => {
      return axiosInstance.post(`/teacher/homework/${gradingId}/grade`, gradeData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-homework'] });
      setIsGradeModalOpen(false);
      setGradingId(null);
      toast.success('تم تصحيح الواجب بنجاح');
      resetGrade();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return axiosInstance.delete(`/teacher/homework/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teacher-homework'] });
      toast.success('تم حذف الواجب بنجاح');
    }
  });

  const onChange: DatePickerProps['onChange'] = (_, dateString) => {
    setDateFilter(typeof dateString === 'string' ? dateString : null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setSelectedFile(null);
    setSelectedFileName(null);
    reset();
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleEdit = (hw: Homework) => {
    setEditingId(hw.id);
    setValue('title', hw.title);
    setValue('description', hw.description || '');
    setValue('due_date', hw.due_date);
    setValue('student_id', hw.student.id);
    setValue('subject_id', hw.subject.id);
    setValue('total_marks', hw.total_marks);
    setSelectedFileName(hw.file_name || null);
    setSelectedFile(null); // لا نرفع ملف تلقائيًا عند التعديل
    setIsModalOpen(true);
  };

  const handleGrade = (hw: Homework) => {
    setGradingId(hw.id);
    setValueGrade('obtained_marks', hw.obtained_marks || 0);
    setValueGrade('teacher_feedback', hw.teacher_feedback || '');
    setIsGradeModalOpen(true);
  };

  const getStatusColor = (status: string, isLate: boolean) => {
    if (status === 'pending' && isLate) return { badge: 'bg-red-100 text-red-700', dot: 'bg-red-500', label: 'متأخر' };
    switch (status) {
      case 'pending': return { badge: 'bg-yellow-100 text-yellow-700', dot: 'bg-yellow-500', label: 'معلق' };
      case 'submitted': return { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500', label: 'مُسلّم' };
      case 'graded': return { badge: 'bg-green-100 text-green-700', dot: 'bg-green-500', label: 'مُصحح' };
      default: return { badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-500', label: status };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">الواجبات المنزلية</h1>
          <p className="text-gray-600 mt-2">إدارة وتصحيح واجبات الطلاب بكل سهولة</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            reset();
            setSelectedFile(null);
            setSelectedFileName(null);
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition shadow-lg"
        >
          <Plus className="w-5 h-5" />
          واجب جديد
        </button>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">

      {/* Status Filter */}
      <div className="flex flex-wrap flex-col w-full items-stretch gap-3">
        <label htmlFor="status" className="text-gray-600 font-semibold whitespace-nowrap">
          حالة الواجب:
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 w-full md:w-auto"
        >
          <option value="all">الكل</option>
          <option value="pending">معلّق</option>
          <option value="submitted">مُسلَّم</option>
          <option value="graded">مُصحَّح</option>
          <option value="late">متأخر</option>
        </select>
      </div>

      {/* Search */}
      <div className="flex flex-col w-full items-stretch gap-3">
        <label htmlFor="search" className="text-gray-600 font-semibold whitespace-nowrap">
          بحث:
        </label>
        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="ابحث بعنوان الواجب..."
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-600 w-full"
        />
      </div>

      {/* تاريخ التسليم */}
      <div className='flex flex-col w-full items-stretch gap-3'>
        <label htmlFor="date" className="text-gray-600 font-semibold whitespace-nowrap">
          تاريخ التسليم:
        </label>
        <DatePicker onChange={onChange} placeholder='تاريخ التسليم' />
      </div>
    </div>


      {/* Homework List */}
      <div className="space-y-6 mb-8">
        {homework.length === 0 && !homeworkLoading ? (
          <div className="bg-white rounded-xl shadow-sm p-16 text-center">
            <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-6" />
            <p className="text-gray-600 text-xl font-semibold">لا توجد واجبات</p>
            <p className="text-gray-500 mt-2">ابدأ بإنشاء واجب جديد</p>
          </div>
        ) : (
          homework.map((hw) => {
            const status = getStatusColor(hw.status, hw.is_late);
            const hasStudentSubmission = !!hw.student_file_name;

            return (
              <div key={hw.id} className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                      <div className="flex items-start gap-4">
                        <div className={`w-4 h-4 rounded-full ${status.dot} mt-2 flex-shrink-0`}></div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900">{hw.title}</h3>
                          <p className="text-gray-600 mt-2 leading-relaxed">{hw.description || 'لا يوجد وصف'}</p>
                          
                          <div className="flex flex-wrap gap-4 mt-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <User className="w-4 h-4" />
                              <span className="font-medium">{hw.student.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                              <Book className="w-4 h-4" />
                              <span className="font-medium">{hw.subject.name}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          تاريخ التسليم
                        </p>
                        <p className="font-bold text-lg mt-1">
                          {new Date(hw.due_date).toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        {hw.is_late && hw.status === 'pending' && (
                          <span className="text-red-600 text-sm font-medium block mt-1">متأخر عن الموعد</span>
                        )}
                      </div>

                      <div>
                        <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${status.badge}`}>
                          {status.label}
                        </span>
                        {hasStudentSubmission && hw.status !== 'graded' && (
                          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 ml-2">
                            تم التسليم
                          </span>
                        )}
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">الدرجة الكلية</p>
                        <p className="text-2xl font-bold">{hw.total_marks}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {hw.obtained_marks !== null && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 text-center border border-green-200">
                          <p className="text-sm text-green-700 font-medium">الدرجة المحصلة</p>
                          <p className="text-3xl font-bold text-green-700 mt-1">
                            {hw.obtained_marks} <span className="text-xl">/ {hw.total_marks}</span>
                          </p>
                          {hw.teacher_feedback && (
                            <p className="text-xs text-gray-600 mt-2 italic">"{hw.teacher_feedback}"</p>
                          )}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleEdit(hw)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          تعديل
                        </button>
                        <button
                          onClick={() => deleteHomework(hw)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                          حذف
                        </button>
                      </div>

                      {hasStudentSubmission && hw.status !== 'graded' && (
                        <button
                          onClick={() => handleGrade(hw)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                        >
                          <CheckCircle className="w-5 h-5" />
                          تصحيح الواجب
                        </button>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {hw.file_name && (
                          <a
                            href={`${hw.file_url}`}
                            download
                            target='_blank'
                            className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm"
                          >
                            <Download className="w-4 h-4" />
                            ملف الواجب
                          </a>
                        )}
                        {hw.student_file_name && (
                          <a
                            href={`${hw.student_file_url}`}
                            download
                            target='_blank'
                            className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition text-sm"
                          >
                            <Download className="w-4 h-4" />
                            تسليم الطالب
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* modal delete work */}
                
                {isModalDeleteOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl max-w-xl w-full max-h-[95vh] overflow-y-auto">
                      <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-900">حذف الواجب</h2>
                        <button onClick={() => setIsModalDeleteOpen(false)} className="text-gray-500 hover:text-gray-700">
                          <X className="w-8 h-8" />
                        </button>
                      </div>
                      <div className="p-6 space-y-7">
                        <p className="text-lg text-gray-700">هل تريد حذف {homeworkToDelete?.title}</p>

                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => setIsModalDeleteOpen(false)}
                            className="w-16 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl font-bold text-md transition"
                          >
                            لا
                          </button>
                          <button
                            onClick={() => deleteHomework(hw)}
                            className="w-24 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-bold text-md transition"
                          >
                            نعم
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

        {
          homeworkLoading && (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-600">جاري تحميل الواجبات...</p>
              </div>
            </div>
          )
        }

      {
        homeworkData && (
          <Pagination
            currentPage={page}
            lastPage={homeworkData?.data?.last_page || 1}
            total={homeworkData?.data?.total || 0}
            onPageChange={(page: number) => setPage(page)}
          />
        )
      }

      {/* مودال إنشاء/تعديل الواجب مع رفع الملف شغال 100% */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[95vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingId ? 'تعديل الواجب' : 'إنشاء واجب جديد'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X className="w-8 h-8" />
              </button>
            </div>

            <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-7">
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">عنوان الواجب</label>
                <input
                  type="text"
                  {...register('title', { required: 'العنوان مطلوب' })}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: حل التمارين من الصفحة 50"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-2">الوصف (اختياري)</label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="اكتب تعليمات الواجب هنا..."
                />
              </div>

              {/* رفع الملف - شغال 100% */}
              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-3">ملف الواجب (اختياري)</label>
                <div className="relative">
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    id="homework-file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setSelectedFileName(file.name);
                      } else {
                        setSelectedFile(null);
                        setSelectedFileName(null);
                      }
                    }}
                  />
                  <label
                    htmlFor="homework-file"
                    className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                      selectedFile ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-500 hover:bg-blue-50'
                    }`}
                  >
                    <Upload className={`w-16 h-16 mb-4 ${selectedFile ? 'text-green-600' : 'text-gray-400'}`} />
                    <p className={`text-lg font-medium text-center px-6 ${selectedFile ? 'text-green-700' : 'text-gray-700'}`}>
                      {selectedFile 
                        ? `تم اختيار: ${selectedFile.name}` 
                        : 'انقر هنا أو اسحب الملف لرفعه'
                      }
                    </p>
                    <p className="text-sm text-gray-500 mt-3">PDF, Word, صور, ZIP (حتى 20 ميجا)</p>
                    {selectedFile && (
                      <p className="mt-4 text-sm text-green-600 font-medium">✓ جاهز للإرسال</p>
                    )}
                  </label>
                </div>

                {/* الملف الحالي عند التعديل */}
                {editingId && selectedFileName && !selectedFile && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
                    <FileText className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">الملف الحالي: {selectedFileName}</p>
                      <p className="text-sm text-blue-700">سيبقى كما هو إذا لم ترفع ملفاً جديداً</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">الطالب</label>
                  <select
                    {...register('student_id', { required: 'اختر طالب', valueAsNumber: true })}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الطالب</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.student_id && <p className="text-red-500 text-sm mt-1">الطالب مطلوب</p>}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">المادة</label>
                  <select
                    {...register('subject_id', { required: 'اختر مادة', valueAsNumber: true })}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر المادة</option>
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  {errors.subject_id && <p className="text-red-500 text-sm mt-1">المادة مطلوبة</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">تاريخ التسليم</label>
                  <input
                    type="date"
                    {...register('due_date', { required: 'التاريخ مطلوب' })}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.due_date && <p className="text-red-500 text-sm mt-1">التاريخ مطلوب</p>}
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-800 mb-2">الدرجة الكلية</label>
                  <input
                    type="number"
                    min="1"
                    {...register('total_marks', { required: 'الدرجة مطلوبة', valueAsNumber: true })}
                    className="w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: 100"
                  />
                  {errors.total_marks && <p className="text-red-500 text-sm mt-1">أدخل درجة صحيحة</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white py-2 rounded-xl font-bold text-md transition flex items-center justify-center gap-3"
                >
                  {mutation.isPending ? 'جاري الحفظ...' : (editingId ? 'حفظ التعديلات' : 'إنشاء الواجب')}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 rounded-xl font-bold text-md transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* مودال التصحيح */}
      {isGradeModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold">تصحيح الواجب</h2>
              <button onClick={() => { setIsGradeModalOpen(false); resetGrade(); }} className="text-gray-500 hover:text-gray-700">
                <X className="w-7 h-7" />
              </button>
            </div>

            <form onSubmit={handleSubmitGrade((data) => gradeMutation.mutate(data))} className="p-6 space-y-6">
              <div>
                <label className="block text-lg font-semibold mb-2">الدرجة المحصلة</label>
                <input
                  type="number"
                  min="0"
                  max={homework.find(h => h.id === gradingId)?.total_marks || 100}
                  {...registerGrade('obtained_marks', { required: true, valueAsNumber: true })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                />
              </div>

              <div>
                <label className="block text-lg font-semibold mb-2">تعليق المعلم (اختياري)</label>
                <textarea
                  {...registerGrade('teacher_feedback')}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                  placeholder="اكتب ملاحظاتك هنا..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={gradeMutation.isPending}
                  className="flex bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-xl font-bold text-md transition"
                >
                  {gradeMutation.isPending ? 'جاري...' : 'حفظ التصحيح'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsGradeModalOpen(false); resetGrade(); }}
                  className="flex bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-xl font-bold text-md transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}