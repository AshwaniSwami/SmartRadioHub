
import { useState, useCallback } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { apiRequest } from "@/lib/queryClient";

interface FileUploadZoneProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  maxSize?: number;
  projectId?: number;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

export default function FileUploadZone({
  onFilesUploaded,
  acceptedTypes = ["image/*", "audio/*", "video/*", ".pdf", ".doc", ".docx"],
  maxFiles = 10,
  maxSize = 50 * 1024 * 1024,
  projectId
}: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    if (!projectId) {
      alert("Please select a project first");
      return;
    }

    if (files.length > maxFiles) {
      alert(`Cannot upload more than ${maxFiles} files at once`);
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const filesToUpload = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.size > maxSize) {
          alert(`File ${file.name} is too large. Maximum size is ${formatFileSize(maxSize)}`);
          continue;
        }

        // Create file metadata for upload
        const fileData = {
          name: file.name,
          size: file.size,
          type: file.type || 'application/octet-stream'
        };

        filesToUpload.push(fileData);
        setUploadProgress(((i + 1) / files.length) * 50);
      }

      if (filesToUpload.length === 0) {
        setUploading(false);
        return;
      }

      // Upload file metadata to server
      const response = await apiRequest("POST", `/api/projects/${projectId}/files`, {
        files: filesToUpload
      });

      setUploadProgress(100);
      
      // Ensure response is an array
      const newFiles = Array.isArray(response) ? response : [];
      
      // Clear local uploaded files and notify parent to refresh
      setUploadedFiles([]);
      onFilesUploaded(newFiles);
      
      console.log('Successfully uploaded files:', newFiles);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      // Reset the input
      event.target.value = '';
    }
  }, [onFilesUploaded, maxSize, maxFiles, projectId]);

  const removeFile = (fileId: string) => {
    const updatedFiles = uploadedFiles.filter(f => f.id !== fileId);
    setUploadedFiles(updatedFiles);
    onFilesUploaded(updatedFiles);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <div>
          <label htmlFor="file-upload" className="cursor-pointer">
            <span className="text-gray-600 mb-2 block">
              Click to select files or drag and drop
            </span>
            <span className="text-sm text-gray-500 block">
              Supports: Images, Audio, Video, Documents
            </span>
            <span className="text-xs text-gray-400 mt-1 block">
              Max {maxFiles} files, {formatFileSize(maxSize)} each
            </span>
          </label>
          <input
            id="file-upload"
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </div>
      </div>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress)}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      
    </div>
  );
}
