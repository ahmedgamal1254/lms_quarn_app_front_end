/**
 * Delete Helper Functions
 * Provides reusable delete functionality with confirmation dialogs
 */

import toast from "react-hot-toast";

export interface DeleteOptions {
    endpoint: string;
    itemName: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

/**
 * Delete an item with confirmation
 */
export async function deleteWithConfirmation(
    id: number,
    options: DeleteOptions
): Promise<boolean> {
    const { endpoint, itemName, onSuccess, onError } = options;

    // Show confirmation dialog
    const confirmed = window.confirm(
        `هل أنت متأكد من حذف ${itemName}؟\nهذا الإجراء لا يمكن التراجع عنه.`
    );

    if (!confirmed) {
        return false;
    }

    try {
        const response = await fetch(`/api/${endpoint}/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            toast.success(`تم حذف ${itemName} بنجاح`);
            if (onSuccess) onSuccess();
            return true;
        } else {
            const errorMsg = data.error || 'حدث خطأ أثناء الحذف';
            toast.error(errorMsg);
            if (onError) onError(errorMsg);
            return false;
        }
    } catch (error: any) {
        const errorMsg = 'حدث خطأ في الاتصال بالخادم';
        console.error('Delete error:', error);
        toast.error(errorMsg);
        if (onError) onError(errorMsg);
        return false;
    }
}

/**
 * Delete multiple items with confirmation
 */
export async function deleteMultipleWithConfirmation(
    ids: number[],
    options: DeleteOptions
): Promise<boolean> {
    const { endpoint, itemName, onSuccess, onError } = options;

    if (ids.length === 0) {
        toast.error('الرجاء اختيار عناصر للحذف');
        return false;
    }

    // Show confirmation dialog
    const confirmed = window.confirm(
        `هل أنت متأكد من حذف ${ids.length} ${itemName}؟\nهذا الإجراء لا يمكن التراجع عنه.`
    );

    if (!confirmed) {
        return false;
    }

    try {
        const response = await fetch(`/api/${endpoint}/bulk-delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const data = await response.json();

        if (data.success) {
            toast.success(`تم حذف ${ids.length} ${itemName} بنجاح`);
            if (onSuccess) onSuccess();
            return true;
        } else {
            const errorMsg = data.error || 'حدث خطأ أثناء الحذف';
            toast.error(errorMsg);
            if (onError) onError(errorMsg);
            return false;
        }
    } catch (error: any) {
        const errorMsg = 'حدث خطأ في الاتصال بالخادم';
        console.error('Delete error:', error);
        toast.error(errorMsg);
        if (onError) onError(errorMsg);
        return false;
    }
}
