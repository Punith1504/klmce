export const fetchClient = {
    get: async (url: string) => ({ data: [] as any }),
    post: async (url: string, data: any) => ({ data }),
    put: async (url: string, data: any) => ({ data }),
    delete: async (url: string) => ({ data: null }),
};

export const apiClient = fetchClient;
export default apiClient;
