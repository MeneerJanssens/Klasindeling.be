import { Armchair, Info, Mail, Menu, X, Users as UsersIcon, Car, Droplets, Clock, Shuffle, QrCode } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface SidebarProps {
  currentPage: string;
}

export default function Sidebar({ currentPage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'home', label: 'Klasindeling', icon: Armchair, path: '/klasindeling' },
    { id: 'groepjesmaker', label: 'Groepjesmaker', icon: UsersIcon, path: '/groepjesmaker' },
    { id: 'namenkiezer', label: 'Namenkiezer', icon: Shuffle, path: '/namenkiezer' },
    { id: 'timer', label: 'Timer', icon: Clock, path: '/timer' },
    { id: 'qr-code', label: 'QR-Code Generator', icon: QrCode, path: '/qr-code' },
    { id: 'erb-simulator', label: 'EVRB Simulator', icon: Car, path: '/evrb-simulator' },
    { id: 'archimedes-simulator', label: 'Archimedeskracht Simulator', icon: Droplets, path: '/archimedeskracht-simulator' },
    { id: 'about', label: 'Over', icon: Info, path: '/over' },
    { id: 'contact', label: 'Contact', icon: Mail, path: '/contact' },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-indigo-600 text-white p-2 rounded-lg shadow-lg hover:bg-indigo-700 transition print:hidden"
        aria-label={isOpen ? 'Sluit menu' : 'Open menu'}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30 print:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
          role="presentation"
          aria-hidden={isOpen ? 'false' : 'true'}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white shadow-xl z-40
          w-64 shrink-0 transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          print:hidden
        `}
      >
        <div className="p-6 pt-16 lg:pt-6">
          <h2 className="text-2xl font-bold text-indigo-900 mb-8 flex items-center gap-2">
            <img src="/favicons/favicon-96x96.png" alt="Klasindeling favicon" className="w-8 h-8 mr-1 rounded" />
            klasindeling.be
          </h2>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200 text-left
                    ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="font-medium text-left">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            © 2025 Dietrich Janssens
          </p>
        </div>
      </aside>
    </>
  );
}
