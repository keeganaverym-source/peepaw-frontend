import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Sidebar from './components/shared/Sidebar';
import MapPage from './pages/MapPage';
import LeadsPage from './pages/LeadsPage';
import DashboardPage from './pages/DashboardPage';
import PitchPage from './pages/PitchPage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 5 * 60 * 1000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="flex h-screen overflow-hidden bg-dark-950">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/pitch" element={<PitchPage />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: '#0f1629', color: '#e5e7eb', border: '1px solid #1a2540' },
          }}
        />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
