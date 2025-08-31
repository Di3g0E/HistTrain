import {
  Outlet,
  createRootRoute,
  useRouterState,
} from "@tanstack/react-router";
import { Toaster } from "react-hot-toast";
import { TRPCReactProvider } from "~/trpc/react";
import { useUserStore } from "~/stores/userStore";
import { Link } from "@tanstack/react-router";
import { LogOut, User } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
});

function UserNavigation() {
  const { user, isAuthenticated, clearUser } = useUserStore();

  if (!isAuthenticated || !user) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <Link
          to="/auth/login"
          className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <User className="w-4 h-4 mr-2" />
          Iniciar Sesión
        </Link>
      </div>
    );
  }

  const handleLogout = () => {
    clearUser();
    window.location.href = "/auth/login";
  };

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center space-x-4">
      <div className="bg-white rounded-lg shadow-lg px-4 py-2 flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-indigo-600" />
          </div>
          <span className="text-sm font-medium text-gray-900">{user.name}</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-sm"
        >
          <LogOut className="w-4 h-4 mr-1" />
          Salir
        </button>
      </div>
    </div>
  );
}

function RootComponent() {
  const isFetching = useRouterState({ select: (s) => s.isLoading });

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <TRPCReactProvider>
      <div className="min-h-screen bg-gray-50">
        <UserNavigation />
        <Outlet />
      </div>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            marginTop: '60px',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#4ade80',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </TRPCReactProvider>
  );
}
