import { FileGroup, FileItem } from '../fileTypes';
import { formatFileSize } from '../utils/fileUtils';

const FILE_GROUP_PREFIX = 'filegroup:';

// Save file group to localStorage (metadata only)
export async function saveFileGroup(group: FileGroup): Promise<void> {
  try {
    const key = `${FILE_GROUP_PREFIX}${group.id}`;
    await window.storage.set(key, JSON.stringify(group), true);
  } catch (error) {
    console.error('Error saving file group:', error);
    throw new Error('Gagal menyimpan file group');
  }
}

// Get all file groups from localStorage
export async function getFileGroups(): Promise<FileGroup[]> {
  try {
    const keys = await window.storage.list(FILE_GROUP_PREFIX, true);
    const groups: FileGroup[] = [];

    for (const key of keys) {
      const data = await window.storage.get(key, true);
      if (data) {
        try {
          const group = JSON.parse(data);
          groups.push(group);
        } catch (e) {
          console.error('Failed to parse file group:', key, e);
        }
      }
    }

    return groups.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('Error loading file groups:', error);
    return [];
  }
}

// Delete file group
export async function deleteFileGroup(groupId: string): Promise<void> {
  try {
    const key = `${FILE_GROUP_PREFIX}${groupId}`;
    await window.storage.delete(key, true);
  } catch (error) {
    console.error('Error deleting file group:', error);
    throw new Error('Gagal menghapus file group');
  }
}

// Update file group
export async function updateFileGroup(groupId: string, updates: Partial<FileGroup>): Promise<void> {
  try {
    const key = `${FILE_GROUP_PREFIX}${groupId}`;
    const data = await window.storage.get(key, true);
    
    if (!data) {
      throw new Error('File group tidak ditemukan');
    }

    const group = JSON.parse(data) as FileGroup;
    const updatedGroup = { ...group, ...updates };
    
    await window.storage.set(key, JSON.stringify(updatedGroup), true);
  } catch (error) {
    console.error('Error updating file group:', error);
    throw new Error('Gagal mengupdate file group');
  }
}

// Subscribe to changes
export function subscribeToFileChanges(callback: () => void): () => void {
  const handleChange = (event: CustomEvent) => {
    const { key } = event.detail;
    if (key.startsWith(FILE_GROUP_PREFIX)) {
      callback();
    }
  };

  window.addEventListener('storage-change', handleChange as EventListener);
  
  return () => {
    window.removeEventListener('storage-change', handleChange as EventListener);
  };
}

// Convert File to base64 for storage
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Return full data URL with MIME type
      resolve(result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Create file group with base64 files
export async function createFileGroup(
  groupName: string,
  uploader: string,
  files: { file: File; extension: string }[]
): Promise<FileGroup> {
  try {
    console.log('📝 Creating file group:', groupName, '- Files:', files.length);
    
    const groupId = Date.now().toString();
    const fileItems: FileItem[] = [];
    let totalBytes = 0;

    // Process each file
    for (const { file, extension } of files) {
      console.log('📤 Processing file:', file.name, '- Size:', formatFileSize(file.size));
      
      // Convert to base64
      const base64Data = await readFileAsBase64(file);
      
      fileItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type: file.type,
        extension: extension,
        data: base64Data // Store full data URL
      });

      totalBytes += file.size;
    }

    const newGroup: FileGroup = {
      id: groupId,
      groupName: groupName || 'A',
      uploader: uploader || 'Abiizar',
      createdAt: Date.now(),
      files: fileItems,
      totalSize: formatFileSize(totalBytes),
      fileCount: fileItems.length
    };

    console.log('✅ Saving group to storage...');
    await saveFileGroup(newGroup);
    console.log('✅ Group saved successfully!');

    return newGroup;
  } catch (error) {
    console.error('❌ Create file group error:', error);
    throw new Error('Gagal membuat file group: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}

// Add files to existing group
export async function addFilesToGroup(
  groupId: string,
  files: { file: File; extension: string }[]
): Promise<void> {
  try {
    const key = `${FILE_GROUP_PREFIX}${groupId}`;
    const data = await window.storage.get(key, true);
    
    if (!data) {
      throw new Error('File group tidak ditemukan');
    }

    const group = JSON.parse(data) as FileGroup;
    
    // Process new files
    const newFileItems: FileItem[] = [];
    let additionalBytes = 0;

    for (const { file, extension } of files) {
      const base64Data = await readFileAsBase64(file);
      
      newFileItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type: file.type,
        extension: extension,
        data: base64Data
      });

      additionalBytes += file.size;
    }

    // Update group
    const updatedFiles = [...group.files, ...newFileItems];
    const totalBytes = updatedFiles.reduce((sum, f) => sum + f.sizeBytes, 0);

    await updateFileGroup(groupId, {
      files: updatedFiles,
      fileCount: updatedFiles.length,
      totalSize: formatFileSize(totalBytes)
    });
  } catch (error) {
    console.error('❌ Add files error:', error);
    throw new Error('Gagal menambahkan file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
