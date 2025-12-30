export interface FileItem {
  id: string;
  name: string;
  size: string;
  sizeBytes: number;
  type: string;
  extension: string;
  data: string;
}

export interface FileGroup {
  id: string;
  groupName: string;
  uploader: string;
  createdAt: number;
  files: FileItem[];
  totalSize: string;
  fileCount: number;
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'success' | 'error';
}
