import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, Edit2, Trash2, Upload, LogOut, FileText, Search,
  Download, Filter, BarChart, Grid, List, Eye, Settings, AlertTriangle,
  Save, X, ChevronDown, ChevronUp, ArrowUpDown, Calendar, Bell, User as UserIcon,
  Sliders, RefreshCw, FileSpreadsheet, Info, HelpCircle, Star, StarOff
} from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard2 = () => {
  // State variables
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [columns, setColumns] = useState([]);
  const [user, setUser] = useState('');
  const [activeView, setActiveView] = useState('table');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filters, setFilters] = useState({});
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [favoriteRows, setFavoriteRows] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [activeSheet, setActiveSheet] = useState('');
  const [sheets, setSheets] = useState([]);
  const [showColumnSettings, setShowColumnSettings] = useState(false);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [dataHistory, setDataHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [chartType, setChartType] = useState('bar');
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });
  
  // Refs
  const fileInputRef = useRef(null);
  const notificationRef = useRef(null);
  const columnSettingsRef = useRef(null);
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedData = localStorage.getItem('excelData');
    const storedDarkMode = localStorage.getItem('darkMode') === 'true';
    const storedFavorites = localStorage.getItem('favoriteRows');
    const storedHiddenColumns = localStorage.getItem('hiddenColumns');
    
    if (storedUser) {
      setUser(storedUser);
    } else {
      // Redirect if not logged in
      window.location.href = '/';
    }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      initializeData(parsedData);
    }
    
    if (storedDarkMode) {
      setIsDarkMode(storedDarkMode);
      document.documentElement.classList.toggle('dark', storedDarkMode);
    }
    
    if (storedFavorites) {
      setFavoriteRows(JSON.parse(storedFavorites));
    }
    
    if (storedHiddenColumns) {
      setHiddenColumns(JSON.parse(storedHiddenColumns));
    }
    
    // Add a welcome notification
    addNotification('Welcome to Excel Data Manager', 'info');
    
    // Add event listener for clicks outside notifications panel
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Initialize data and derived states
  const initializeData = (parsedData) => {
    // Extract column names from first row
    if (parsedData.length > 0) {
      const extractedColumns = Object.keys(parsedData[0]);
      setColumns(extractedColumns);
      setNewRow(extractedColumns.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}));
      
      // Initialize filters
      const initialFilters = {};
      extractedColumns.forEach(column => {
        initialFilters[column] = '';
      });
      setFilters(initialFilters);
      
      // Set initial history
      setDataHistory([parsedData]);
      setHistoryIndex(0);
      
      // Prepare chart data if numeric columns exist
      prepareChartData(parsedData, extractedColumns);
    }
  };
  
  // Prepare data for charts
  const prepareChartData = (data, columns) => {
    // Find the first string column for labels and first numeric column for data
    let labelColumn = columns[0];
    let dataColumn = columns.find(col => 
      data.length > 0 && typeof data[0][col] === 'number'
    ) || columns[1];
    
    // Extract data
    const labels = data.slice(0, 10).map(row => row[labelColumn]?.toString() || '');
    const values = data.slice(0, 10).map(row => parseFloat(row[dataColumn]) || 0);
    
    setChartData({
      labels,
      datasets: [{
        label: dataColumn,
        data: values,
        backgroundColor: 'rgba(99, 102, 241, 0.5)',
        borderColor: 'rgb(99, 102, 241)',
        borderWidth: 1
      }]
    });
  };
  
  // Handle click outside notifications panel
  const handleClickOutside = (event) => {
    if (notificationRef.current && !notificationRef.current.contains(event.target)) {
      setShowNotifications(false);
    }
    
    if (columnSettingsRef.current && !columnSettingsRef.current.contains(event.target)) {
      setShowColumnSettings(false);
    }
  };
  
  // Add notification
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    
    // Auto-dismiss success notifications after 5 seconds
    if (type === 'success') {
      setTimeout(() => {
        setNotifications(prev => 
          prev.filter(notification => notification.id !== newNotification.id)
        );
      }, 5000);
    }
  };
  
  // Mark notification as read
  const markNotificationAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };
  
  // Dismiss notification
  const dismissNotification = (id) => {
    setNotifications(prev => 
      prev.filter(notification => notification.id !== id)
    );
  };
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode.toString());
    addNotification(`${newMode ? 'Dark' : 'Light'} mode activated`, 'success');
  };
  
  // Toggle favorite row
  const toggleFavorite = (index) => {
    let newFavorites;
    if (favoriteRows.includes(index)) {
      newFavorites = favoriteRows.filter(i => i !== index);
      addNotification('Removed from favorites', 'info');
    } else {
      newFavorites = [...favoriteRows, index];
      addNotification('Added to favorites', 'success');
    }
    
    setFavoriteRows(newFavorites);
    localStorage.setItem('favoriteRows', JSON.stringify(newFavorites));
  };
  
  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    // Keep preferences like dark mode, favorites, etc.
    addNotification('Logged out successfully', 'info');
    // Redirect to login
    window.location.href = '/';
  };
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const binaryString = event.target.result;
        const workbook = XLSX.read(binaryString, { type: 'binary' });
        
        // Extract all sheet names
        const sheetNames = workbook.SheetNames;
        setSheets(sheetNames);
        
        // Use the first sheet by default
        const sheetName = sheetNames[0];
        setActiveSheet(sheetName);
        
        const worksheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(worksheet);
        
        // Save to state and localStorage
        setData(parsedData);
        localStorage.setItem('excelData', JSON.stringify(parsedData));
        
        // Initialize all related states
        initializeData(parsedData);
        
        // Reset pagination
        setCurrentPage(1);
        
        // Reset selected rows
        setSelectedRows([]);
        setSelectAll(false);
        
        addNotification(`Excel file "${file.name}" uploaded successfully`, 'success');
      } catch (error) {
        console.error('Error parsing Excel file:', error);
        addNotification(`Error uploading file: ${error.message}`, 'error');
      }
    };
    
    reader.readAsBinaryString(file);
  };
  
  // Change sheet
  const changeSheet = (sheetName) => {
    try {
      const storedData = localStorage.getItem('excelData');
      if (!storedData) return;
      
      // For demo purposes, we'll just show the same data for different sheets
      // In a real app, you would load the specific sheet from the workbook
      const parsedData = JSON.parse(storedData);
      
      setData(parsedData);
      setActiveSheet(sheetName);
      initializeData(parsedData);
      addNotification(`Switched to sheet "${sheetName}"`, 'info');
    } catch (error) {
      addNotification(`Error changing sheet: ${error.message}`, 'error');
    }
  };
  
  // Export to Excel
  const exportToExcel = () => {
    try {
      // Create a new workbook
      const wb = XLSX.utils.book_new();
      
      // Convert data to worksheet
      const ws = XLSX.utils.json_to_sheet(data);
      
      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, 'ExportedData');
      
      // Generate Excel file
      XLSX.writeFile(wb, 'exported_data.xlsx');
      
      addNotification('Data exported to Excel successfully', 'success');
    } catch (error) {
      addNotification(`Error exporting data: ${error.message}`, 'error');
    }
  };
  
  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  // Handle adding row
  const handleAddRow = () => {
    setIsAddingRow(true);
    setEditingIndex(null);
    // Reset new row form
    if (columns.length > 0) {
      setNewRow(columns.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}));
    }
  };
  
  // Handle cancel add/edit
  const handleCancelAdd = () => {
    setIsAddingRow(false);
    setEditingIndex(null);
    // Reset the new row form
    if (columns.length > 0) {
      setNewRow(columns.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}));
    }
  };
  
  // Save changes and update history
  const saveChangesAndUpdateHistory = (updatedData) => {
    // Save to state and localStorage
    setData(updatedData);
    localStorage.setItem('excelData', JSON.stringify(updatedData));
    
    // Update history
    if (historyIndex < dataHistory.length - 1) {
      // If we're in the middle of the history, truncate forward history
      const newHistory = dataHistory.slice(0, historyIndex + 1);
      newHistory.push(updatedData);
      setDataHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    } else {
      // Just append to history
      setDataHistory([...dataHistory, updatedData]);
      setHistoryIndex(dataHistory.length);
    }
  };
  
  // Handle save new row
  const handleSaveNewRow = () => {
    // Validate all fields have values
    const hasEmptyFields = columns.some(column => !newRow[column]);
    
    if (hasEmptyFields) {
      setStatusMessage({ 
        type: 'error', 
        text: 'Please fill in all fields before saving' 
      });
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setStatusMessage({ type: '', text: '' });
      }, 3000);
      
      return;
    }
    
    let updatedData;
    
    // If editing existing row
    if (editingIndex !== null) {
      updatedData = [...data];
      updatedData[editingIndex] = newRow;
      addNotification('Row updated successfully', 'success');
    } else {
      // Adding new row
      updatedData = [...data, newRow];
      addNotification('New row added successfully', 'success');
    }
    
    // Save changes
    saveChangesAndUpdateHistory(updatedData);
    
    // Update chart data
    prepareChartData(updatedData, columns);
    
    setIsAddingRow(false);
    setEditingIndex(null);
    
    // Reset form
    if (columns.length > 0) {
      setNewRow(columns.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}));
    }
  };
  
  // Handle edit row
  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsAddingRow(true);
    setNewRow({...data[index]});
  };
  
  // Handle delete row
  const handleDelete = (index) => {
    setRowToDelete(index);
    setShowDeleteConfirm(true);
  };
  
  // Confirm delete row
  const confirmDelete = () => {
    if (rowToDelete !== null) {
      const updatedData = data.filter((_, i) => i !== rowToDelete);
      
      // Save changes
      saveChangesAndUpdateHistory(updatedData);
      
      // Update chart data
      prepareChartData(updatedData, columns);
      
      // Update favorites
      const newFavorites = favoriteRows
        .filter(i => i !== rowToDelete)
        .map(i => i > rowToDelete ? i - 1 : i);
      setFavoriteRows(newFavorites);
      localStorage.setItem('favoriteRows', JSON.stringify(newFavorites));
      
      addNotification('Row deleted successfully', 'success');
    }
    
    setShowDeleteConfirm(false);
    setRowToDelete(null);
  };
  
  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setRowToDelete(null);
  };
  
  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      addNotification('No rows selected for deletion', 'warning');
      return;
    }
    
    // Create set of indexes to delete for O(1) lookup
    const indexesToDelete = new Set(selectedRows);
    
    // Filter out selected rows
    const updatedData = data.filter((_, index) => !indexesToDelete.has(index));
    
    // Save changes
    saveChangesAndUpdateHistory(updatedData);
    
    // Update chart data
    prepareChartData(updatedData, columns);
    
    // Update favorites - remove deleted favorites and adjust indexes
    let newFavorites = favoriteRows.filter(i => !indexesToDelete.has(i));
    
    // Adjust indexes - for each deleted index, decrement favorites that are greater
    selectedRows.sort((a, b) => a - b).forEach(deletedIndex => {
      newFavorites = newFavorites.map(i => i > deletedIndex ? i - 1 : i);
    });
    
    setFavoriteRows(newFavorites);
    localStorage.setItem('favoriteRows', JSON.stringify(newFavorites));
    
    // Reset selection
    setSelectedRows([]);
    setSelectAll(false);
    
    addNotification(`${selectedRows.length} rows deleted successfully`, 'success');
  };
  
  // Handle input change
  const handleInputChange = (e, columnName) => {
    setNewRow({
      ...newRow,
      [columnName]: e.target.value
    });
  };
  
  // Toggle select all rows
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      // Select all visible/filtered rows on current page
      const startIndex = (currentPage - 1) * pageSize;
      const endIndex = Math.min(startIndex + pageSize, filteredData.length);
      const pageIndexes = Array.from(
        { length: endIndex - startIndex }, 
        (_, i) => startIndex + i
      );
      setSelectedRows(pageIndexes);
    }
    setSelectAll(!selectAll);
  };
  
  // Toggle select row
  const toggleSelectRow = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter(i => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };
  
  // Handle filter change
  const handleFilterChange = (column, value) => {
    setFilters({
      ...filters,
      [column]: value
    });
    setCurrentPage(1); // Reset to first page on filter change
  };
  
  // Clear all filters
  const clearAllFilters = () => {
    const emptyFilters = {};
    columns.forEach(column => {
      emptyFilters[column] = '';
    });
    setFilters(emptyFilters);
    addNotification('All filters cleared', 'info');
  };
  
  // Toggle column visibility
  const toggleColumnVisibility = (column) => {
    if (hiddenColumns.includes(column)) {
      setHiddenColumns(hiddenColumns.filter(col => col !== column));
    } else {
      setHiddenColumns([...hiddenColumns, column]);
    }
    
    // Save to localStorage
    localStorage.setItem('hiddenColumns', JSON.stringify(
      hiddenColumns.includes(column) 
        ? hiddenColumns.filter(col => col !== column)
        : [...hiddenColumns, column]
    ));
  };
  
  // Show all columns
  const showAllColumns = () => {
    setHiddenColumns([]);
    localStorage.setItem('hiddenColumns', JSON.stringify([]));
    addNotification('All columns are now visible', 'success');
  };
  
  // Request sort
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  // Undo action
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const previousData = dataHistory[newIndex];
      setData(previousData);
      localStorage.setItem('excelData', JSON.stringify(previousData));
      addNotification('Undo successful', 'info');
    } else {
      addNotification('Nothing to undo', 'warning');
    }
  };
  
  // Redo action
  const redo = () => {
    if (historyIndex < dataHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextData = dataHistory[newIndex];
      setData(nextData);
      localStorage.setItem('excelData', JSON.stringify(nextData));
      addNotification('Redo successful', 'info');
    } else {
      addNotification('Nothing to redo', 'warning');
    }
  };
  
  // Apply sorting to data
  const sortedData = React.useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle numeric comparison
        if (!isNaN(aValue) && !isNaN(bValue)) {
          return sortConfig.direction === 'ascending' 
            ? parseFloat(aValue) - parseFloat(bValue)
            : parseFloat(bValue) - parseFloat(aValue);
        }
        
        // Handle string comparison (case-insensitive)
        const aString = String(aValue).toLowerCase();
        const bString = String(bValue).toLowerCase();
        
        if (aString < bString) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aString > bString) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [data, sortConfig]);
  
  // Apply filtering to data
  const filteredData = React.useMemo(() => {
    return sortedData.filter(row => {
      // Search filter
      const matchesSearch = Object.values(row).some(value => 
        value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      if (!matchesSearch) return false;
      
      // Column filters
      for (const column in filters) {
        if (filters[column] && row[column]) {
          const rowValue = row[column].toString().toLowerCase();
          const filterValue = filters[column].toLowerCase();
          
          if (!rowValue.includes(filterValue)) {
            return false;
          }
        }
      }
      
      return true;
    });
  }, [sortedData, searchTerm, filters]);
  
  // Paginate data
  const paginatedData = React.useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredData.slice(startIndex, startIndex + pageSize);
  }, [filteredData, currentPage, pageSize]);
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / pageSize);
  
  // Visible columns (excluding hidden ones)
  const visibleColumns = columns.filter(column => !hiddenColumns.includes(column));
  
  return (
    // <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
    <div className={`min-h-screen w-full ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>

      {/* Header */}
      <header className={`${isDarkMode ? 'bg-gray-800 shadow-gray-700' : 'bg-white shadow-gray-200'} shadow`}>
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <FileSpreadsheet className={`h-6 w-6 mr-2 ${isDarkMode ? 'text-blue-400' : 'text-indigo-600'}`} />
            <h1 className="text-2xl font-bold">
              Excel Data Manager
            </h1>
            
            {sheets.length > 0 && (
              <div className="ml-6 relative">
                <select
                  value={activeSheet}
                  onChange={(e) => changeSheet(e.target.value)}
                  className={`pl-3 pr-10 py-1 text-sm rounded-md border ${
                    isDarkMode 
                      ? 'bg-gray-700 border-gray-600 text-white' 
                      : 'bg-white border-gray-300 text-gray-700'
                  } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                >
                  {sheets.map(sheet => (
                    <option key={sheet} value={sheet}>{sheet}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2 rounded-full ${
                  isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                } relative`}
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
              
              {showNotifications && (
                <div className={`absolute right-0 mt-2 w-80 ${
                  isDarkMode 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
                } rounded-md shadow-lg border overflow-hidden z-10`}>
                  <div className={`${
                    isDarkMode ? 'border-gray-700' : 'border-gray-200'
                  } border-b px-4 py-2 flex justify-between items-center`}>
                    <h3 className="font-medium">Notifications</h3>
                    <button
                      onClick={() => setNotifications([])}
                      className={`text-xs ${
                        isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      Clear all
                    </button>
                  </div>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-4 px-4 text-center text-sm text-gray-500">
                        No notifications
                      </div>
                    ) : (
                      notifications.map(notification => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 ${notification.read ? 'opacity-70' : ''} ${
                            isDarkMode ? 'border-gray-700' : 'border-gray-100'
                          } border-b flex items-start`}
                        >
                          <div className="flex-shrink-0 mr-3 mt-1">
                            {notification.type === 'success' && <Info className="h-5 w-5 text-green-500" />}
                            {notification.type === 'error' && <AlertTriangle className="h-5 w-5 text-red-500" />}
                            {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                            {notification.type === 'info' && <Info className="h-5 w-5 text-blue-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm mb-1">{notification.message}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(notification.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                          <button
                            onClick={() => dismissNotification(notification.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {isDarkMode ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>
            
            {/* User profile */}
            <div className="flex items-center">
              <span className={`mr-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {user}
              </span>
              <button 
                onClick={handleLogout}
                className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
                  isDarkMode
                    ? 'text-white bg-red-700 hover:bg-red-800'
                    : 'text-white bg-red-600 hover:bg-red-700'
                }`}
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-full mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-4 sm:px-0">
          {/* Status message */}
          {statusMessage.text && (
            <div className={`mb-4 p-3 rounded-md ${
              statusMessage.type === 'error'
                ? 'bg-red-100 border border-red-200 text-red-700'
                : statusMessage.type === 'success'
                ? 'bg-green-100 border border-green-200 text-green-700'
                : 'bg-blue-100 border border-blue-200 text-blue-700'
            }`}>
              <p className="flex items-center">
                {statusMessage.type === 'error' && <AlertTriangle className="h-5 w-5 mr-2" />}
                {statusMessage.type === 'success' && <Info className="h-5 w-5 mr-2" />}
                {statusMessage.type !== 'error' && statusMessage.type !== 'success' && <Info className="h-5 w-5 mr-2" />}
                {statusMessage.text}
              </p>
            </div>
          )}
          
          {/* Actions Toolbar */}
          <div className={`${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } shadow rounded-lg mb-6`}>
            <div className="px-4 py-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Left side actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className={`${
                      isDarkMode
                        ? 'bg-indigo-700 hover:bg-indigo-800'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } text-white font-medium py-2 px-4 rounded inline-flex items-center`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    <span>Upload Excel</span>
                    <input 
                      ref={fileInputRef}
                      type="file" 
                      className="hidden" 
                      accept=".xlsx, .xls" 
                      onChange={handleFileUpload} 
                    />
                  </button>
                  
                  <button
                    onClick={exportToExcel}
                    className={`${
                      isDarkMode
                        ? 'bg-green-700 hover:bg-green-800'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white font-medium py-2 px-4 rounded inline-flex items-center`}
                    disabled={data.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    <span>Export</span>
                  </button>
                  
                  <button
                    onClick={handleAddRow}
                    className={`${
                      isDarkMode
                        ? 'bg-blue-700 hover:bg-blue-800'
                        : 'bg-blue-600 hover:bg-blue-700'
                    } text-white font-medium py-2 px-4 rounded inline-flex items-center`}
                    disabled={columns.length === 0}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>Add Row</span>
                  </button>
                  
                  <button
                    onClick={handleBulkDelete}
                    className={`${
                      isDarkMode
                        ? 'bg-red-700 hover:bg-red-800'
                        : 'bg-red-600 hover:bg-red-700'
                    } text-white font-medium py-2 px-4 rounded inline-flex items-center ${
                      selectedRows.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    disabled={selectedRows.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Delete {selectedRows.length > 0 ? `(${selectedRows.length})` : ''}</span>
                  </button>
                </div>
                
                {/* Right side actions */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                    <input
                      type="text"
                      placeholder="Search data..."
                      className={`pl-10 pr-4 py-2 rounded-md ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      value={searchTerm}
                      onChange={handleSearch}
                    />
                  </div>
                  
                  <div className="relative">
                    <button
                      onClick={() => setIsFilterOpen(!isFilterOpen)}
                      className={`inline-flex items-center px-3 py-2 border rounded-md ${
                        Object.values(filters).some(filter => filter !== '')
                          ? isDarkMode
                            ? 'border-blue-500 bg-blue-700 text-white'
                            : 'border-blue-300 bg-blue-100 text-blue-800'
                          : isDarkMode
                            ? 'border-gray-600 bg-gray-700 text-gray-200'
                            : 'border-gray-300 bg-white text-gray-700'
                      }`}
                    >
                      <Filter className="h-4 w-4 mr-1" />
                      <span>Filters</span>
                      {Object.values(filters).some(filter => filter !== '') && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                          {Object.values(filters).filter(filter => filter !== '').length}
                        </span>
                      )}
                    </button>
                    
                    {isFilterOpen && (
                      <div className={`absolute right-0 mt-2 p-4 w-80 ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                      } shadow-lg rounded-md border z-10`}>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Filter Data</h3>
                          <button
                            onClick={clearAllFilters}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Clear All
                          </button>
                        </div>
                        
                        <div className="max-h-80 overflow-y-auto">
                          {columns.map(column => (
                            <div key={column} className="mb-3">
                              <label className={`block text-sm font-medium mb-1 ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-700'
                              }`}>
                                {column}
                              </label>
                              <input
                                type="text"
                                value={filters[column] || ''}
                                onChange={(e) => handleFilterChange(column, e.target.value)}
                                className={`w-full px-3 py-1.5 text-sm rounded-md border ${
                                  isDarkMode
                                    ? 'bg-gray-700 border-gray-600 text-white'
                                    : 'bg-white border-gray-300 text-gray-900'
                                } focus:outline-none focus:ring-1 focus:ring-indigo-500`}
                                placeholder={`Filter by ${column}...`}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="relative" ref={columnSettingsRef}>
                    <button
                      onClick={() => setShowColumnSettings(!showColumnSettings)}
                      className={`inline-flex items-center px-3 py-2 border rounded-md ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-200 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      <span>Columns</span>
                    </button>
                    
                    {showColumnSettings && (
                      <div className={`absolute right-0 mt-2 p-4 w-64 ${
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700'
                          : 'bg-white border-gray-200'
                      } shadow-lg rounded-md border z-10`}>
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="font-medium">Column Visibility</h3>
                          <button
                            onClick={showAllColumns}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            Show All
                          </button>
                        </div>
                        
                        <div className="max-h-64 overflow-y-auto">
                          {columns.map(column => (
                            <div key={column} className="flex items-center py-1.5">
                              <input
                                type="checkbox"
                                id={`column-${column}`}
                                checked={!hiddenColumns.includes(column)}
                                onChange={() => toggleColumnVisibility(column)}
                                className={`h-4 w-4 ${
                                  isDarkMode
                                    ? 'bg-gray-700 border-gray-600'
                                    : 'bg-white border-gray-300'
                                } rounded focus:ring-indigo-500 text-indigo-600`}
                              />
                              <label
                                htmlFor={`column-${column}`}
                                className={`ml-2 block text-sm ${
                                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                }`}
                              >
                                {column}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <button
                      onClick={undo}
                      className={`p-1 rounded-l-md border ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={historyIndex <= 0}
                      title="Undo"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                    </button>
                    <button
                      onClick={redo}
                      className={`p-1 rounded-r-md border-t border-r border-b ${
                        isDarkMode
                          ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                      } ${historyIndex >= dataHistory.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                      disabled={historyIndex >= dataHistory.length - 1}
                      title="Redo"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveView('table')}
                      className={`p-1.5 rounded-md ${
                        activeView === 'table'
                          ? isDarkMode
                            ? 'bg-gray-700 text-blue-400'
                            : 'bg-indigo-100 text-indigo-700'
                          : isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Table View"
                    >
                      <Grid className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => setActiveView('chart')}
                      className={`p-1.5 rounded-md ${
                        activeView === 'chart'
                          ? isDarkMode
                            ? 'bg-gray-700 text-blue-400'
                            : 'bg-indigo-100 text-indigo-700'
                          : isDarkMode
                            ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      title="Chart View"
                    >
                      <BarChart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Add/Edit Row Form */}
          {isAddingRow && (
            <div className={`mb-6 p-6 rounded-lg shadow ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {editingIndex !== null ? 'Edit Row' : 'Add New Row'}
                </h3>
                <button
                  onClick={handleCancelAdd}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns.map((column) => (
                  <div key={column} className="mb-2">
                    <label className={`block text-sm font-medium mb-1 ${
                      isDarkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {column}
                    </label>
                    <input
                      type="text"
                      className={`w-full px-3 py-2 rounded-md ${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      } border focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                      value={newRow[column] || ''}
                      onChange={(e) => handleInputChange(e, column)}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className={`${
                    isDarkMode
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                  } py-2 px-4 rounded mr-3`}
                  onClick={handleCancelAdd}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`${
                    isDarkMode
                      ? 'bg-indigo-700 hover:bg-indigo-800'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  } text-white py-2 px-4 rounded flex items-center`}
                  onClick={handleSaveNewRow}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            </div>
          )}
          
          {/* Content View - Table or Chart */}
          <div className={`rounded-lg shadow ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            {activeView === 'table' ? (
              data.length > 0 ? (
                <>
                  {/* Table View */}
                  <div className="overflow-x-auto">
                    <table className={`min-w-full divide-y ${
                      isDarkMode ? 'divide-gray-700' : 'divide-gray-200'
                    }`}>
                      <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                        <tr>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider w-10`}>
                            <input
                              type="checkbox"
                              checked={selectAll}
                              onChange={toggleSelectAll}
                              className={`h-4 w-4 ${
                                isDarkMode
                                  ? 'bg-gray-700 border-gray-600'
                                  : 'bg-white border-gray-300'
                              } rounded focus:ring-indigo-500 text-indigo-600`}
                            />
                          </th>
                          <th className={`px-4 py-3 text-left text-xs font-medium ${
                            isDarkMode ? 'text-gray-300' : 'text-gray-500'
                          } uppercase tracking-wider w-10`}>
                            <span className="sr-only">Favorite</span>
                          </th>
                          {visibleColumns.map((column) => (
                            <th
                              key={column}
                              scope="col"
                              className={`px-4 py-3 text-left text-xs font-medium ${
                                isDarkMode ? 'text-gray-300' : 'text-gray-500'
                              } uppercase tracking-wider cursor-pointer hover:bg-opacity-50 ${
                                isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'
                              }`}
                              onClick={() => requestSort(column)}
                            >
                              <div className="flex items-center">
                                <span>{column}</span>
                                <span className="ml-1">
                                  {sortConfig.key === column ? (
                                    sortConfig.direction === 'ascending' ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )
                                  ) : (
                                    <ArrowUpDown className="h-4 w-4 opacity-50" />
                                  )}
                                </span>
                              </div>
                            </th>
                          ))}
                          <th 
                            scope="col" 
                            className={`px-4 py-3 text-right text-xs font-medium ${
                              isDarkMode ? 'text-gray-300' : 'text-gray-500'
                            } uppercase tracking-wider w-24`}
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${
                        isDarkMode ? 'bg-gray-800 divide-y divide-gray-700' : 'bg-white divide-y divide-gray-200'
                      }`}>
                        {paginatedData.map((row, rowIndex) => {
                          const dataIndex = (currentPage - 1) * pageSize + rowIndex;
                          return (
                            <tr 
                              key={dataIndex} 
                              className={`
                                ${selectedRows.includes(dataIndex) 
                                  ? isDarkMode ? 'bg-indigo-900 bg-opacity-40' : 'bg-indigo-50' 
                                  : ''
                                }
                                ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}
                              `}
                            >
                              <td className="px-4 py-3 whitespace-nowrap w-10">
                                <input
                                  type="checkbox"
                                  checked={selectedRows.includes(dataIndex)}
                                  onChange={() => toggleSelectRow(dataIndex)}
                                  className={`h-4 w-4 ${
                                    isDarkMode
                                      ? 'bg-gray-700 border-gray-600'
                                      : 'bg-white border-gray-300'
                                  } rounded focus:ring-indigo-500 text-indigo-600`}
                                />
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap w-10">
                                <button 
                                  onClick={() => toggleFavorite(dataIndex)}
                                  className={`text-${favoriteRows.includes(dataIndex) ? 'yellow' : 'gray'}-400 hover:text-yellow-500`}
                                >
                                  {favoriteRows.includes(dataIndex) ? (
                                    <Star className="h-5 w-5 fill-current text-yellow-400" />
                                  ) : (
                                    <StarOff className="h-5 w-5" />
                                  )}
                                </button>
                              </td>
                              {visibleColumns.map((column) => (
                                <td
                                  key={`${dataIndex}-${column}`}
                                  className={`px-4 py-3 whitespace-nowrap text-sm ${
                                    isDarkMode ? 'text-gray-300' : 'text-gray-500'
                                  }`}
                                >
                                  {row[column]}
                                </td>
                              ))}
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  onClick={() => handleEdit(dataIndex)}
                                  className={`text-${isDarkMode ? 'blue' : 'indigo'}-600 hover:text-${isDarkMode ? 'blue' : 'indigo'}-900 mx-1`}
                                  title="Edit"
                                >
                                  <Edit2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(dataIndex)}
                                  className="text-red-600 hover:text-red-900 mx-1"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {}}
                                  className={`text-${isDarkMode ? 'gray' : 'gray'}-600 hover:text-${isDarkMode ? 'gray' : 'gray'}-900 mx-1`}
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Pagination */}
                  <div className={`px-4 py-3 flex items-center justify-between ${
                    isDarkMode ? 'border-t border-gray-700' : 'border-t border-gray-200'
                  }`}>
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-white hover:bg-gray-50 text-gray-700'
                        } relative inline-flex items-center px-4 py-2 border ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        } text-sm font-medium rounded-md ${
                          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`${
                          isDarkMode
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            : 'bg-white hover:bg-gray-50 text-gray-700'
                        } ml-3 relative inline-flex items-center px-4 py-2 border ${
                          isDarkMode ? 'border-gray-600' : 'border-gray-300'
                        } text-sm font-medium rounded-md ${
                          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                          Showing{' '}
                          <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span>{' '}
                          to{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * pageSize, filteredData.length)}
                          </span>{' '}
                          of{' '}
                          <span className="font-medium">{filteredData.length}</span>{' '}
                          results
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-700'}`}>
                          Rows per page:
                        </span>
                        <select
                          value={pageSize}
                          onChange={e => {
                            setPageSize(Number(e.target.value));
                            setCurrentPage(1); // Reset to first page
                          }}
                          className={`${
                            isDarkMode
                              ? 'bg-gray-700 border-gray-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700'
                          } text-sm border rounded-md py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                        >
                          {[10, 25, 50, 100].map(size => (
                            <option key={size} value={size}>
                              {size}
                            </option>
                          ))}
                        </select>
                        
                        <nav className="relative z-0 inline-flex shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(1)}
                            disabled={currentPage === 1}
                            className={`${
                              isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                          } relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          } text-sm font-medium ${
                            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="sr-only">First page</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`${
                            isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                          } relative inline-flex items-center px-2 py-2 border ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          } text-sm font-medium ${
                            currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        {/* Page numbers */}
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          let pageNumber;
                          if (totalPages <= 5) {
                            pageNumber = i + 1;
                          } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                          } else {
                            pageNumber = currentPage - 2 + i;
                          }
                          
                          if (pageNumber <= totalPages) {
                            return (
                              <button
                                key={i}
                                onClick={() => setCurrentPage(pageNumber)}
                                className={`${
                                  currentPage === pageNumber
                                    ? isDarkMode
                                      ? 'bg-indigo-600 text-white'
                                      : 'bg-indigo-50 border-indigo-500 text-indigo-600'
                                    : isDarkMode
                                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                      : 'bg-white hover:bg-gray-50 text-gray-700'
                                } relative inline-flex items-center px-4 py-2 border ${
                                  isDarkMode ? 'border-gray-600' : 'border-gray-300'
                                } text-sm font-medium`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                          return null;
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`${
                            isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                          } relative inline-flex items-center px-2 py-2 border ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          } text-sm font-medium ${
                            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className={`${
                            isDarkMode
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                              : 'bg-white hover:bg-gray-50 text-gray-700'
                          } relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                            isDarkMode ? 'border-gray-600' : 'border-gray-300'
                          } text-sm font-medium ${
                            currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <span className="sr-only">Last page</span>
                          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M11.293 14.707a1 1 0 010-1.414L14.586 10l-3.293-3.293a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <FileText className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>No data</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Upload an Excel file or add data manually to get started.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className={`inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                      isDarkMode
                        ? 'bg-indigo-700 hover:bg-indigo-800'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Excel
                  </button>
                </div>
              </div>
            )
          ) : (
            // Chart View
            data.length > 0 ? (
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                    Data Visualization
                  </h3>
                  <div className="flex items-center space-x-2">
                    <select
                      value={chartType}
                      onChange={e => setChartType(e.target.value)}
                      className={`${
                        isDarkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700'
                      } text-sm rounded-md border py-1 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="pie">Pie Chart</option>
                    </select>
                    
                    <button
                      onClick={() => {}}
                      className={`p-1 rounded-md ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Refresh Chart"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    
                    <button
                      onClick={() => {}}
                      className={`p-1 rounded-md ${
                        isDarkMode
                          ? 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                      title="Chart Settings"
                    >
                      <Sliders className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                <div className={`${
                  isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
                } p-4 rounded-lg h-96 flex items-center justify-center`}>
                  {chartData.labels.length > 0 ? (
                    <div className="text-center w-full h-full">
                      <p className={`text-lg font-medium mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Sample Chart Visualization<br/>
                        <span className="text-sm font-normal">(In a real implementation, a proper chart library would be used)</span>
                      </p>
                      <div className="flex flex-col items-center justify-center h-4/5">
                        <div className={`w-full h-full rounded border ${isDarkMode ? 'border-gray-700' : 'border-gray-300'} p-4`}>
                          {/* Chart Placeholder - In a real app, you'd use a chart library */}
                          <div className="flex h-full items-end justify-around">
                            {chartData.labels.map((label, index) => (
                              <div key={index} className="flex flex-col items-center">
                                <div 
                                  className="w-12 bg-indigo-500" 
                                  style={{ 
                                    height: `${(chartData.datasets[0].data[index] / Math.max(...chartData.datasets[0].data)) * 100}%`,
                                    minHeight: '10px' 
                                  }}
                                ></div>
                                <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                  {label.length > 10 ? label.substring(0, 10) + '...' : label}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <BarChart className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                      <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>No chart data available</h3>
                      <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Make sure your data contains numeric values.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <BarChart className={`mx-auto h-12 w-12 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>No data to visualize</h3>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Upload an Excel file to generate charts.
                </p>
              </div>
            )
          )}
        </div>
      </div>
    </main>
    
    {/* Confirmation Dialog */}
    {showDeleteConfirm && (
      <div className="fixed inset-0 overflow-y-auto z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        <div className={`relative ${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-lg max-w-md w-full mx-auto shadow-xl overflow-hidden`}>
          <div className="px-6 py-5">
            <h3 className={`text-lg font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
              Confirm Deletion
            </h3>
            <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Are you sure you want to delete this row? This action cannot be undone.
            </p>
          </div>
          <div className={`px-6 py-4 flex justify-end ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} border-t ${
            isDarkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <button
              type="button"
              className={`${
                isDarkMode
                  ? 'bg-gray-600 hover:bg-gray-500 text-gray-300'
                  : 'bg-white hover:bg-gray-50 text-gray-700'
              } px-4 py-2 text-sm font-medium rounded-md mr-3`}
              onClick={cancelDelete}
            >
              Cancel
            </button>
            <button
              type="button"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm font-medium rounded-md"
              onClick={confirmDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    )}

    {/* Additional features that could be implemented */}
    {/* 
      1. Row Detail View Modal
      2. Export Options Menu (CSV, PDF, etc.)
      3. Keyboard Shortcuts Helper
      4. Advanced Analytics Panel
      5. Custom Column Settings (width, alignment, etc)
      6. Data Import/Export History
      7. Collaboration Features (comments, sharing, etc)
    */}
  </div>
);
};

export default Dashboard2;