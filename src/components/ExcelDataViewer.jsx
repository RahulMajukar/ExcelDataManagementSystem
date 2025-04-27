import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileSpreadsheet,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Filter,
  Download,
  RefreshCw,
  ArrowLeft,
  Database,
  X,
  Edit2,
  Trash2,
  PlusCircle,
  Save,
  CheckCircle,
  Layers
} from 'lucide-react';

const StateStreetLogo = () => (
  <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="200" height="40" rx="5" fill="#05386B" />
    <text x="120" y="48" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">STATE STREET</text>
    <path d="M30 40 H55 M30 50 H45" stroke="white" strokeWidth="2" />
    <path d="M210 40 H185 M210 50 H195" stroke="white" strokeWidth="2" />
  </svg>
);

const ExcelDataViewer = () => {
  const { tableName } = useParams();
  const navigate = useNavigate();

  // State variables
  const [loading, setLoading] = useState(true);
  const [tableData, setTableData] = useState({
    table: '',
    columns: [],
    totalRows: 0,
    page: 1,
    limit: 50,
    data: []
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({});
  const [fileInfo, setFileInfo] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Edit mode states
  const [editMode, setEditMode] = useState(false);
  const [editingRowIndex, setEditingRowIndex] = useState(null);
  const [editRowData, setEditRowData] = useState({});
  
  // Add row state
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowData, setNewRowData] = useState({});
  
  // Sheet switching
  const [availableSheets, setAvailableSheets] = useState([]);
  const [sheetSelectorOpen, setSheetSelectorOpen] = useState(false);

  // Fetch data on initial load and when pagination/filtering changes
  useEffect(() => {
    fetchData();
    fetchFileInfo();
  }, [tableName, currentPage, pageSize, sortColumn, sortDirection]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`http://localhost:8080/api/excel/table/${tableName}`, {
        params: {
          page: currentPage,
          limit: pageSize,
          sort: sortColumn ? `${sortColumn}:${sortDirection}` : undefined,
          search: searchTerm || undefined
        }
      });
      
      setTableData(response.data);
      
      // Initialize new row data structure based on columns
      if (response.data.columns && response.data.columns.length > 0) {
        const initialNewRow = {};
        response.data.columns.forEach(col => {
          initialNewRow[col.name] = '';
        });
        setNewRowData(initialNewRow);
      }
    } catch (err) {
      console.error('Error fetching table data:', err);
      setError(err.response?.data?.message || 'Error loading table data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFileInfo = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/excel/mapping/${tableName}`);
      setFileInfo(response.data);
      
      // After getting fileInfo, fetch all sheets for this file
      if (response.data.excelFile) {
        fetchAvailableSheets(response.data.excelFile.id);
      }
    } catch (err) {
      console.error('Error fetching file info:', err);
      // Non-critical error, so we don't set the main error state
    }
  };

  const fetchAvailableSheets = async (fileId) => {
    try {
      const response = await axios.get(`http://localhost:8080/api/excel/files/${fileId}`);
      if (response.data && response.data.sheetMappings) {
        setAvailableSheets(response.data.sheetMappings);
      }
    } catch (err) {
      console.error('Error fetching sheets:', err);
    }
  };

  const handleSwitchSheet = (newTableName) => {
    // Navigate to the selected table
    navigate(`/view/${newTableName}`);
    setSheetSelectorOpen(false);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page
    fetchData();
  };

  const handleSortChange = (column) => {
    if (sortColumn === column) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new sort column and default to ascending
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (column, value) => {
    setFilters({
      ...filters,
      [column]: value
    });
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page
    fetchData();
    setIsFilterOpen(false);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
    fetchData();
    setIsFilterOpen(false);
  };

  const exportToCSV = async () => {
    try {
      // API endpoint would generate and return a CSV file
      const response = await axios.get(`http://localhost:8080/api/excel/export/${tableName}`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${tableName}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting data:', err);
      setError('Failed to export data');
    }
  };

  const goBack = () => {
    navigate('/');
  };

  // Edit row functions
  const startEditRow = (rowIndex) => {
    setEditMode(true);
    setEditingRowIndex(rowIndex);
    setEditRowData({...tableData.data[rowIndex]});
    setIsAddingRow(false);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setEditingRowIndex(null);
    setEditRowData({});
  };

  const handleEditInputChange = (columnName, value) => {
    setEditRowData({
      ...editRowData,
      [columnName]: value
    });
  };

  const saveEditedRow = async () => {
    try {
      // Call API to update the row
      const response = await axios.put(`http://localhost:8080/api/excel/table/${tableName}/rows/${editRowData.id}`, editRowData);
      
      // Update local state
      const updatedData = [...tableData.data];
      updatedData[editingRowIndex] = editRowData;
      setTableData({
        ...tableData,
        data: updatedData
      });
      
      // Exit edit mode
      setEditMode(false);
      setEditingRowIndex(null);
      setEditRowData({});
      
      // Show success message
      setSuccessMessage('Row updated successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating row:', err);
      setError(err.response?.data?.message || 'Error updating row');
    }
  };

  // Add row functions
  const startAddRow = () => {
    setIsAddingRow(true);
    setEditMode(false);
    setEditingRowIndex(null);
    
    // Reset new row data
    const initialNewRow = {};
    tableData.columns.forEach(col => {
      initialNewRow[col.name] = '';
    });
    setNewRowData(initialNewRow);
  };

  const cancelAddRow = () => {
    setIsAddingRow(false);
    setNewRowData({});
  };

  const handleNewRowInputChange = (columnName, value) => {
    setNewRowData({
      ...newRowData,
      [columnName]: value
    });
  };

  const saveNewRow = async () => {
    try {
      // Call API to add the row
      const response = await axios.post(`http://localhost:8080/api/excel/table/${tableName}/rows`, newRowData);
      
      // Update local state
      const updatedData = [...tableData.data, response.data];
      setTableData({
        ...tableData,
        data: updatedData,
        totalRows: tableData.totalRows + 1
      });
      
      // Exit add mode
      setIsAddingRow(false);
      setNewRowData({});
      
      // Show success message
      setSuccessMessage('Row added successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error adding row:', err);
      setError(err.response?.data?.message || 'Error adding row');
    }
  };

  // Delete row function
  const deleteRow = async (rowIndex, rowId) => {
    if (window.confirm('Are you sure you want to delete this row? This action cannot be undone.')) {
      try {
        // Call API to delete the row
        await axios.delete(`http://localhost:8080/api/excel/table/${tableName}/rows/${rowId}`);
        
        // Update local state
        const updatedData = tableData.data.filter((_, index) => index !== rowIndex);
        setTableData({
          ...tableData,
          data: updatedData,
          totalRows: tableData.totalRows - 1
        });
        
        // Show success message
        setSuccessMessage('Row deleted successfully');
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error('Error deleting row:', err);
        setError(err.response?.data?.message || 'Error deleting row');
      }
    }
  };

  // Pagination helpers
  const totalPages = Math.ceil(tableData.totalRows / pageSize);
  
  const getPaginationRange = () => {
    const maxButtons = 5;
    
    // Calculate range of buttons to show
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }
    
    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-40 h-12 mr-4">
              <StateStreetLogo />
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Excel Data Viewer</h1>
          </div>
          <div>
            <button
              onClick={goBack}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Files
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-blue-50">
            <div className="flex flex-wrap justify-between items-center">
              <div className="flex items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {tableData.table || tableName}
                  </h2>
                  {fileInfo && (
                    <p className="mt-1 text-sm text-gray-600">
                      From Excel file: <span className="font-medium">{fileInfo.excelFile?.originalFilename}</span>
                      {fileInfo.sheetName && (
                        <>, Sheet: <span className="font-medium">{fileInfo.sheetName}</span></>
                      )}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500">
                    {tableData.totalRows > 0 ? 
                      `Showing ${tableData.data?.length || 0} of ${tableData.totalRows} rows` : 
                      'No data available'}
                  </p>
                </div>
                
                {/* Sheet selector dropdown */}
                {availableSheets.length > 1 && (
                  <div className="ml-6 relative">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      onClick={() => setSheetSelectorOpen(!sheetSelectorOpen)}
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Switch Sheet
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </button>
                    
                    {sheetSelectorOpen && (
                      <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1" role="menu" aria-orientation="vertical">
                          {availableSheets.map(sheet => (
                            <button
                              key={sheet.id}
                              className={`block w-full text-left px-4 py-2 text-sm ${
                                sheet.tableName === tableName 
                                  ? 'bg-indigo-100 text-indigo-900 font-medium' 
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                              onClick={() => handleSwitchSheet(sheet.tableName)}
                            >
                              {sheet.sheetName}
                              {sheet.tableName === tableName && (
                                <CheckCircle className="h-4 w-4 ml-2 inline-block text-indigo-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-4 sm:mt-0 flex flex-wrap space-x-2">
                <button
                  onClick={startAddRow}
                  className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  disabled={isAddingRow || editMode}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Row
                </button>
                
                <button
                  onClick={exportToCSV}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </button>
                
                <button
                  onClick={fetchData}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </button>
                
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    Object.keys(filters).length > 0 
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {Object.keys(filters).length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-indigo-500 text-white">
                      {Object.keys(filters).length}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Search and pagination controls */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Search data..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button type="submit" className="hidden">Search</button>
              </form>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">
                  Rows per page:
                </span>
                <select
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  className="border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 p-4 border-b border-green-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">{successMessage}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setSuccessMessage(null)}
                      className="inline-flex bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <span className="sr-only">Dismiss</span>
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
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
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Filter panel */}
          {isFilterOpen && (
            <div className="bg-gray-50 p-4 border-b border-gray-200">
              <div className="flex justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Filter Data</h3>
                <div>
                  <button
                    onClick={clearFilters}
                    className="mr-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tableData.columns && tableData.columns.map(column => (
                  <div key={column.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.name}
                    </label>
                    <input
                      type="text"
                      value={filters[column.name] || ''}
                      onChange={(e) => handleFilterChange(column.name, e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder={`Filter by ${column.name}...`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={applyFilters}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          )}

          {/* Add New Row Form */}
          {isAddingRow && (
            <div className="bg-green-50 p-4 border-b border-green-200">
              <div className="flex justify-between mb-4">
                <h3 className="text-sm font-medium text-green-800">Add New Row</h3>
                <button
                  onClick={cancelAddRow}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tableData.columns && tableData.columns.map(column => (
                  <div key={column.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {column.name}
                    </label>
                    <input
                      type="text"
                      value={newRowData[column.name] || ''}
                      onChange={(e) => handleNewRowInputChange(column.name, e.target.value)}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder={`Enter ${column.name}...`}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-4 flex justify-end">
                <button
                  onClick={cancelAddRow}
                  className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  onClick={saveNewRow}
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Table content */}
          {loading ? (
            <div className="py-12 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : tableData.data && tableData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                    {tableData.columns && tableData.columns.map(column => (
                      <th
                        key={column.name}
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange(column.name)}
                      >
                        <div className="flex items-center">
                          <span>{column.name}</span>
                          <span className="ml-1">
                            {sortColumn === column.name ? (
                              sortDirection === 'asc' ? (
                                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 15l7-7 7 7"></path>
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M19 9l-7 7-7-7"></path>
                                </svg>
                              )
                            ) : (
                              <ArrowUpDown className="h-4 w-4 text-gray-400" />
                            )}
                          </span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tableData.data.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-4 py-2 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => startEditRow(rowIndex)}
                            className="text-indigo-600 hover:text-indigo-900"
                            disabled={editMode || isAddingRow}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => deleteRow(rowIndex, row.id)}
                            className="text-red-600 hover:text-red-900"
                            disabled={editMode || isAddingRow}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                      {tableData.columns && tableData.columns.map(column => (
                        <td key={`${rowIndex}-${column.name}`} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {editMode && editingRowIndex === rowIndex ? (
                            <input
                              type="text"
                              value={editRowData[column.name] || ''}
                              onChange={(e) => handleEditInputChange(column.name, e.target.value)}
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          ) : (
                            row[column.name] !== null && row[column.name] !== undefined 
                              ? String(row[column.name]) 
                              : ''
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Edit mode action buttons */}
              {editMode && (
                <div className="bg-indigo-50 p-4 border-t border-indigo-200 flex justify-end">
                  <button 
                    onClick={cancelEdit}
                    className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveEditedRow}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 px-4 text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No data found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || Object.keys(filters).length > 0 ? 
                  'Try adjusting your search or filters.' : 
                  'This table does not contain any data.'}
              </p>
              {!searchTerm && Object.keys(filters).length === 0 && (
                <div className="mt-5">
                  <button
                    onClick={startAddRow}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add First Row
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {tableData.totalRows > 0 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * pageSize, tableData.totalRows)}
                    </span> of{' '}
                    <span className="font-medium">{tableData.totalRows}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border ${
                        currentPage === 1 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">First page</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M8.707 5.293a1 1 0 010 1.414L5.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 border ${
                        currentPage === 1 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    {getPaginationRange().map(pageNum => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border ${
                          currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 border ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border ${
                        currentPage === totalPages 
                          ? 'bg-gray-100 cursor-not-allowed border-gray-300 text-gray-400' 
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
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
          )}
        </div>
      </main>
    </div>
  );
};

export default ExcelDataViewer;