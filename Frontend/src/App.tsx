import './App.css'
import AuthPage from './components/AuthPage'
import Chat from './components/Chat'
import LandingPage from './components/LandingPage'
import { PageProvider, usePage } from './context/PageContext'
import { AuthProvider } from './context/AuthContext'
import OperatorDashboard from './components/OperatorDashboard'
function PageContent() {
  const { currentPage } = usePage();
  
  switch (currentPage) {
    case 'chat':
      return <Chat />;
    case 'auth':
      return <AuthPage />;
    case 'operator':
      return <OperatorDashboard />;
    case 'landing':
    default:
      return <LandingPage />;
  }
}

function App() {
  return (
    <AuthProvider>
      <PageProvider>
        <PageContent />
      </PageProvider>
    </AuthProvider>
  )
}

export default App
