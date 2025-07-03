import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'sonner';
import LoadingBar from '@/components/common/LoadingBar';

function App() {
  return (
    <div className="container mx-auto">
      <div className="min-h-screen">
        <Router>
          <AppRoutes />
        </Router>
      </div>
      <Toaster position="top-center" expand={false} richColors />
    </div>
  );
}

export default App;
