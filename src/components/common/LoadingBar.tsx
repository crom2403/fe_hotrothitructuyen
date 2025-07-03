// src/components/LoadingBar.tsx
import * as Progress from '@radix-ui/react-progress';
import { useState, useEffect } from 'react';
import instance from '@/services/instance';

const LoadingBar = () => {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Interceptor cho request
    const requestInterceptor = instance.interceptors.request.use((config) => {
      setIsLoading(true);
      setProgress(0);
      return config;
    });

    // Interceptor cho response
    const responseInterceptor = instance.interceptors.response.use(
      (response) => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 100); // Delay để hoàn thành hiệu ứng
        return response;
      },
      (error) => {
        setProgress(100);
        setTimeout(() => setIsLoading(false), 100);
        return Promise.reject(error);
      },
    );

    // Cleanup interceptors
    return () => {
      instance.interceptors.request.eject(requestInterceptor);
      instance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isLoading && progress < 95) {
      timer = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 95)); // Tăng dần đến 95%
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isLoading, progress]);

  if (!isLoading) return null;

  return (
    <Progress.Root className="ProgressRoot" value={progress}>
      <Progress.Indicator className="ProgressIndicator" style={{ transform: `translateX(-${100 - progress}%)` }} />
    </Progress.Root>
  );
};

export default LoadingBar;
