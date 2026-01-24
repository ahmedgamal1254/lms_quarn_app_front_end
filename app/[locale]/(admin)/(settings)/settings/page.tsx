'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import { Edit2, X, Loader, Settings as SettingsIcon, Save } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import TranslatableInput from '@/components/TranslatableInput';
import { Setting } from '@/services/api/types';

interface SettingsResponse {
  data: Setting[];
  links: any;
  meta: any;
}

export default function SettingsPage() {
  const t = useTranslations('AdminSettings');
  const tCommon = useTranslations('Common');
  const routeParams = useParams();
  const isRTL = routeParams.locale === 'ar';
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selected, setSelected] = useState<Setting | null>(null);
  
  // Form state
  // For 'value', if it's string, we use localized strings.
  // If it's boolean/json/image, we might use a single value in UI but send it to both keys.
  // To keep it simple, we store separate localized values for text strings, 
  // and for others we might just use a temporary 'singleValue' or similar logic.
  // Actually, let's store everything in the localized structure to be consistent, but sync them if needed.
  const [form, setForm] = useState({
    value: { ar: '', en: '' },
    label: { ar: '', en: '' },
    description: { ar: '', en: '' },
    width: '',
    height: '',
    // Special handling for non-string types
    singleValue: '' as any, // For boolean, json
    selectedFile: null as File | null
  });

  /* ================= Fetch ================= */
  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get<SettingsResponse>(
        '/app-public-settings'
      );
      return data.data || [];
    }
  });

  /* ================= Update ================= */
  const updateMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      
      // Basic fields
      formData.append('type', selected!.type);
      formData.append('key', selected!.key);
      formData.append('_method', 'PUT');
      if (form.width) formData.append('width', form.width);
      if (form.height) formData.append('height', form.height);

      // Localized fields
      // Label and Description are always localized
      formData.append('ar[label]', form.label.ar);
      formData.append('en[label]', form.label.en);
      formData.append('ar[description]', form.description.ar);
      formData.append('en[description]', form.description.en);

      // Value handling based on type
      if (selected?.type === 'image') {
          if (form.selectedFile) {
              formData.append('ar[value]', form.selectedFile);
              formData.append('en[value]', form.selectedFile);
          }
           // If no file selected, backend preserves existing value (as per my update controller logic)
      } else if (selected?.type === 'boolean') {
          // Send singleValue to both
          formData.append('ar[value]', form.singleValue);
          formData.append('en[value]', form.singleValue);
      } else if (selected?.type === 'json') {
          // Send singleValue to both (assuming config is universal)
          formData.append('ar[value]', form.singleValue);
          formData.append('en[value]', form.singleValue);
      } else {
          // String - fully localized
          formData.append('ar[value]', form.value.ar);
          formData.append('en[value]', form.value.en);
      }

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
      toast.success(t('successUpdate'));
      queryClient.invalidateQueries({ queryKey: ['app-settings'] });
      queryClient.invalidateQueries({ queryKey: ['app-public-settings'] });
      closeModal();
    },
    onError: (e) => {
      const err = e as AxiosError<any>;
      toast.error(err.response?.data?.message || t('errorUpdate'));
    }
  });

  /* ================= Helpers ================= */
  const openEdit = (setting: Setting) => {
    setSelected(setting);
    
    // Populate form
    const currentVal = setting.value; // Helper to get current locale value used for fallback logic if needed
    
    setForm({
      value: {
          ar: setting.translations?.ar?.value || '',
          en: setting.translations?.en?.value || ''
      },
      label: {
          ar: setting.translations?.ar?.label || setting.label || '',
          en: setting.translations?.en?.label || setting.label || ''
      },
      description: {
          ar: setting.translations?.ar?.description || setting.description || '',
          en: setting.translations?.en?.description || setting.description || ''
      },
      width: '',
      height: '',
      // For boolean/json, we pick the 'current' value to show in the single input
      // If translations differ, we might pick one (e.g. current locale's or 'en')
      // For boolean, value is usually '1'/'0' or 'true'/'false'
      singleValue: typeof currentVal === 'object' ? JSON.stringify(currentVal, null, 2) : currentVal,
      selectedFile: null
    });
    
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelected(null);
    setForm({
        value: { ar: '', en: '' },
        label: { ar: '', en: '' },
        description: { ar: '', en: '' },
        width: '',
        height: '',
        singleValue: '',
        selectedFile: null
    });
  };

  const handleUpdate = () => {
    // Validation
    if (selected?.type === 'string') {
        if (!form.value.ar.trim() || !form.value.en.trim()) {
            toast.error(t('valueRequired'));
            return;
        }
    }
    // Logic for other types validation if needed
    updateMutation.mutate();
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
    <div className="p-6 max-w-7xl mx-auto min-h-screen dark:bg-slate-900" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="mb-6 flex items-center gap-3">
        <SettingsIcon className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('title')}</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        <div className="space-y-6 dark:bg-slate-900">
          {Object.entries(groupedSettings || {}).map(([group, items]) => (
            <div key={group} className="bg-slate-800 rounded-lg shadow border dark:border-gray-700">
              <div className="dark:bg-slate-900 bg-white px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold capitalize text-gray-500 dark:text-white">
                  {group === 'general' ? t('general') : group === 'contact' ? t('contact') : group}
                </h2>
              </div>
              <div className="divide-y divide-gray-700">
                {items.map((setting) => (
                  <div key={setting.id} className="p-6 dark:bg-slate-900 bg-white dark:hover:bg-slate-700 hover:bg-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-500 dark:text-white">{setting.label || setting.key}</h3>
                        </div>
                         {/* Display current locale description if available */}
                         {setting.description && (
                             <p className="text-sm text-gray-500 dark:text-white mb-2">{setting.description}</p>
                         )}
                        <div className="text-gray-500 dark:text-white">
                          {setting.type === 'image' ? (
                            setting.value ? (
                              <img 
                                src={setting.value} // This assumes API returns full URL
                                alt={setting.key}
                                className="max-w-xs max-h-32 object-contain border rounded"
                              />
                            ) : (
                              <span className="text-gray-400">{t('noImage')}</span>
                            )
                          ) : typeof setting.value === 'object' ? (
                            <pre className="bg-slate-700 p-2 rounded text-sm overflow-x-auto text-gray-50">
                              {JSON.stringify(setting.value, null, 2)}
                            </pre>
                          ) : (
                            <span className="text-base text-gray-500 dark:text-white">
                              {String(setting.value) || <span className="text-gray-400">{tCommon('unknown')}</span>}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => openEdit(setting)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        <Edit2 size={16} />
                        {tCommon('edit')}
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
          <div className="bg-white dark:bg-slate-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{t('editSetting')}: {selected.label || selected.key}</h2>
              <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
                {/* Translatable Label */}
                <TranslatableInput
                    label={t('label')}
                    value={form.label}
                    onChange={(val) => setForm({ ...form, label: val })}
                    placeholder={{ ar: 'اسم الإعداد', en: 'Setting Label' }}
                />

                {/* Translatable Description */}
                <TranslatableInput
                    label={t('description')}
                    value={form.description}
                    onChange={(val) => setForm({ ...form, description: val })}
                    placeholder={{ ar: 'وصف الإعداد', en: 'Setting Description' }}
                    isTextArea
                />

              <div>
                <label className="block mb-2 font-semibold text-gray-900 dark:text-gray-100">
                    {t('settingValue')} 
                    {selected.type === 'string' && <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">({t('translatable')})</span>}
                </label>
                
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
                      onChange={(e) => setForm({ ...form, selectedFile: e.target.files?.[0] || null })}
                      className="w-full p-2 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">{t('width')}</label>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={form.width}
                          onChange={(e) => setForm({ ...form, width: e.target.value })}
                          className="w-full p-2 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block mb-1 text-sm text-gray-700 dark:text-gray-300">{t('height')}</label>
                        <input
                          type="number"
                          placeholder="Auto"
                          value={form.height}
                          onChange={(e) => setForm({ ...form, height: e.target.value })}
                          className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                ) : selected.type === 'boolean' ? (
                  <select
                    value={form.singleValue}
                    onChange={(e) => setForm({ ...form, singleValue: e.target.value })}
                    className="w-full border dark:border-gray-600 p-2 rounded bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="1">True / Yes</option>
                    <option value="0">False / No</option>
                  </select>
                ) : selected.type === 'json' ? (
                  <textarea
                    value={form.singleValue}
                    onChange={(e) => setForm({ ...form, singleValue: e.target.value })}
                    rows={8}
                    className="w-full border dark:border-gray-600 p-2 rounded font-mono bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder={t('enterJSON')}
                    dir="ltr"
                  />
                ) : (
                  // String type - Translatable
                 <TranslatableInput
                    label={t('value')}
                    value={form.value}
                    onChange={(val) => setForm({ ...form, value: val })}
                    placeholder={{ ar: 'القيمة', en: 'Value' }}
                    isTextArea={selected.type === 'string' && typeof selected.value === 'string' && selected.value.length > 50} // Auto textarea if long?
                 />
                )}
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex justify-end gap-3 sticky bottom-0 bg-white dark:bg-slate-800">
              <button
                onClick={closeModal}
                className="px-6 py-2 border dark:border-gray-600 rounded hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-gray-900 dark:text-gray-100"
              >
                {tCommon('cancel')}
              </button>
              <button
                onClick={handleUpdate}
                disabled={updateMutation.isPending}
                className="px-6 py-2 bg-blue-600 text-white rounded flex items-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {t('saveChanges')}
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