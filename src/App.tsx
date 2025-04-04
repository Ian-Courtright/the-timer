import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import { timerLogService } from './lib/timerLogService';
import { toast, Toaster } from 'sonner';

function App() {
  // Migrate local storage logs to Supabase on app startup
  useEffect(() => {
    const migrateLogsToSupabase = async () => {
      try {
        await timerLogService.migrateLocalLogs();
      } catch (error) {
        console.error('Error migrating logs to Supabase:', error);
      }
    };
    
    migrateLogsToSupabase();
  }, []);

  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
