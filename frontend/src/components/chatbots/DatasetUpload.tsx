'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Trash2, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Dataset } from '@/types';
import { chatbotService } from '@/services/chatbotService';

interface DatasetUploadProps {
  chatbotId: string;
  datasets: Dataset[];
  onUploadComplete?: () => void;
}

export default function DatasetUpload({
  chatbotId,
  datasets,
  onUploadComplete,
}: DatasetUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');

    try {
      await chatbotService.uploadFile(chatbotId, file);
      onUploadComplete?.();
    } catch (err: any) {
      setUploadError(err.response?.data?.error || 'Upload thất bại');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (datasetId: string) => {
    if (!window.confirm('Xóa dataset này?')) return;
    try {
      await chatbotService.deleteDataset(datasetId);
      onUploadComplete?.();
    } catch (err) {
      console.error('Failed to delete dataset:', err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-teal-500 animate-spin" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Bộ dữ liệu (Dataset)
        </h3>
        <p className="text-xs text-gray-400 mb-3">
          Upload file PDF hoặc TXT để chatbot có thể trả lời dựa trên nội dung tài liệu.
        </p>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all
          ${isUploading ? 'border-teal-300 bg-teal-50' : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
          id="dataset-file-input"
        />
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-teal-500 animate-spin" />
            <p className="text-sm text-teal-600">Đang upload...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <p className="text-sm text-gray-500">
              Kéo thả hoặc click để chọn file
            </p>
            <p className="text-xs text-gray-400">
              Hỗ trợ: PDF, TXT, MD (tối đa 10MB)
            </p>
          </div>
        )}
      </div>

      {uploadError && (
        <p className="text-sm text-red-500">{uploadError}</p>
      )}

      {/* Dataset List */}
      {datasets.length > 0 && (
        <div className="space-y-2">
          {datasets.map((dataset) => (
            <div
              key={dataset.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
            >
              <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">
                  {dataset.fileName}
                </p>
                <p className="text-xs text-gray-400">
                  {formatFileSize(dataset.fileSize)}
                </p>
              </div>
              {getStatusIcon(dataset.vectorStatus)}
              <button
                onClick={() => handleDelete(dataset.id)}
                className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
