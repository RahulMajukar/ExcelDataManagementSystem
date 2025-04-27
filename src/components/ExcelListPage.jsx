import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileSpreadsheet, LogOut, ArrowRight, Search, Filter, Download, Upload, Calendar, Clock } from 'lucide-react';

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
  const [error, setError] = useState(null);
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    // Get user from localStorage
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      setUser(loggedInUser);
    } else {
      // For demo, we'll use a default user
      setUser('Demo User');
      localStorage.setItem('user', 'Demo User');
    }

    // Load Excel files from API
    loadExcelFiles();
  }, []);

  const loadExcelFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:8080/api/excel/files');
      // Make sure we're setting an array, even if the API returns something else
      if (Array.isArray(response.data)) {
        setExcelFiles(response.data);
      } else if (response.data && typeof response.data === 'object') {
        // If the response is an object with a content property that's an array
        if (Array.isArray(response.data.content)) {
          setExcelFiles(response.data.content);
        } else {
          // If it's just an object, convert it to an array
          console.warn('API returned an object instead of an array. Converting to array.');
          setExcelFiles(Object.values(response.data));
        }
      } else {
        // Fallback to empty array
        console.error('Unexpected API response format:', response.data);
        setExcelFiles([]);
        setError("API returned an unexpected data format. Please try again later.");
      }
    } catch (err) {
      console.error("Error loading Excel files:", err);
      setError("Failed to load Excel files. Please try again later.");
      setExcelFiles([]); // Ensure excelFiles is always an array
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
  };

  const handleOpenFile = () => {
    if (!selectedFile) return;
    
    // Find a mapping for this file that we can navigate to
    if (selectedFile.sheetMappings && selectedFile.sheetMappings.length > 0) {
      // Navigate to view the first table by default
      navigate(`/view/${selectedFile.sheetMappings[0].tableName}`);
    } else {
      setError("This file doesn't have any sheet mappings defined.");
    }
  };

  const handleFilterChange = (e) => {
    setFilterType(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFileUpload = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      // Navigate to upload page with the selected file
      navigate('/upload', { state: { file: e.target.files[0] } });
    }
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filter files based on search term and filter type
  // Ensure we always have an array to filter
  const filteredFiles = Array.isArray(excelFiles) ? excelFiles.filter(file => {
    const matchesSearch = 
      file.originalFilename?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (file.description && file.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterType === 'all') {
      return matchesSearch;
    } else if (filterType === 'recent') {
      // Filter for files modified in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return matchesSearch && new Date(file.uploadDate) >= oneWeekAgo;
    }
    
    return matchesSearch;
  }) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
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

      <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex flex-wrap justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Excel Files</h2>
                <p className="mt-2 text-gray-600">Select an Excel file to view and manage its data</p>
              </div>
              <div className="mt-4 sm:mt-0">
                <button
                  onClick={handleFileUpload}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload New Excel
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept=".xlsx,.xls" 
                  onChange={handleFileChange} 
                />
              </div>
            </div>
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

          {/* Error message */}
          {error && (
            <div className="bg-red-50 p-4 border-b border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

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
                                <div className="text-sm font-medium text-indigo-600">
                                  {file.originalFilename || file.filename || 'Unnamed File'}
                                </div>
                                <div className="text-sm text-gray-500">{file.description || 'No description'}</div>
                                <div className="mt-1 flex items-center text-xs text-gray-500">
                                  <div className="flex items-center mr-4">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(file.uploadDate)}
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {new Date(file.uploadDate).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center space-x-4">
                              <div className="text-right">
                                <div className="text-sm text-gray-500">Size</div>
                                <div className="text-sm font-medium text-gray-900">{formatFileSize(file.fileSize)}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm text-gray-500">Sheets</div>
                                <div className="text-sm font-medium text-gray-900">
                                  {file.sheetMappings ? file.sheetMappings.length : 0}
                                </div>
                              </div>
                              <button 
                                className="p-2 text-gray-400 hover:text-indigo-600 rounded-full hover:bg-indigo-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement download feature
                                  console.log(`Downloading ${file.originalFilename || file.filename}`);
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
                    {searchTerm ? 
                      'Try adjusting your search or filter to find what you\'re looking for.' :
                      'Upload Excel files to get started.'}
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleFileUpload}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Excel File
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Quick help section */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-500 flex items-center">
              <span className="bg-blue-100 text-blue-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">Tip</span>
              Select a file and click "Open Selected" to view and manage its data. You can upload new Excel files by clicking the "Upload New Excel" button.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExcelListPage;