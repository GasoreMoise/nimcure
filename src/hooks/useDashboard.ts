import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

export function useDashboard() {
  const { data, error, isLoading, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard', {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      return response.json();
    },
    refetchInterval: 30000 // Refetch every 30 seconds
  });

  return {
    data,
    error,
    isLoading,
    refetch
  };
} 