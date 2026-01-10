import React, { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FileText, Type, Languages } from 'lucide-react';

const Navigation = memo(() => {
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      icon: FileText,
      label: 'Dokumen',
      description: 'PDF & DOCX'
    },
    {
      path: '/text',
      icon: Type,
      label: 'Teks',
      description: 'Text Translation'
    }
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 md:py-4">
        {/* Desktop Layout: Horizontal */}
        <div className="hidden md:flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Languages className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Translate Hub</h1>
              <p className="text-xs text-gray-600">Dokumen & Teks - Cepat & Akurat</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Mobile Layout: Stacked */}
        <div className="md:hidden space-y-3">
          {/* Logo & Title - Centered on mobile */}
          <div className="flex items-center justify-center gap-2">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
              <Languages className="h-5 w-5 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-lg font-bold text-gray-900">Translate Hub</h1>
              <p className="text-[10px] text-gray-600">Dokumen & Teks - Cepat & Akurat</p>
            </div>
          </div>

          {/* Navigation Tabs - Grid on mobile */}
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all
                    ${isActive 
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col items-start">
                    <span className="text-xs font-semibold">{item.label}</span>
                    <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                      {item.description}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
});

export default Navigation;
