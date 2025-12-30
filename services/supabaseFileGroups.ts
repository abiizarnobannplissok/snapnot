import { supabase } from '../lib/supabase';
import { FileGroup, FileItem } from '../fileTypes';
import { formatFileSize } from '../utils/fileUtils';

// Supabase Storage bucket name
const STORAGE_BUCKET = 'uploaded-files';

// Convert snake_case from DB to camelCase for app
function dbToApp(dbGroup: any): FileGroup {
  return {
    id: dbGroup.id,
    groupName: dbGroup.group_name,
    uploader: dbGroup.uploader,
    createdAt: dbGroup.created_at,
    files: dbGroup.files,
    totalSize: dbGroup.total_size,
    fileCount: dbGroup.file_count
  };
}

// Convert camelCase from app to snake_case for DB
function appToDb(group: FileGroup): any {
  return {
    id: group.id,
    group_name: group.groupName,
    uploader: group.uploader,
    created_at: group.createdAt,
    files: group.files,
    total_size: group.totalSize,
    file_count: group.fileCount
  };
}

// Get all file groups from Supabase
export async function getFileGroups(): Promise<FileGroup[]> {
  try {
    const { data, error } = await supabase
      .from('file_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching file groups:', error);
      return [];
    }

    return (data || []).map(dbToApp);
  } catch (error) {
    console.error('Error loading file groups:', error);
    return [];
  }
}

// Save file group to Supabase
export async function saveFileGroup(group: FileGroup): Promise<void> {
  try {
    const dbGroup = appToDb(group);
    const { error } = await supabase
      .from('file_groups')
      .insert([dbGroup]);

    if (error) {
      console.error('Error saving file group:', error);
      throw new Error('Gagal menyimpan file group');
    }

    console.log('✅ File group saved to Supabase:', group.id);
  } catch (error) {
    console.error('Error saving file group:', error);
    throw new Error('Gagal menyimpan file group');
  }
}

// Update file group in Supabase
export async function updateFileGroup(groupId: string, updates: Partial<FileGroup>): Promise<void> {
  try {
    // Convert camelCase updates to snake_case for DB
    const dbUpdates: any = {};
    if (updates.groupName !== undefined) dbUpdates.group_name = updates.groupName;
    if (updates.uploader !== undefined) dbUpdates.uploader = updates.uploader;
    if (updates.createdAt !== undefined) dbUpdates.created_at = updates.createdAt;
    if (updates.files !== undefined) dbUpdates.files = updates.files;
    if (updates.totalSize !== undefined) dbUpdates.total_size = updates.totalSize;
    if (updates.fileCount !== undefined) dbUpdates.file_count = updates.fileCount;

    const { error } = await supabase
      .from('file_groups')
      .update(dbUpdates)
      .eq('id', groupId);

    if (error) {
      console.error('Error updating file group:', error);
      throw new Error('Gagal mengupdate file group');
    }

    console.log('✅ File group updated:', groupId);
  } catch (error) {
    console.error('Error updating file group:', error);
    throw new Error('Gagal mengupdate file group');
  }
}

