"use client";

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
        toast.success("تم قراءة الاشعار بنجاح");
        setMenuNotifications(false);
    },
  });

  const readAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("تم قراءة جميع الاشعارات بنجاح");
      setMenuNotifications(false);
    },
  });

  if (isLoading) return <Badge count={0}><Bell size={18} /></Badge>;

  const notifications = data?.data?.notifications || [];

  return (
    <>
    <Badge size="default" count={data?.data?.unread_count}>
        <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => getAllFunction()}>
            <Bell size={18} />
        </button>
    </Badge>
    {/* notifications menu  */}
    {
        menuNotifications && (
        <div className="absolute top-16 left-4 w-96 bg-white rounded-lg shadow-lg p-4">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-md">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-purple-600" />
                    <h3 className="text-lg font-semibold">الاشعارات</h3>
                    </div>

                    <button
                    onClick={() => readAllMutation.mutate()}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:underline"
                    >
                    <CheckCheck className="h-4 w-4" />
                    <span>اقراء الكل</span>
                    </button>
                </div>

                {/* List */}
                <div className="max-h-[400px] divide-y overflow-y-auto">
                    {notifications.length === 0 && (
                    <p className="p-4 text-center text-sm text-gray-500">لا يوجد اشعارات</p>
                    )}

                    {notifications.map((n: any) => (
                        
                    <div
                        key={n.id}
                        className={`flex cursor-pointer items-start gap-3 px-4 py-3 transition hover:bg-gray-50 ${
                        !n.read_at ? "bg-purple-50" : ""
                        }`}
                        onClick={() => !n.read_at && readMutation.mutate(n.id)}
                    >
                        <Link href={"/" + notificationRoute(n)}>
                        <span
                        className={`mt-2 h-2 w-2 rounded-full ${
                            !n.read_at ? "bg-purple-600" : "bg-transparent"
                        }`}
                        />

                        <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{n?.data?.title}</p>
                        <p className="text-xs text-gray-500">{n?.data?.body}</p>
                        <p className="mt-1 text-[11px] text-gray-400">{utcToLocalDateTime(n.created_at)}</p>
                        </div>
                        </Link>
                    </div>
                    ))}
                </div>
                </div>
        </div>
        )
    } 
    
    </>
  );
}
