import { useQuery } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useAppSettingsStore } from '@/store/appSetting';

export const useAppSettings = () => {
  const setSettings = useAppSettingsStore((state) => state.setSettings);

  return useQuery({
    queryKey: ['app-public-settings'],
    queryFn: async () => {
      const { data } = await axiosInstance.get('/app-settings');
      setSettings(data.data);
      return data.data;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};
