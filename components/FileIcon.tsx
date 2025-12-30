import React from 'react';
import { FileVideo, FileAudio, FileImage, FileText, FileArchive, FileCode, File } from 'lucide-react';
import { getFileTypeCategory } from '../utils/fileUtils';

interface FileIconProps {
  extension: string;
  className?: string;
}

export function FileIcon({ extension, className = 'w-5 h-5' }: FileIconProps) {
  const category = getFileTypeCategory(extension);
  
  const iconProps = {
    className,
    strokeWidth: 2
  };

  switch (category) {
    case 'video':
      return <FileVideo {...iconProps} className={`${className} text-purple-600`} />;
    case 'audio':
      return <FileAudio {...iconProps} className={`${className} text-pink-600`} />;
    case 'image':
      return <FileImage {...iconProps} className={`${className} text-blue-600`} />;
    case 'document':
      return <FileText {...iconProps} className={`${className} text-red-600`} />;
    case 'archive':
      return <FileArchive {...iconProps} className={`${className} text-orange-600`} />;
    case 'code':
      return <FileCode {...iconProps} className={`${className} text-green-600`} />;
    default:
      return <File {...iconProps} className={`${className} text-gray-600`} />;
  }
}
