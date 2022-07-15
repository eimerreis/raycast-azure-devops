import { useState, useEffect } from "react";

export const useData = <T extends object>(fetchFn: () => Promise<T>) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<T>();

  useEffect(() => {
    (async () => {
      const data = await fetchFn();
      setData(data);
      setIsLoading(false);
    })();
  }, []);

  return {
    isLoading,
    data
  };
};
