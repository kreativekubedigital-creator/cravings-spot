import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAdminAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchSessionAndRole = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        if (active) {
          setSession(null);
          setRole(null);
          setLoading(false);
        }
        return;
      }

      // Fetch role
      const { data } = await supabase
        .from('admin_roles')
        .select('role')
        .eq('email', session.user.email)
        .maybeSingle();

      if (active) {
        setSession(session);
        // Normalize role to handle manual database entries like "Cravings Admin"
        const rawRole = data?.role || 'superadmin';
        const normalizedRole = rawRole.toLowerCase().trim().replace(/\s+/g, '_');
        setRole(normalizedRole);
        setLoading(false);
      }
    };

    fetchSessionAndRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Just refetch entirely to get role again
        fetchSessionAndRole();
      } else {
        setSession(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, role, loading, isAdmin: !!session };
}
