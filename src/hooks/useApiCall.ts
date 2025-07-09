import { useCallback, useState } from "react";
import type { AxiosError } from "axios";
import { toast } from "sonner";

export const useApiCall = <T,>(apiCall: () => Promise<{ status: number; data: T }>, initialData: T | null = null) => {
  const [data, setData] = useState<T | null>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // console.log("Calling API with params:", apiCall.toString());
      const response = await apiCall();
      if (response.status === 200) {
        setData(response.data);
      } else {
        throw new Error(`API returned status ${response.status}`);
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message: string; error: string }>;
      const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Đã có lỗi xảy ra";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [apiCall]);

  return { data, isLoading, error, refetch: fetchData };
};