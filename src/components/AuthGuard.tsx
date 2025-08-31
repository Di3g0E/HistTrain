import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "~/trpc/react";
import { useUserStore } from "~/stores/userStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const { token, isAuthenticated, setUser, clearUser } = useUserStore();

  // Verify token validity on mount if we have a token
  const getCurrentUserQuery = useQuery(
    trpc.getCurrentUser.queryOptions(
      { token: token || "" },
      {
        enabled: !!token && isAuthenticated,
        retry: false,
        staleTime: 5 * 60 * 1000, // 5 minutes
      }
    )
  );

  useEffect(() => {
  if (!token || !isAuthenticated) {
    navigate({ to: "/auth/login" });
    return;
  }

  if (getCurrentUserQuery.isError) {
    clearUser();
    navigate({ to: "/auth/login" });
  }

  if (getCurrentUserQuery.data?.user) {
    setUser(getCurrentUserQuery.data.user, token);
  }
}, [token, isAuthenticated, getCurrentUserQuery.isError, getCurrentUserQuery.data?.user, navigate]); // Remover setUser y clearUser de las dependencias

  // Show loading while checking authentication
  if (!token || !isAuthenticated || getCurrentUserQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Show error state if authentication failed
  if (getCurrentUserQuery.isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Error de autenticación</h3>
          <p className="text-gray-600">Redirigiendo al login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
