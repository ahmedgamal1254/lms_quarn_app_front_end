/**
 * API Helper functions with cache-busting
 * يضمن جلب بيانات جديدة دائماً من السيرفر
 */

interface FetchOptions extends RequestInit {
    skipCacheBust?: boolean;
}

/**
 * Fetch API wrapper with automatic cache-busting
 * @param url - The API URL to fetch
 * @param options - Fetch options
 * @returns Promise with the response data
 */
export async function fetchAPI<T = unknown>(url: string, options: FetchOptions = {}): Promise<T> {
    const { skipCacheBust = false, headers = {}, ...restOptions } = options;

    // إضافة timestamp لكسر الـ cache
    const separator = url.includes('?') ? '&' : '?';
    const finalUrl = skipCacheBust ? url : `${url}${separator}_t=${Date.now()}`;

    const response = await fetch(finalUrl, {
        ...restOptions,
        cache: 'no-store',
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            "Authorization": `Bearer ${localStorage.getItem('token')}`,
            ...headers,
        },
    });

    return response.json();
}

/**
 * GET request with cache-busting
 */
export async function apiGet<T = unknown>(url: string): Promise<T> {
    return fetchAPI<T>(url, { method: 'GET' });
}

/**
 * POST request
 */
export async function apiPost<T = unknown>(url: string, data: unknown): Promise<T> {
    return fetchAPI<T>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

/**
 * PUT request
 */
export async function apiPut<T = unknown>(url: string, data: unknown): Promise<T> {
    return fetchAPI<T>(url, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

/**
 * DELETE request
 */
export async function apiDelete<T = unknown>(url: string): Promise<T> {
    return fetchAPI<T>(url, { method: 'DELETE' });
}
