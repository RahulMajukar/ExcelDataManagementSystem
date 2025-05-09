// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import LoginPage from './components/LoginPage';
// import ExcelListPage from './components/ExcelListPage';
// import Dashboard from './components/Dashboard2';

// // Protected route component that checks for authentication
// const ProtectedRoute = ({ children }) => {
//   const isAuthenticated = localStorage.getItem('isLoggedIn') === 'true';
  
//   if (!isAuthenticated) {
//     // Redirect to login if not authenticated
//     return <Navigate to="/login" />;
//   }
  
//   return children;
// };

// const App = () => {
//   return (
//     <Router>
//       <Routes>
//         {/* Public routes */}
//         <Route path="/login" element={<LoginPage />} />
        
//         {/* Protected routes */}
//         <Route 
//           path="/excel-list" 
//           element={
//             <ProtectedRoute>
//               <ExcelListPage />
//             </ProtectedRoute>
//           }
//         />
        
//         <Route 
//           path="/dashboard" 
//           element={
//             <ProtectedRoute>
//               <Dashboard />
//             </ProtectedRoute>
//           }
//         />
        
//         {/* Default route - redirect to excel list if logged in, otherwise to login */}
//         <Route 
//           path="*" 
//           element={
//             localStorage.getItem('isLoggedIn') === 'true' ? 
//               <Navigate to="/excel-list" /> : 
//               <Navigate to="/login" />
//           }
//         />
//       </Routes>
//     </Router>
//   );
// };

// export default App;

import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import ExcelListPage from './components/ExcelListPage';
import ExcelUploadPage from './components/ExcelUploadPage';
import ExcelDataViewer from './components/ExcelDataViewer';
import LoginPage from './components/LoginPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ExcelListPage />} />
        <Route path="/upload" element={<ExcelUploadPage />} />
        <Route path="/view/:tableName" element={<ExcelDataViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;