import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export const useFetchData = (key, url, params = {}, headers, options = {}) => {
  const fetcher = async () => {
    try {
      const { data } = await axios.get(url, {
        params,
        headers
      });
      return data;
    } catch (error) {
      console.log(error);
    }
  };
  return useQuery({
    queryKey: [key, params],
    queryFn: fetcher,
    staleTime: options.staleTime || 60 * 1000,
    gcTime: options.gcTime || 5 * 60 * 1000,
    retry: options.retry || 2,
    refetchOnWindowFocus: options.refetchOnWindowFocus || false,
    ...options,
  });
};
