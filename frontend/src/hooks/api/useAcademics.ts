import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '@/lib/api/client';

/**
 * Hook to execute the Choice-Based Credit System (CBCS) enrollment payload.
 */
export const useSubmitCourseRegistration = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (selectedCourseIds: string[]) => {
            // Fires the heavily-locked backend POST request to deduct physical seat capacities
            const { data } = await apiClient.post('/academics/registration', { 
                course_ids: selectedCourseIds 
            });
            return data;
        },
        onSuccess: () => {
            // Upon successful enrollment, invalidate the student's timetable cache.
            // This forces React Query to automatically refetch and rerender their new schedule.
            queryClient.invalidateQueries({ queryKey: ['academics', 'my-schedule'] });
            
            // Also invalidate the global course catalog to refresh live seat counts across all active browsers
            queryClient.invalidateQueries({ queryKey: ['academics', 'available-courses'] });
        }
    });
};
