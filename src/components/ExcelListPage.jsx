import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, LogOut, ArrowRight, Search, Filter, Download } from 'lucide-react';

// These would be loaded from your assets folder in a real application
// For demo purposes, we'll use this mock data
const mockExcelFiles = [
  { 
    id: 1, 
    name: 'Sales_Report_2024.xlsx', 
    path: '/assets/excel/Sales_Report_2024.xlsx',
    size: '1.2 MB',
    lastModified: '2024-04-01',
    description: 'Quarterly sales data for all regions'
  },
  { 
    id: 2, 
    name: 'Customer_Data.xlsx', 
    path: '/assets/excel/Customer_Data.xlsx',
    size: '3.4 MB',
    lastModified: '2024-03-15',
    description: 'Complete customer database with contact details'
  },
  { 
    id: 3, 
    name: 'Inventory_Q1.xlsx', 
    path: '/assets/excel/Inventory_Q1.xlsx',
    size: '2.8 MB',
    lastModified: '2024-02-20',
    description: 'First quarter inventory status report'
  },
  { 
    id: 4, 
    name: 'Financial_Summary.xlsx', 
    path: '/assets/excel/Financial_Summary.xlsx',
    size: '0.9 MB',
    lastModified: '2024-04-10',
    description: 'Annual financial summary with projections'
  },
  { 
    id: 5, 
    name: 'Employee_Records.xlsx', 
    path: '/assets/excel/Employee_Records.xlsx',
    size: '4.2 MB',
    lastModified: '2024-03-28',
    description: 'Complete employee database with performance metrics'
  },
  { 
    id: 6, 
    name: 'Marketing_Campaign_2024.xlsx', 
    path: '/assets/excel/Marketing_Campaign_2024.xlsx',
    size: '1.7 MB',
    lastModified: '2024-04-05',
    description: 'Marketing campaign data with ROI analysis'
  },
  { 
    id: 7, 
    name: 'Product_Catalog.xlsx', 
    path: '/assets/excel/Product_Catalog.xlsx',
    size: '5.1 MB',
    lastModified: '2024-03-10',
    description: 'Complete product catalog with specifications and pricing'
  },
  { 
    id: 8, 
    name: 'Budget_Planning_2024.xlsx', 
    path: '/assets/excel/Budget_Planning_2024.xlsx',
    size: '1.5 MB',
    lastModified: '2024-02-15',
    description: 'Annual budget planning document with departmental breakdowns'
  }
];

const StateStreetLogo = () => (
  <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="200" height="40" rx="5" fill="#05386B" />
    <text x="120" y="48" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">STATE STREET</text>
    <path d="M30 40 H55 M30 50 H45" stroke="white" strokeWidth="2" />
    <path d="M210 40 H185 M210 50 H195" stroke="white" strokeWidth="2" />
  </svg>
);

const ExcelListPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [excelFiles, setExcelFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    // Get user from localStorage
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      // Redirect if not logged in
      navigate('/login');
    }

    // Simulate loading Excel files from assets folder
    const loadExcelFiles = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch files from your assets folder
        // For now, we'll use mock data with a simulated delay
        setTimeout(() => {
          setExcelFiles(mockExcelFiles);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error("Error loading Excel files:", error);
        setLoading(false);
      }
    };

    loadExcelFiles();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleOpenFile = () => {
    if (selectedFile) {
      // Store the selected file information in localStorage
      localStorage.setItem('selectedExcel', JSON.stringify(selectedFile));
      
      // Navigate to the dashboard with the selected file
      navigate('/dashboard');
    }
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter files based on search term and file type
  const filteredFiles = excelFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         file.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') {
      return matchesSearch;
    }
    
    // Additional filters could be implemented based on file type/category
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-40 h-12 mr-4">
              <StateStreetLogo />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Excel Data Management</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Logged in as <span className="font-medium">{user}</span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <h2 className="text-3xl font-bold text-gray-800">Select Excel File</h2>
            <p className="mt-2 text-gray-600">Choose an Excel file to view and manage its data</p>
          </div>

          {/* Search and filter controls */}
          <div className="bg-white p-6 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative inline-flex">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Filter className="h-4 w-4 text-gray-400" />
                  </div>
                  <select
                    className="block pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={filterType}
                    onChange={handleFilterChange}
                  >
                    <option value="all">All Files</option>
                    <option value="recent">Recently Modified</option>
                    <option value="large">Large Files</option>
                  </select>
                </div>
                
                <button
                  onClick={handleOpenFile}
                  disabled={!selectedFile}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    selectedFile ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                >
                  <ArrowRight className="h-4 w-4 mr-2" />
                  Open Selected
                </button>
              </div>
            </div>
          </div>

          {/* File list */}
          {loading ? (
            <div className="p-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : (
            <div className="overflow-hidden">
              {filteredFiles.length > 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {filteredFiles.map((file) => (
                      <li 
                        key={file.id}
                        className={`${
                          selectedFile && selectedFile.id === file.id
                            ? 'bg-indigo-50 border-l-4 border-indigo-500'
                            : 'hover:bg-gray-50 border-l-4 border-transparent'
                        } transition-colors duration-150 ease-in-out cursor-pointer`}
                        onClick={() => handleFileSelect(file)}
                      >
                        <div className="px-4 py-5 sm:px-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-indigo-600">{file.name}</div>
                                <div className="text-sm text-gray-500">{file.description}</div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-500">Last Modified</div>
                                <div className="text-sm font-medium text-gray-900">{file.lastModified}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">Size</div>
                                <div className="text-sm font-medium text-gray-900">{file.size}</div>
                              </div>
                              <button 
                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // In a real app, this would trigger a download
                                  console.log(`Downloading ${file.name}`);
                                }}
                              >
                                <Download className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="py-12 px-4 text-center">
                  <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Quick help section */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Tip</span>
              Select a file and click "Open Selected" to view and manage its data. You can also search for specific files by name or description.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExcelListPage;