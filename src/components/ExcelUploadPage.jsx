import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Upload, 
  FileSpreadsheet, 
  AlertTriangle, 
  CheckCircle, 
  Database, 
  X,
  Save, 
  ArrowLeft,
  Loader
} from 'lucide-react';

const StateStreetLogo = () => (
  <svg viewBox="0 0 240 80" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="200" height="40" rx="5" fill="#05386B" />
    <text x="120" y="48" fontFamily="Arial" fontSize="22" fontWeight="bold" fill="white" textAnchor="middle">STATE STREET</text>
    <path d="M30 40 H55 M30 50 H45" stroke="white" strokeWidth="2" />
    <path d="M210 40 H185 M210 50 H195" stroke="white" strokeWidth="2" />
  </svg>
);

const ExcelUploadPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [sheets, setSheets] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [processingComplete, setProcessingComplete] = useState(false);
  const [processingResult, setProcessingResult] = useState(null);

  // Check if file was passed from the list page
  useEffect(() => {
    if (location.state?.file) {
      handleFileSelection(location.state.file);
    }
  }, [location.state]);

  const handleFileSelection = async (selectedFile) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setStatus({ type: 'info', message: 'Reading Excel sheets...' });
    setIsLoading(true);
    setSheets([]);
    setMappings([]);

    try {
      // Create form data to send the file
      const formData = new FormData();
      formData.append('file', selectedFile);

      // Get sheet names from the Excel file
      const response = await axios.post('http://localhost:8080/api/excel/sheets', formData);

      // Create default mappings
      const defaultMappings = response.data.map(sheetName => ({
        sheetName,
        tableName: sheetName.toLowerCase().replace(/\s+/g, '_') + '_table',
        selected: true
      }));

      setSheets(response.data);
      setMappings(defaultMappings);
      setStatus({ 
        type: 'success', 
        message: `Found ${response.data.length} sheets in the Excel file` 
      });
    } catch (error) {
      console.error('Error reading Excel file:', error);
      setStatus({ 
        type: 'error', 
        message: 'Error reading Excel file. Please make sure it\'s a valid Excel file.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileBrowse = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  };

  const handleTableNameChange = (index, value) => {
    const updatedMappings = [...mappings];
    updatedMappings[index].tableName = value;
    setMappings(updatedMappings);
  };

  const toggleSheetSelection = (index) => {
    const updatedMappings = [...mappings];
    updatedMappings[index].selected = !updatedMappings[index].selected;
    setMappings(updatedMappings);
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
  };

  const handleSubmit = async () => {
    if (!file || mappings.filter(m => m.selected).length === 0) {
      setStatus({
        type: 'error',
        message: 'Please select a file and at least one sheet to process'
      });
      return;
    }

    setIsUploading(true);
    setStatus({ type: 'info', message: 'Processing Excel file...' });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      formData.append('mappings', JSON.stringify(
        mappings.filter(m => m.selected)
      ));
      
      if (description) {
        formData.append('description', description);
      }

      // Send to backend
      const response = await axios.post('http://localhost:8080/api/excel/process', formData);

      // Success! Store the result 
      setProcessingResult(response.data);
      setProcessingComplete(true);
      
      setStatus({ 
        type: 'success', 
        message: `Excel file processed successfully! Created ${response.data.tablesCreated} tables with ${response.data.totalRowsInserted} rows.` 
      });
    } catch (error) {
      console.error('Error processing file:', error);
      setStatus({ 
        type: 'error', 
        message: `Error processing file: ${error.response?.data?.message || error.message}` 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const goBack = () => {
    navigate('/');
  };

  const viewProcessedData = () => {
    if (processingResult && processingResult.mappings && processingResult.mappings.length > 0) {
      // Navigate to the first table created
      navigate(`/view/${processingResult.mappings[0].tableName}`);
    } else {
      setStatus({ 
        type: 'error', 
        message: 'No tables were created during processing.' 
      });
    }
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
            <h1 className="text-2xl font-semibold text-gray-800">Excel Upload & Processing</h1>
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

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Processing complete view */}
          {processingComplete ? (
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-100 rounded-full p-3">
                  <CheckCircle className="h-12 w-12 text-green-600" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Processing Complete</h2>
              <p className="text-center text-gray-600 mb-6">
                Successfully processed {file.name} and created {processingResult.tablesCreated} tables.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-800 mb-3">Processing Summary</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span className="text-gray-600">Excel File:</span>
                    <span className="font-medium">{file.name}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Tables Created:</span>
                    <span className="font-medium">{processingResult.tablesCreated}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-gray-600">Total Rows Inserted:</span>
                    <span className="font-medium">{processingResult.totalRowsInserted}</span>
                  </li>
                </ul>
              </div>
              
              {processingResult.mappings && processingResult.mappings.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-3">Created Tables</h3>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                      {processingResult.mappings.map((mapping, index) => (
                        <li key={index} className="px-4 py-3">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-medium text-indigo-600">{mapping.tableName}</p>
                              <p className="text-sm text-gray-500">
                                From sheet: {mapping.sheetName} • {mapping.rowsInserted} rows inserted
                              </p>
                            </div>
                            <button
                              onClick={() => navigate(`/view/${mapping.tableName}`)}
                              className="text-xs bg-white border border-gray-300 rounded px-2 py-1 hover:bg-gray-50"
                            >
                              View Data
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={goBack}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Files
                </button>
                <button
                  onClick={viewProcessedData}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  View Processed Data
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* File Upload Section */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center mb-4">
                  <FileSpreadsheet className="h-6 w-6 text-indigo-600 mr-2" />
                  <h2 className="text-xl font-semibold">Step 1: Select Excel File</h2>
                </div>
                
                {!file ? (
                  <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                      <svg
                        className="mx-auto h-12 w-12 text-gray-400"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                        aria-hidden="true"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="file-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                        >
                          <span>Upload a file</span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            className="sr-only"
                            accept=".xlsx,.xls"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">Excel files only (.xlsx, .xls)</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center mt-2">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <FileSpreadsheet className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">{file.name}</h3>
                          <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                        <button
                          type="button"
                          className="ml-4 bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          onClick={() => {
                            setFile(null);
                            setSheets([]);
                            setMappings([]);
                            fileInputRef.current.value = '';
                          }}
                        >
                          <span className="sr-only">Remove file</span>
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={handleFileBrowse}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Change file
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Message */}
              {status.message && (
                <div className={`p-4 ${
                  status.type === 'error' 
                    ? 'bg-red-50 text-red-700 border-b border-red-200' 
                    : status.type === 'success'
                      ? 'bg-green-50 text-green-700 border-b border-green-200'
                      : 'bg-blue-50 text-blue-700 border-b border-blue-200'
                }`}>
                  <div className="flex items-center">
                    {status.type === 'error' && <AlertTriangle className="h-5 w-5 mr-2" />}
                    {status.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                    {status.type === 'info' && <Loader className="h-5 w-5 mr-2 animate-spin" />}
                    {status.message}
                  </div>
                </div>
              )}

              {/* Loading Indicator */}
              {isLoading && (
                <div className="flex justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              )}

              {/* Sheet Mapping Configuration */}
              {sheets.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center mb-4">
                    <Database className="h-6 w-6 text-indigo-600 mr-2" />
                    <h2 className="text-xl font-semibold">Step 2: Configure Sheet Mappings</h2>
                  </div>
                  
                  <p className="mb-4 text-sm text-gray-600">
                    Select which sheets to import and customize the PostgreSQL table names.
                  </p>
                  
                  <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                    <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-gray-700 px-2">
                      <div className="col-span-1">Include</div>
                      <div className="col-span-4">Excel Sheet</div>
                      <div className="col-span-7">PostgreSQL Table</div>
                    </div>
                    
                    {mappings.map((mapping, index) => (
                      <div 
                        key={index} 
                        className="grid grid-cols-12 gap-4 mb-2 items-center py-2 px-2 rounded bg-white border border-gray-100"
                      >
                        <div className="col-span-1">
                          <input
                            type="checkbox"
                            checked={mapping.selected}
                            onChange={() => toggleSheetSelection(index)}
                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            disabled={isUploading}
                          />
                        </div>
                        <div className="col-span-4">
                          <span className="font-medium">{mapping.sheetName}</span>
                        </div>
                        <div className="col-span-7">
                          <input
                            type="text"
                            value={mapping.tableName}
                            onChange={(e) => handleTableNameChange(index, e.target.value)}
                            disabled={!mapping.selected || isUploading}
                            className={`w-full px-3 py-2 border rounded-md ${
                              !mapping.selected || isUploading
                                ? 'bg-gray-100 border-gray-200 text-gray-500'
                                : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500' 
                            }`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description Field */}
              {sheets.length > 0 && (
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center mb-4">
                    <svg className="h-6 w-6 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <h2 className="text-xl font-semibold">Step 3: Add Description (Optional)</h2>
                  </div>
                  
                  <textarea
                    value={description}
                    onChange={handleDescriptionChange}
                    disabled={isUploading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    rows="3"
                    placeholder="Enter a description for this Excel file..."
                  ></textarea>
                </div>
              )}

              {/* Submit Button */}
              {sheets.length > 0 && (
                <div className="p-6 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={isUploading || mappings.filter(m => m.selected).length === 0}
                    className={`px-6 py-2 rounded-md text-white font-medium flex items-center ${
                      isUploading || mappings.filter(m => m.selected).length === 0
                        ? 'bg-indigo-400 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 mr-2" />
                        Process Excel
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default ExcelUploadPage;