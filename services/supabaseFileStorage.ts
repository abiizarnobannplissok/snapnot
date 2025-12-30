import { supabase } from '../lib/supabase';
import { FileGroup, FileItem } from '../fileTypes';
import { formatFileSize } from '../utils/fileUtils';

const STORAGE_BUCKET = 'uploaded-files';

interface FileGroupDB {
  id: string;
  group_name: string;
  uploader: string;
  created_at: string;
  file_count: number;
  total_size: number;
}

interface FileDB {
  id: string;
  file_group_id: string;
  name: string;
  size: number;
  type: string;
  extension: string;
  storage_path: string;
  created_at: string;
}

// Upload file ke Supabase Storage dan return path
export async function uploadFileToStorage(file: File, groupId: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(7);
    const fileName = `${timestamp}-${randomId}-${file.name}`;
    const filePath = `${groupId}/${fileName}`;

    console.log('📤 Uploading to storage:', filePath, '- Size:', formatFileSize(file.size));

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('❌ Storage upload error:', error);
      
      // Check if bucket exists
      if (error.message.includes('Bucket not found') || error.message.includes('not found')) {
        throw new Error(`Storage bucket '${STORAGE_BUCKET}' belum dibuat. Silakan buat bucket di Supabase Dashboard → Storage → Create bucket dengan nama '${STORAGE_BUCKET}' dan set sebagai Public.`);
      }
      
      if (error.message.includes('row-level security')) {
        throw new Error('Storage policy belum diset. Jalankan SQL untuk storage policies di Supabase SQL Editor.');
      }
      
      throw new Error(`Gagal upload file ${file.name}: ${error.message}`);
    }

    console.log('✅ Upload success:', data.path);
    return data.path;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

// Get public URL untuk file
export function getFilePublicUrl(storagePath: string): string {
  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(storagePath);
  
  return data.publicUrl;
}

// Create file group
export async function createFileGroup(
  groupName: string,
  uploader: string,
  files: { file: File; extension: string }[]
): Promise<FileGroup> {
  try {
    console.log('📝 Creating file group:', groupName, '- Files:', files.length);
    
    // 1. Insert file group
    const { data: groupData, error: groupError } = await supabase
      .from('file_groups')
      .insert({
        group_name: groupName || 'A',
        uploader: uploader || 'Abiizar',
        file_count: 0,
        total_size: 0
      })
      .select()
      .single();

    if (groupError) {
      console.error('❌ Group insert error:', groupError);
      
      if (groupError.message.includes('relation') && groupError.message.includes('does not exist')) {
        throw new Error('Table file_groups belum dibuat. Jalankan SQL script di Supabase SQL Editor terlebih dahulu.');
      }
      
      if (groupError.message.includes('row-level security')) {
        throw new Error('RLS policy untuk file_groups belum diset. Jalankan SQL script lengkap di Supabase SQL Editor.');
      }
      
      throw new Error(`Gagal membuat group: ${groupError.message}`);
    }
    
    console.log('✅ Group created:', groupData.id);

    const groupId = groupData.id;
    const fileItems: FileItem[] = [];

    // 2. Upload each file
    for (const { file, extension } of files) {
      // Upload ke Storage
      const storagePath = await uploadFileToStorage(file, groupId);

      // Insert file metadata ke database
      const { data: fileData, error: fileError } = await supabase
        .from('files')
        .insert({
          file_group_id: groupId,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: extension,
          storage_path: storagePath
        })
        .select()
        .single();

      if (fileError) {
        console.error('File insert error:', fileError);
        continue;
      }

      fileItems.push({
        id: fileData.id,
        name: fileData.name,
        size: formatFileSize(fileData.size),
        sizeBytes: fileData.size,
        type: fileData.type,
        extension: fileData.extension,
        data: getFilePublicUrl(fileData.storage_path) // Store URL instead of base64
      });
    }

    // 3. Get updated group with stats
    const { data: updatedGroup, error: fetchError } = await supabase
      .from('file_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (fetchError) throw fetchError;

    return {
      id: updatedGroup.id,
      groupName: updatedGroup.group_name,
      uploader: updatedGroup.uploader,
      createdAt: new Date(updatedGroup.created_at).getTime(),
      files: fileItems,
      totalSize: formatFileSize(updatedGroup.total_size),
      fileCount: updatedGroup.file_count
    };

  } catch (error) {
    console.error('Create file group error:', error);
    throw new Error('Gagal membuat file group');
  }
}

// Get all file groups
export async function getFileGroups(): Promise<FileGroup[]> {
  try {
    const { data: groups, error: groupError } = await supabase
      .from('file_groups')
      .select(`
        *,
        files (*)
      `)
      .order('created_at', { ascending: false });

    if (groupError) throw groupError;

    return groups.map((group: any) => ({
      id: group.id,
      groupName: group.group_name,
      uploader: group.uploader,
      createdAt: new Date(group.created_at).getTime(),
      files: group.files.map((file: any) => ({
        id: file.id,
        name: file.name,
        size: formatFileSize(file.size),
        sizeBytes: file.size,
        type: file.type,
        extension: file.extension,
        data: getFilePublicUrl(file.storage_path)
      })),
      totalSize: formatFileSize(group.total_size),
      fileCount: group.file_count
    }));

  } catch (error) {
    console.error('Get file groups error:', error);
    return [];
  }
}

// Delete file group
export async function deleteFileGroup(groupId: string): Promise<void> {
  try {
    // 1. Get all files in group
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('storage_path')
      .eq('file_group_id', groupId);

    if (filesError) throw filesError;

    // 2. Delete files from Storage
    if (files && files.length > 0) {
      const filePaths = files.map(f => f.storage_path);
      const { error: storageError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(filePaths);

      if (storageError) {
        console.error('Storage delete error:', storageError);
      }
    }

    // 3. Delete group (CASCADE will delete files records)
    const { error: deleteError } = await supabase
      .from('file_groups')
      .delete()
      .eq('id', groupId);

    if (deleteError) throw deleteError;

  } catch (error) {
    console.error('Delete file group error:', error);
    throw new Error('Gagal menghapus file group');
  }
}

// Add files to existing group
export async function addFilesToGroup(
  groupId: string,
  files: { file: File; extension: string }[]
): Promise<void> {
  try {
    for (const { file, extension } of files) {
      // Upload ke Storage
      const storagePath = await uploadFileToStorage(file, groupId);

      // Insert file metadata
      const { error: fileError } = await supabase
        .from('files')
        .insert({
          file_group_id: groupId,
          name: file.name,
          size: file.size,
          type: file.type,
          extension: extension,
          storage_path: storagePath
        });

      if (fileError) {
        console.error('Add file error:', fileError);
        throw fileError;
      }
    }
  } catch (error) {
    console.error('Add files to group error:', error);
    throw new Error('Gagal menambahkan file');
  }
}

// Subscribe to changes
export function subscribeToFileGroups(callback: () => void): () => void {
  const channel = supabase
    .channel('file_groups_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'file_groups'
      },
      () => {
        callback();
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'files'
      },
      () => {
        callback();
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
