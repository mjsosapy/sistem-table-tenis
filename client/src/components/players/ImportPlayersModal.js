import React, { useState } from 'react';
import { useMutation } from 'react-query';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../../utils/api';

const ImportPlayersModal = ({ onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const importMutation = useMutation(
    (formData) => api.post('/players/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      },
    }),
    {
      onSuccess: (response) => {
        toast.success(`Importación exitosa: ${response.data.imported} jugadores importados`);
        setSelectedFile(null);
        setUploadProgress(0);
        onSuccess();
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Error al importar jugadores');
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  );

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];
      
      if (allowedTypes.includes(file.type)) {
        setSelectedFile(file);
      } else {
        toast.error('Por favor selecciona un archivo CSV o Excel válido');
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo');
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    
    importMutation.mutate(formData);
  };

  const downloadTemplate = () => {
    const csvContent = `name,email,phone,birthDate,role,password
Juan Pérez,juan@ejemplo.com,+1234567890,1990-01-01,jugador,password123
María García,maria@ejemplo.com,+1234567891,1992-05-15,jugador,password123
Carlos López,carlos@ejemplo.com,+1234567892,1988-12-20,arbitro,password123`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'plantilla_jugadores.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-secondary-100 rounded-lg">
              <Upload className="w-6 h-6 text-secondary-600" />
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-semibold text-gray-900">Importar Jugadores</h2>
              <p className="text-sm text-gray-600">Sube un archivo CSV o Excel con los jugadores</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 mb-2">Instrucciones de importación</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• El archivo debe estar en formato CSV o Excel</li>
                  <li>• Las columnas requeridas son: name, email, role, password</li>
                  <li>• Las columnas opcionales son: phone, birthDate</li>
                  <li>• Los roles válidos son: jugador, arbitro, admin</li>
                  <li>• El formato de fecha debe ser: YYYY-MM-DD</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <FileText className="w-5 h-5 text-gray-600 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Plantilla de ejemplo</h3>
                <p className="text-sm text-gray-600">Descarga la plantilla para ver el formato correcto</p>
              </div>
            </div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-md transition-colors"
            >
              <Download className="w-4 h-4 mr-1" />
              Descargar
            </button>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Seleccionar archivo
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={isUploading}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium text-primary-600 hover:text-primary-500">
                      Haz clic para seleccionar
                    </span>{' '}
                    o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    CSV, XLSX o XLS (máximo 10MB)
                  </p>
                </div>
              </label>
            </div>

            {/* Selected File */}
            {selectedFile && (
              <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-900">{selectedFile.name}</p>
                    <p className="text-xs text-green-700">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-green-600 hover:text-green-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subiendo archivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="px-6 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 focus:outline-none focus:ring-2 focus:ring-secondary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Importando...' : 'Importar Jugadores'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPlayersModal;
