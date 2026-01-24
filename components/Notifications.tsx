"use client";

import { useTranslations, useLocale } from "next-intl";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Bell, CheckCheck } from "lucide-react";
import { utcToLocalDateTime } from "@/utils/date";
import Link from "next/link";
import { notificationRoute } from "@/utils/notifications";
import { useState } from "react";
import { Badge, Space } from "antd";
import toast from "react-hot-toast";

// ================= API CALLS =================
const fetchNotifications = async () => {
  const { data } = await axiosInstance.get("/notifications");
  return data;
};

const markAsRead = async (id: number) => {
  return axiosInstance.put(`/notifications/${id}/read`);
};

const markAllAsRead = async () => {
  return axiosInstance.post("/notifications/make-all-read");
};

// ================= COMPONENT =================
export default function Notifications() {
    const t = useTranslations("Notifications");
    const [menuNotifications, setMenuNotifications] = useState(false);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 5 * 60 * 1000,
  });

    const getAllFunction = () => {
    setMenuNotifications(!menuNotifications);
  };

  const readMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["notifications"] })
        toast.success(t("successRead"));
        setMenuNotifications(false);
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(t("successReadAll"));
      setMenuNotifications(false);
    },
  });

  if (isLoading) return <Badge count={0}><Bell size={18} /></Badge>;

  const notifications = data?.data?.notifications || [];
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <>
    <button className="p-2 rounded-lg hover:bg-gray-100" dir={isRTL ? "rtl" : "ltr"} onClick={() => getAllFunction()}>
        <Badge size="small" count={data?.data?.unread_count}>
            <Bell size={18} />
        </Badge>
    </button>
    {/* notifications menu  */}
    {
        menuNotifications && (
        <div className={`absolute top-16 ${isRTL ? "left-4" : "right-4"} w-96 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 transition-colors`} dir={isRTL ? "rtl" : "ltr"}>
            <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-800 shadow-md border dark:border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b dark:border-slate-700 px-4 py-3 bg-gray-50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{t("title")}</h3>
                    </div>

                    <button
                    onClick={() => readAllMutation.mutate()}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:underline"
                    >
                    <CheckCheck className="h-4 w-4" />
                    <span>{t("markAllRead")}</span>
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[400px] divide-y divide-gray-200 dark:divide-slate-700 overflow-y-auto">
                    {notifications.length === 0 && (
                    <p className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">{t("noNotifications")}</p>
                    )}

                    {notifications.map((n: any) => (
                        
                    <div
                        key={n.id}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-gray-50 dark:hover:bg-slate-700/50 ${
                        !n.read_at ? "bg-purple-50 dark:bg-purple-900/10" : ""
                        }`}
                        onClick={() => !n.read_at && readMutation.mutate(n.id)}
                    >
                        <Link href={"/" + notificationRoute(n)} className="flex items-start gap-3 w-full">
                        <span
                        className={`mt-2 h-2 w-2 rounded-full ${
                            !n.read_at ? "bg-purple-600" : "bg-transparent"
                        }`}
                        />

                        <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{n?.data?.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{n?.data?.body}</p>
                        <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{utcToLocalDateTime(n.created_at)}</p>
                        </div>
                        </Link>
                    </div>
                    ))}
                </div>
                {/* Footer */}
                <div className="border-t dark:border-slate-700 bg-gray-50 dark:bg-slate-900/50 px-4 py-2 text-center">
                    <button
                        onClick={() => readAllMutation.mutate()}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                        {t("markAllRead")}
                    </button>
                </div>
                </div>
        </div>
        )
    } 
    
    </>
  );
}
