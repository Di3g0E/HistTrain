import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Menu, X, Activity, Plus, History, Home, Settings, BarChart3, Target } from "lucide-react";

interface MobileMenuProps {
  currentPath?: string;
}

export function MobileMenu({ currentPath }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { to: "/", label: "Inicio", icon: Home },
    { to: "/workouts", label: "Historial", icon: History },
    { to: "/workouts/analysis", label: "Análisis", icon: BarChart3 },
    { to: "/workouts/goals", label: "Objetivos", icon: Target },
    { to: "/workouts/new", label: "Añadir", icon: Plus },
    { to: "/workouts/manage-types", label: "Gestionar Tipos", icon: Settings },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-indigo-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
      >
        {isOpen ? (
          <X className="block h-6 w-6" />
        ) : (
          <Menu className="block h-6 w-6" />
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-25 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu */}
          <div className="absolute top-full left-0 right-0 bg-white shadow-lg border-t z-50">
            <div className="px-4 py-2 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPath === item.to;
                
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
