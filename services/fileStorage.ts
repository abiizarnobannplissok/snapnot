import { FileGroup, FileItem } from '../fileTypes';

const FILE_GROUP_PREFIX = 'filegroup:';

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

export async function saveFileGroup(group: FileGroup): Promise<void> {
  try {
    const key = `${FILE_GROUP_PREFIX}${group.id}`;
    await window.storage.set(key, JSON.stringify(group), true);
  } catch (error) {
    console.error('Error saving file group:', error);
    throw new Error('Gagal menyimpan file group');
  }
}

export async function deleteFileGroup(groupId: string): Promise<void> {
  try {
    const key = `${FILE_GROUP_PREFIX}${groupId}`;
    await window.storage.delete(key, true);
  } catch (error) {
    console.error('Error deleting file group:', error);
    throw new Error('Gagal menghapus file group');
  }
}

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
