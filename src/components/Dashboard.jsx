import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, Upload, LogOut, FileText, Search } from 'lucide-react';
import * as XLSX from 'xlsx';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newRow, setNewRow] = useState({});
  const [columns, setColumns] = useState([]);
  const [user, setUser] = useState('');
  
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedData = localStorage.getItem('excelData');
    
    if (storedUser) {
      setUser(storedUser);
    } else {
      // Redirect if not logged in
      window.location.href = '/';
    }
    
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setData(parsedData);
      
      // Extract column names from first row
      if (parsedData.length > 0) {
        setColumns(Object.keys(parsedData[0]));
        setNewRow(Object.keys(parsedData[0]).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {}));
      }
    }
  }, []);
  
  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    // Redirect to login
    window.location.href = '/';
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const binaryString = event.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(worksheet);
      
      // Save to state and localStorage
      setData(parsedData);
      localStorage.setItem('excelData', JSON.stringify(parsedData));
      
      // Extract column names
      if (parsedData.length > 0) {
        setColumns(Object.keys(parsedData[0]));
        setNewRow(Object.keys(parsedData[0]).reduce((acc, key) => {
          acc[key] = '';
          return acc;
        }, {}));
      }
    };
    
    reader.readAsBinaryString(file);
  };
  
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleAddRow = () => {
    setIsAddingRow(true);
  };
  
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
  
  const handleSaveNewRow = () => {
    // If editing existing row
    if (editingIndex !== null) {
      const updatedData = [...data];
      updatedData[editingIndex] = newRow;
      setData(updatedData);
      localStorage.setItem('excelData', JSON.stringify(updatedData));
      setEditingIndex(null);
    } else {
      // Adding new row
      const updatedData = [...data, newRow];
      setData(updatedData);
      localStorage.setItem('excelData', JSON.stringify(updatedData));
    }
    
    setIsAddingRow(false);
    // Reset form
    if (columns.length > 0) {
      setNewRow(columns.reduce((acc, key) => {
        acc[key] = '';
        return acc;
      }, {}));
    }
  };
  
  const handleEdit = (index) => {
    setEditingIndex(index);
    setIsAddingRow(true);
    setNewRow(data[index]);
  };
  
  const handleDelete = (index) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this row?');
    if (confirmDelete) {
      const updatedData = data.filter((_, i) => i !== index);
      setData(updatedData);
      localStorage.setItem('excelData', JSON.stringify(updatedData));
    }
  };
  
  const handleInputChange = (e, columnName) => {
    setNewRow({
      ...newRow,
      [columnName]: e.target.value
    });
  };
  
  // Filter data based on search term
  const filteredData = data.filter(row => {
    return Object.values(row).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  });
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-indigo-600" />
            Excel Data Manager
          </h1>
          <div className="flex items-center">
            <span className="mr-4 text-gray-600">Welcome, {user}</span>
            <button 
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            {/* Action Buttons */}
            <div className="flex justify-between mb-6">
              <div className="flex items-center">
                <label className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded inline-flex items-center cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  <span>Upload Excel</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    accept=".xlsx, .xls" 
                    onChange={handleFileUpload} 
                  />
                </label>
                
                <button 
                  onClick={handleAddRow}
                  className="ml-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center"
                  disabled={columns.length === 0}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Row
                </button>
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search data..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
            </div>
            
            {/* Add/Edit Row Form */}
            {isAddingRow && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingIndex !== null ? 'Edit Row' : 'Add New Row'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {columns.map((column) => (
                    <div key={column} className="mb-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {column}
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        value={newRow[column] || ''}
                        onChange={(e) => handleInputChange(e, column)}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded mr-2"
                    onClick={handleCancelAdd}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded"
                    onClick={handleSaveNewRow}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
            
            {/* Table */}
            {data.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {columns.map((column) => (
                        <th
                          key={column}
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {column}
                        </th>
                      ))}
                      <th scope="col" className="relative px-6 py-3">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        {columns.map((column) => (
                          <td
                            key={`${rowIndex}-${column}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {row[column]}
                          </td>
                        ))}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(rowIndex)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rowIndex)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No data</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Upload an Excel file or add data manually to get started.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;