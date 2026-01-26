'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';
import { useTranslations } from 'next-intl';
import { Spin, Table, Tag, Button, Modal, Input, DatePicker, TimePicker, message } from 'antd';
import { Check, X, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import dayjs from 'dayjs';

export default function CancellationRequestsPage() {
    const t = useTranslations('Admin.Cancellations');
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [action, setAction] = useState<string>('');
    const [notes, setNotes] = useState('');
    const [newDate, setNewDate] = useState<any>(null);
    const [newTime, setNewTime] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const queryClient = useQueryClient();

    const { data: requests, isLoading } = useQuery({
        queryKey: ['admin-cancellations'],
        queryFn: async () => {
            const res = await axiosInstance.get('/admin/cancellations');
            return res.data.data;
        }
    });

    const resolveMutation = useMutation({
        mutationFn: async (data: any) => {
            await axiosInstance.post(`/admin/cancellations/${selectedRequest.id}/resolve`, data);
        },
        onSuccess: () => {
            message.success(t('success'));
            setIsModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['admin-cancellations'] });
        },
        onError: () => {
            message.error(t('error'));
        }
    });

    const handleAction = (req: any, act: string) => {
        setSelectedRequest(req);
        setAction(act);
        setNotes('');
        setIsModalOpen(true);
    };

    const submitResolution = () => {
        const payload: any = { action, notes };
        if (action === 'reschedule') {
            if (!newDate || !newTime) return message.error('Date/Time required');
            payload.new_date = newDate.format('YYYY-MM-DD');
            payload.new_time = newTime.format('HH:mm:ss');
        }
        resolveMutation.mutate(payload);
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Requester',
            key: 'requester',
            render: (_: any, record: any) => record.requester?.name + ` (${record.requester_role})`
        },
        {
            title: 'Session',
            key: 'session',
            render: (_: any, record: any) => `${record.session?.title} - ${record.session?.session_date}`
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: any) => (
                <div className="flex gap-2">
                    <Button 
                        size="small" 
                        icon={<Check className="w-4 h-4" />} 
                        onClick={() => handleAction(record, 'refund')}
                        className="bg-green-100 text-green-700 border-green-200"
                    >
                        Refund
                    </Button>
                    <Button 
                        size="small" 
                        icon={<RefreshCw className="w-4 h-4" />} 
                        onClick={() => handleAction(record, 'reschedule')}
                        className="bg-blue-100 text-blue-700 border-blue-200"
                    >
                        Reschedule
                    </Button>
                    <Button 
                        size="small" 
                        danger
                        icon={<X className="w-4 h-4" />} 
                        onClick={() => handleAction(record, 'reject')}
                    >
                        Reject
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Cancellation Requests</h1>
            
            {isLoading ? <Spin /> : <Table dataSource={requests} columns={columns} rowKey="id" />}

            <Modal
                title={`Resolve Request: ${action?.toUpperCase()}`}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                onOk={submitResolution}
                confirmLoading={resolveMutation.isPending}
            >
                <div className="space-y-4">
                    <p><strong>Session:</strong> {selectedRequest?.session?.title}</p>
                    <p><strong>Reason:</strong> {selectedRequest?.reason}</p>
                    
                    {action === 'reschedule' && (
                        <div className="flex gap-4">
                            <DatePicker onChange={setNewDate} className="w-full" />
                            <TimePicker onChange={setNewTime} className="w-full" />
                        </div>
                    )}
                    
                    <Input.TextArea 
                        placeholder="Admin Notes (Optional)" 
                        value={notes} 
                        onChange={e => setNotes(e.target.value)} 
                        rows={3}
                    />
                </div>
            </Modal>
        </div>
    );
}