// Upload file to Supabase Storage
async function uploadFileToStorage(file: File, groupId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const sanitizedName = file.name.replace(/[^\w\s.-]/g, '').replace(/\s+/g, '_');
    const fileName = `${timestamp}-${randomId}-${sanitizedName}`;
    const filePath = `${groupId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '31536000', // 1 year cache
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    throw new Error(`Gagal upload file ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Delete files from Supabase Storage (including ZIP)
async function deleteGroupFilesFromStorage(groupId: string): Promise<void> {
  try {
    // List all files in the group folder (includes ZIP and individual files)
    const { data: fileList, error: listError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(groupId);

    if (listError) {
      console.error('Error listing files:', listError);
      return;
    }

    if (fileList && fileList.length > 0) {
      // Delete all files including ZIP
      const filePaths = fileList.map(file => `${groupId}/${file.name}`);
      const { error: deleteError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (deleteError) {
        console.error('Error deleting files:', deleteError);
      } else {
        console.log(`✅ Deleted ${filePaths.length} files (including ZIP) from storage`);
      }
    }
  } catch (error) {
    console.error('Error deleting files from storage:', error);
  }
}

// Delete file group from Supabase
export async function deleteFileGroup(groupId: string): Promise<void> {
  try {
    // Delete files from Supabase Storage
    await deleteGroupFilesFromStorage(groupId);
    
    // Delete metadata from database
    const { error } = await supabase
      .from('file_groups')
      .delete()
      .eq('id', groupId);

    if (error) {
      console.error('Error deleting file group:', error);
      throw new Error('Gagal menghapus file group');
    }

    console.log('✅ File group deleted:', groupId);
  } catch (error) {
    console.error('Error deleting file group:', error);
    throw new Error('Gagal menghapus file group');
  }
}

// Generate ZIP from file items and upload to storage
// Subscribe to file group changes (real-time)
export function subscribeToFileChanges(callback: () => void): () => void {
  console.log('📡 Setting up real-time subscription...');
  
  const subscription = supabase
    .channel('file_groups_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'file_groups',
      },
      (payload) => {
        console.log('🔄 File groups changed:', payload);
        callback();
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    console.log('📡 Unsubscribing from real-time...');
    subscription.unsubscribe();
  };
}

// Create file group with Supabase Storage upload
export async function createFileGroup(
  groupName: string,
  uploader: string,
  files: { file: File; extension: string }[],
  onProgress?: (progress: number) => void,
  onFileUploaded?: (index: number) => void
): Promise<FileGroup> {
  try {
    const totalFiles = files.length;
    console.log(`📝 Creating file group: ${groupName} - ${totalFiles} files`);
    
    onProgress?.(0);
    
    const groupId = Date.now().toString();
    let totalBytes = 0;
    let uploadedCount = 0;

    const BATCH_SIZE = totalFiles <= 5 ? 3 : Math.min(5, Math.ceil(totalFiles / 3));
    const fileItems: FileItem[] = new Array(totalFiles);
    
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      const batchPromises = batch.map(async ({ file, extension }, batchIndex) => {
        const globalIndex = i + batchIndex;
        
        const publicUrl = await uploadFileToStorage(file, groupId);
        
        const fileItem = {
          id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
          name: file.name,
          size: formatFileSize(file.size),
          sizeBytes: file.size,
          type: file.type,
          extension: extension,
          data: publicUrl
        };
        
        uploadedCount++;
        const progress = Math.round((uploadedCount / totalFiles) * 95);
        onProgress?.(progress);
        onFileUploaded?.(globalIndex);
        
        return { index: globalIndex, fileItem };
      });
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ index, fileItem }) => {
        fileItems[index] = fileItem;
      });
    }

    totalBytes = fileItems.reduce((sum, f) => sum + f.sizeBytes, 0);

    const newGroup: FileGroup = {
      id: groupId,
      groupName: groupName || 'Unnamed',
      uploader: uploader || 'Anonymous',
      createdAt: Date.now(),
      files: fileItems,
      totalSize: formatFileSize(totalBytes),
      fileCount: fileItems.length
    };

    await saveFileGroup(newGroup);
    
    onProgress?.(100);
    console.log('✅ Group saved!');

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
    // Get existing group
    const { data: dbGroup, error } = await supabase
      .from('file_groups')
      .select('*')
      .eq('id', groupId)
      .single();
    
    if (error || !dbGroup) {
      throw new Error('File group tidak ditemukan');
    }

    const group = dbToApp(dbGroup);

    // Upload new files to Supabase Storage
    const newFileItems: FileItem[] = [];
    let additionalBytes = 0;

    for (const { file, extension } of files) {
      const publicUrl = await uploadFileToStorage(file, groupId);
      
      newFileItems.push({
        id: `${Date.now()}-${Math.random().toString(36).substring(7)}`,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type: file.type,
        extension: extension,
        data: publicUrl
      });

      additionalBytes += file.size;
    }

    // Update group metadata
    const updatedFiles = [...group.files, ...newFileItems];
    const totalBytes = updatedFiles.reduce((sum: number, f: FileItem) => sum + f.sizeBytes, 0);

    await updateFileGroup(groupId, {
      files: updatedFiles,
      fileCount: updatedFiles.length,
      totalSize: formatFileSize(totalBytes)
    });

    console.log('✅ Files added to group:', groupId);
  } catch (error) {
    console.error('❌ Add files error:', error);
    throw new Error('Gagal menambahkan file: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
}
