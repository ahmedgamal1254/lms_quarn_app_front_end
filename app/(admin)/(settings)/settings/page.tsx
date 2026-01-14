'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Edit2, X, Loader, Settings as SettingsIcon, Save } from 'lucide-react';

interface Setting {
  id: number;
  key: string;
  value: any;
  type: 'string' | 'boolean' | 'number' | 'json' | 'image';
  label: string;
  group: string;
  created_at: string;
  updated_at: string;
}

interface SettingsResponse {
  success: boolean;
  data: {
    data: Setting[];
    total: number;
  };
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Setting | null>(null);
  const [form, setForm] = useState({
    value: '',
    width: '',
    height: ''
  });

  /* ================= Fetch ================= */
  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SettingsResponse>(
        '/app-public-settings'
      );
      return data.data.data || [];
    }
  });

  /* ================= Update ================= */
  const updateMutation = useMutation({
    mutationFn: async (payload: any) => {
      const formData = new FormData();
      
      if (payload.value !== '' && payload.value !== null) {
        if (payload.value instanceof File) {
          formData.append('value', payload.value);
        } else {
          formData.append('value', payload.value);
        }
      }
      
      if (payload.width) formData.append('width', payload.width);
      if (payload.height) formData.append('height', payload.height);
      
      formData.append('type', selected!.type);
      formData.append('key', selected!.key);
      formData.append('_method', 'PUT');

      return axiosInstance.post(
        `/app-public-settings/${selected!.id}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        }
      );
    },
    onSuccess: () => {
      toast.success('تم التحديث بنجاح');
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-public-settings'] });
      closeModal();
    },
    onError: (e) => {
      const err = e as AxiosError<any>;
      toast.error(err.response?.data?.message || 'حدث خطأ أثناء التحديث');
    }
  });

  /* ================= Helpers ================= */
  const openEdit = (setting: Setting) => {
    setSelected(setting);
    setForm({
      value: typeof setting.value === 'object' 
        ? JSON.stringify(setting.value, null, 2) 
        : (setting.value || ''),
      width: '',
      height: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setForm({ value: '', width: '', height: '' });
  };

  const handleUpdate = () => {
    if (selected?.type !== 'image' && !form.value.trim()) {
      toast.error('القيمة مطلوبة');
      return;
    }
    updateMutation.mutate(form);
  };

  /* ================= Group Settings ================= */
  const groupedSettings = settings?.reduce((acc: Record<string, Setting[]>, setting) => {
    const group = setting.group || 'other';
    if (!acc[group]) acc[group] = [];
    acc[group].push(setting);
    return acc;
  }, {});

  /* ================= UI ================= */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold">إعدادات التطبيق</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings || {}).map(([group, items]) => (
            <div key={group} className="bg-white rounded-lg shadow">
              <div className="bg-gray-50 px-6 py-4 border-b">
                <h2 className="text-xl font-semibold capitalize">
                  {group === 'general' ? 'عام' : group === 'contact' ? 'التواصل' : group}
                </h2>
              </div>
              <div className="divide-y">
                {items.map((setting) => (
                  <div key={setting.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{setting.label || setting.key}</h3>
                          {/* <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {setting.type}
                          </span> */}
                        </div>
                        {/* <p className="text-sm text-gray-500 mb-2">Key: {setting.key}</p> */}
                        <div className="text-gray-700">
                          {setting.type === 'image' ? (
                            setting.value ? (
                              <img 
                                src={setting.value} 
                                alt={setting.key}
                                className="max-w-xs max-h-32 object-contain border rounded"
                              />
                            ) : (
                              <span className="text-gray-400">لا توجد صورة</span>
                            )
                          ) : typeof setting.value === 'object' ? (
                            <pre className="bg-gray-100 p-2 rounded text-sm overflow-x-auto">
                              {JSON.stringify(setting.value, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-base">
                              {setting.value || <span className="text-gray-400">غير محدد</span>}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openEdit(setting)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 size={16} />
                        تعديل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= Modal ================= */}
      {isModalOpen && selected && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold">تعديل: {selected.label || selected.key}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                {/* <label className="block mb-2 font-semibold">Key</label> */}
                <input
                  type="hidden"
                  value={selected.key}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                {/* <label className="block mb-2 font-semibold">Type</label> */}
                <input
                  type="hidden"
                  value={selected.type}
                  disabled
                  className="w-full border p-2 rounded bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block mb-2 font-semibold">القيمة</label>
                {selected.type === 'image' ? (
                  <div className="space-y-3">
                    {selected.value && (
                      <img 
                        src={selected.value} 
                        alt="Current"
                        className="max-w-full max-h-48 object-contain border rounded"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e: any) => setForm({ ...form, value: e.target.files?.[0] || '' })}
                      className="w-full border p-2 rounded"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-sm">Width (اختياري)</label>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={form.width}
                          onChange={(e) => setForm({ ...form, width: e.target.value })}
                          className="w-full border p-2 rounded"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm">Height (اختياري)</label>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={form.height}
                          onChange={(e) => setForm({ ...form, height: e.target.value })}
                          className="w-full border p-2 rounded"
                        />
                      </div>
                    </div>
                  </div>
                ) : selected.type === 'boolean' ? (
                  <select
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    className="w-full border p-2 rounded"
                  >
                    <option value="true">True</option>
                    <option value="false">False</option>
                  </select>
                ) : (
                  <textarea
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    rows={selected.type === 'json' ? 8 : 4}
                    className="w-full border p-2 rounded font-mono"
                    placeholder={`أدخل ${selected.type === 'json' ? 'JSON' : 'القيمة'}`}
                  />
                )}
              </div>
            </div>

            <div className="p-6 border-t flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="px-6 py-2 border rounded hover:bg-gray-100 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    حفظ التعديلات
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}