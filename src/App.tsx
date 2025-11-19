import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { lazy, Suspense, memo } from 'react';
import Sidebar from './components/Sidebar';
import CookieConsent from './components/CookieConsent';

// Eager load the most important page
import Klasindeling from './pages/Klasindeling';

// Lazy load other pages with prefetch hints
const About = lazy(() => import(/* webpackPrefetch: true */ './pages/About'));
const Contact = lazy(() => import(/* webpackPrefetch: true */ './pages/Contact'));
const Groepjesmaker = lazy(() => import('./pages/Groepjesmaker'));
const EVRBSimulator = lazy(() => import('./pages/EVRBSimulator'));
const ArchimedesSimulator = lazy(() => import('./pages/ArchimedesSimulator'));
const Timer = lazy(() => import('./pages/Timer'));
const Namenkiezer = lazy(() => import('./pages/Namenkiezer'));
const QRCodeGenerator = lazy(() => import('./pages/QRCodeGenerator'));

// Memoized loading component for better performance
const PageLoader = memo(function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 text-lg">Laden...</p>
      </div>
    </div>
  );
});

function AppContent() {
  const location = useLocation();
  
  // Map URL paths to page identifiers for sidebar highlighting
  const getPageFromPath = (path: string) => {
    if (path === '/') return 'home';
    if (path === '/klasindeling') return 'home';
    if (path === '/groepjesmaker') return 'groepjesmaker';
    if (path === '/evrb-simulator') return 'erb-simulator';
    if (path === '/archimedeskracht-simulator') return 'archimedes-simulator';
    if (path === '/timer') return 'timer';
    if (path === '/namenkiezer') return 'namenkiezer';
    if (path === '/qr-code') return 'qr-code';
    if (path === '/over') return 'about';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const currentPage = getPageFromPath(location.pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage={currentPage} />
      <main className="flex-1 overflow-x-hidden">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Klasindeling />} />
            <Route path="/klasindeling" element={<Klasindeling />} />
            <Route path="/groepjesmaker" element={<Groepjesmaker />} />
            <Route path="/evrb-simulator" element={<EVRBSimulator />} />
            <Route path="/archimedeskracht-simulator" element={<ArchimedesSimulator />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/namenkiezer" element={<Namenkiezer />} />
            <Route path="/qr-code" element={<QRCodeGenerator />} />
            <Route path="/over" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <CookieConsent />
    </Router>
  );
}

export default App;