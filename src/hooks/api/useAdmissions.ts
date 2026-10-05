import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * Hook to fetch the active admissions pipeline payload.
 */
export const useGetApplicants = () => {
    return useQuery({
        queryKey: ['admissions', 'pipeline'],
        queryFn: async () => {
            const { data } = await apiClient.get('/admissions/applicants');
            return data;
        },
        staleTime: 1000 * 60 * 5, // Cache data for 5 minutes before refetching
    });
};

/**
 * Hook implementing Optimistic UI Updates for the Kanban Board Drag-and-Drop.
 */
export const useUpdateApplicantStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ applicantId, newStatus }: { applicantId: string, newStatus: string }) => {
            // Fires the actual network request to trigger the FastAPI State Machine Webhooks
            const { data } = await apiClient.patch(`/admissions/applicants/${applicantId}/status`, { status: newStatus });
            return data;
        },
        
        // ==========================================
        // OPTIMISTIC UI ENGINE
        // ==========================================
        onMutate: async (newUpdate) => {
            // 1. Cancel any outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['admissions', 'pipeline'] });

            // 2. Snapshot the current cache state as a fallback backup
            const previousPipeline = queryClient.getQueryData(['admissions', 'pipeline']);

            // 3. Optimistically mutate the cache to instantly snap the UI to the new state
            queryClient.setQueryData(['admissions', 'pipeline'], (oldData: any) => {
                if (!oldData) return oldData;
                
                // Deep-map to find the specific applicant and update their status instantly in memory
                return {
                    ...oldData,
                    tasks: {
                        ...oldData.tasks,
                        [newUpdate.applicantId]: {
                            ...oldData.tasks[newUpdate.applicantId],
                            status: newUpdate.newStatus
                        }
                    }
                };
            });

            // 4. Return the backup snapshot
            return { previousPipeline };
        },
        
        // If the FastAPI backend throws a 500 or validation error, mathematically roll back the UI
        onError: (err, newUpdate, context) => {
            if (context?.previousPipeline) {
                console.warn("Optimistic Update Failed. Rolling back DOM to previous stable state.");
                queryClient.setQueryData(['admissions', 'pipeline'], context.previousPipeline);
            }
        },
        
        // Regardless of success or failure, quietly refetch in the background to ensure absolute sync
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['admissions', 'pipeline'] });
        },
    });
};
