import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface UsageStats {
  projectsCount: number;
  projectsLimit: number;
  storageUsed: number; // in bytes
  storageLimit: number; // in bytes (100MB)
  viewsCount: number;
  viewsLimit: number;
  isLoading: boolean;
}

const STORAGE_LIMIT = 500 * 1024 * 1024; // 500MB
const PROJECTS_LIMIT = 10;
const VIEWS_LIMIT = 1000;

export function useUsageStats() {
  const [stats, setStats] = useState<UsageStats>({
    projectsCount: 0,
    projectsLimit: PROJECTS_LIMIT,
    storageUsed: 0,
    storageLimit: STORAGE_LIMIT,
    viewsCount: 0,
    viewsLimit: VIEWS_LIMIT,
    isLoading: true,
  });

  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // 1. Projects Count
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { data: profile } = await supabase
          .from('profiles')
          .select('storage_used')
          .eq('id', user.id)
          .single();

        // 3. Views Count (Aggregate from projects)
        const { data: projects } = await supabase
          .from('projects')
          .select('settings')
          .eq('user_id', user.id);
        
        const totalViews = projects?.reduce((sum: number, p: any) => sum + (p.settings?.views || 0), 0) || 0;

        setStats({
          projectsCount: projectsCount || 0,
          projectsLimit: PROJECTS_LIMIT,
          storageUsed: profile?.storage_used || 0,
          storageLimit: STORAGE_LIMIT,
          viewsCount: totalViews,
          viewsLimit: VIEWS_LIMIT,
          isLoading: false,
        });
      } catch (error) {
        console.error("Failed to fetch usage stats:", error);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchStats();
  }, [supabase]);

  return stats;
}
