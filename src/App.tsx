import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import KlasindelingApp from './pages/KlasindelingApp';
import Sidebar from './components/Sidebar';
import About from './pages/About';
import Contact from './pages/Contact';
import Groepjesmaker from './pages/Groepjesmaker';
import EVRBSimulator from './pages/EVRBSimulator';
import ArchimedesSimulator from './pages/ArchimedesSimulator';
import Timer from './pages/Timer';
import Namenkiezer from './pages/Namenkiezer';

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
    if (path === '/over') return 'about';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const currentPage = getPageFromPath(location.pathname);

  return (
    <div className="flex min-h-screen">
      <Sidebar currentPage={currentPage} />
      <main className="flex-1 overflow-x-hidden">
        <Routes>
          <Route path="/" element={<KlasindelingApp />} />
          <Route path="/klasindeling" element={<KlasindelingApp />} />
          <Route path="/groepjesmaker" element={<Groepjesmaker />} />
          <Route path="/evrb-simulator" element={<EVRBSimulator />} />
          <Route path="/archimedeskracht-simulator" element={<ArchimedesSimulator />} />
            <Route path="/timer" element={<Timer />} />
            <Route path="/namenkiezer" element={<Namenkiezer />} />
            <Route path="/over" element={<About />} />
            <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;