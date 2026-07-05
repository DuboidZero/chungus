import React, { useRef, useState } from 'react';
import { UploadCloud, CheckCircle2, XCircle, FileSpreadsheet } from 'lucide-react';
import { Card, CardContent } from '../../../shared/ui/card';
import { Button } from '../../../shared/ui/button';

interface UploadCardProps {
  title: string;
  description: string;
  acceptedFileTypes: string; // e.g. ".xlsx,.csv"
  onUpload: (file: File) => Promise<{ success: boolean; message: string }>;
}

export function UploadCard({ title, description, acceptedFileTypes, onUpload }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null); // Reset result on new file selection
    }
  };

  const handleUploadClick = async () => {
    if (!file) return;

    setIsUploading(true);
    setResult(null);
    try {
      const res = await onUpload(file);
      setResult(res);
      if (res.success) {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setResult({ success: false, message: err.message || 'An error occurred during upload.' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-on-surface mb-1">{title}</h3>
        <p className="text-sm text-on-surface-variant mb-4 break-words">{description}</p>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={acceptedFileTypes}
            className="hidden"
          />
          <Button 
            variant="outline" 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            Choose File
          </Button>

          {file && (
            <div className="flex items-center gap-2 text-sm text-on-surface-variant">
              <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
              <span className="truncate max-w-[200px]">{file.name}</span>
            </div>
          )}

          <div className="flex-1" />

          <Button 
            onClick={handleUploadClick}
            disabled={!file || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>

        {/* Validation / Result Area */}
        {result && (
          <div className={`mt-4 p-3 rounded-lg flex items-start gap-3 text-sm ${
            result.success 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <p>{result.message}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
