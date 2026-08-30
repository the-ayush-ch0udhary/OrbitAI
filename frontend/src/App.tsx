import React, { useState, useContext, useEffect } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import HomePage from './components/HomePage';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import './index.css';



const AppRoutes: React.FC = () => {
  const authContext = useContext(AuthContext);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage/>} />
      <Route
        path="/login"
        element={
          authContext?.isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      {/* Protected Route */}
      <Route
        path="/dashboard"
        element={
          authContext?.isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />
        }
      />

      {/* Catch all unmatched paths */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
};

export default App;




// function AppContent() {
//   const authContext = useContext(AuthContext);
//   const [showLogin, setShowLogin] = useState(false);

//   if (authContext?.isAuthenticated) {
//     return <Dashboard />;
//   }

//   if (showLogin) {
//     return <Login />;
//   }

//   return <HomePage onSignIn={() => setShowLogin(true)} />;
// }

// function App() {
//   return (
//     <AuthProvider>
//       <ThemeProvider>
//         <AppContent />
//       </ThemeProvider>
//     </AuthProvider>
//   );
// }

// export default App;