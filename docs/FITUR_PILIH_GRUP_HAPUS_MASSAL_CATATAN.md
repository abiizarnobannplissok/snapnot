# Dokumentasi Fitur "Pilih Grup" dan "Hapus Massal" untuk Tab Catatan

## Daftar Isi
1. [Ringkasan Eksekutif](#ringkasan-eksekutif)
2. [Analisis Fitur Existing di File Share](#analisis-fitur-existing-di-file-share)
3. [Sketsa UI untuk Tab Catatan](#sketsa-ui-untuk-tab-catatan)
4. [Alur Pengguna (User Flow)](#alur-pengguna-user-flow)
5. [Panduan Implementasi](#panduan-implementasi)
6. [Perbandingan UI File Share vs Catatan](#perbandingan-ui-file-share-vs-catatan)
7. [Komponen yang Perlu Dimodifikasi](#komponen-yang-perlu-dimodifikasi)

---

## Ringkasan Eksekutif

Dokumen ini menjelaskan implementasi fitur **"Pilih Grup"** dan **"Hapus Massal"** yang akan diterapkan pada tab **Catatan** dengan mengadopsi pola yang sudah ada di tab **File Share**.

### Tujuan
- Memungkinkan pengguna memilih beberapa catatan sekaligus
- Menghapus catatan yang dipilih secara massal
- Menjaga konsistensi UI/UX dengan fitur serupa di File Share

---

## Analisis Fitur Existing di File Share

### Lokasi Kode
- **Komponen Utama**: `components/FileShare.tsx`
- **Komponen Card**: `components/FileGroupCard.tsx`

### Mekanisme Kerja

#### 1. State Management
```typescript
// FileShare.tsx - State untuk mode seleksi
const [selectionMode, setSelectionMode] = useState(false);
const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
```

#### 2. Toggle Mode Seleksi
```typescript
const toggleSelectionMode = () => {
  setSelectionMode(!selectionMode);
  setSelectedGroups(new Set()); // Reset pilihan saat toggle
};
```

#### 3. Toggle Pilihan Individual
```typescript
const toggleGroupSelection = (groupId: string) => {
  const newSelected = new Set(selectedGroups);
  if (newSelected.has(groupId)) {
    newSelected.delete(groupId);
  } else {
    newSelected.add(groupId);
  }
  setSelectedGroups(newSelected);
};
```

#### 4. Hapus Massal
```typescript
const handleDeleteSelected = async () => {
  if (selectedGroups.size === 0) return;
  
  setLoading(true);
  try {
    await Promise.all(Array.from(selectedGroups).map(id => deleteFileGroup(id)));
    await loadFileGroups();
    showToast(`${selectedGroups.size} grup berhasil dihapus`, 'success');
    setSelectedGroups(new Set());
    setSelectionMode(false);
  } catch (error) {
    showToast('Gagal menghapus grup', 'error');
  } finally {
    setLoading(false);
  }
};
```

### UI Elements di File Share

#### Tombol "Pilih Grup"
```
┌─────────────────────────────────────────────────────────────┐
│  Semua File (3)                           [Pilih Grup]      │
└─────────────────────────────────────────────────────────────┘
```

#### Mode Seleksi Aktif
```
┌─────────────────────────────────────────────────────────────┐
│  Semua File (3)            [Hapus (2)]      [Batal]         │
└─────────────────────────────────────────────────────────────┘
```

#### Checkbox pada Card
```
┌─────────────────────────────────────────────────────────┐
│  [✓]                                            │ <-- Checkbox bulat di pojok kanan atas
│  ┌──────────────────────────────────────────────┐      │
│  │   📁 Nama Grup                                │      │
│  │   3 file • 15 MB                             │      │
│  └──────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────┘
```

---

## Sketsa UI untuk Tab Catatan

### Mode Normal (Tanpa Seleksi)

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 Total 5 catatan tersimpan                                   │
│                                                                  │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────┐
│  │ 📝 Catatan 1      │  │ 📝 Catatan 2      │  │ 📝 Catatan 3   │
│  │                   │  │                   │  │                │
│  │ Isi catatan...    │  │ Isi catatan...    │  │ Isi catatan... │
│  │                   │  │                   │  │                │
│  │ 📅 12 Des 10:30   │  │ 📅 11 Des 09:15   │  │ 📅 10 Des 14:20│
│  │ 👤 Abiizar        │  │ 👤 User2          │  │ 👤 User3       │
│  │                   │  │                   │  │                │
│  │ [📋][✏️][🗑️]       │  │ [📋][✏️][🗑️]       │  │ [📋][✏️][🗑️]    │
│  └───────────────────┘  └───────────────────┘  └────────────────┘
│                                                                  │
│  [🔍 Cari]  [⬇️ Sort]  [Pilih Catatan]  [+ Tambah Baru]         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Mode Seleksi Aktif

```
┌─────────────────────────────────────────────────────────────────┐
│  Header                                                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  📋 Total 5 catatan tersimpan (2 dipilih)                       │
│                                                                  │
│  ┌───────────────────┐  ┌───────────────────┐  ┌────────────────┐
│  │            [✓]    │  │            [✓]    │  │            [ ] │
│  │ ╔═══════════════╗ │  │ ╔═══════════════╗ │  │ ┌────────────┐ │
│  │ ║ 📝 Catatan 1  ║ │  │ ║ 📝 Catatan 2  ║ │  │ │ 📝 Catatan │ │
│  │ ║               ║ │  │ ║               ║ │  │ │            │ │
│  │ ║ Isi catatan.. ║ │  │ ║ Isi catatan.. ║ │  │ │ Isi ctt... │ │
│  │ ╚═══════════════╝ │  │ ╚═══════════════╝ │  │ └────────────┘ │
│  │ (ring highlight)  │  │ (ring highlight)  │  │                │
│  └───────────────────┘  └───────────────────┘  └────────────────┘
│                                                                  │
│  [🔍 Cari]  [⬇️ Sort]  [🗑️ Hapus (2)]  [Batal]                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Detail Komponen UI

#### 1. Tombol "Pilih Catatan" (Mode Normal)
- **Posisi**: Sejajar dengan tombol Sort dan Search di header
- **Style**: 
  - Background: `bg-primary` (#D4FF00)
  - Text: `text-black font-bold`
  - Border-radius: `rounded-xl`
  - Height: `h-12`
  - Padding: `px-6`
- **Label**: "Pilih Catatan"

#### 2. Tombol "Batal" (Mode Seleksi)
- **Posisi**: Menggantikan tombol "Pilih Catatan"
- **Style**:
  - Background: `bg-gray-200`
  - Text: `text-gray-700 font-bold`
  - Border-radius: `rounded-xl`
- **Label**: "Batal"

#### 3. Tombol "Hapus (N)" (Mode Seleksi)
- **Posisi**: Di sebelah kiri tombol "Batal"
- **Style**:
  - Background: `bg-red-500`
  - Text: `text-white font-bold`
  - Border-radius: `rounded-xl`
  - Icon: Trash2 dari lucide-react
- **Label**: "Hapus (N)" dimana N = jumlah item terpilih
- **Visibility**: Hanya muncul jika `selectedNotes.size > 0`

#### 4. Checkbox pada NoteCard (Mode Seleksi)
- **Posisi**: Absolute, top-right corner (pojok kanan atas card)
- **Style**:
  - Shape: Bulat (rounded-full)
  - Size: `w-8 h-8`
  - Border: `border-2`
  - Unselected: `bg-white border-gray-300`
  - Selected: `bg-primary border-primary` dengan icon Check
- **Ring Highlight**: Card yang dipilih mendapat `ring-4 ring-primary/50`

---

## Alur Pengguna (User Flow)

### Flow 1: Memilih dan Menghapus Catatan

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ┌─────────────────────┐                                        │
│  │ 1. User di Tab      │                                        │
│  │    Catatan          │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ 2. Klik tombol      │                                        │
│  │    "Pilih Catatan"  │                                        │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ 3. Mode seleksi     │  • Tombol berubah jadi "Batal"         │
│  │    aktif            │  • Checkbox muncul di setiap card      │
│  │                     │  • Aksi hover card di-disable          │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────┐                                        │
│  │ 4. User tap/klik    │  • Card ter-highlight (ring)           │
│  │    card catatan     │  • Checkbox tercentang                 │
│  │                     │  • Counter "Hapus (N)" ter-update      │
│  └──────────┬──────────┘                                        │
│             │                                                    │
│             ├────────────────────────────┐                      │
│             │                            │                      │
│             ▼                            ▼                      │
│  ┌─────────────────────┐    ┌─────────────────────┐             │
│  │ 5a. Klik "Batal"    │    │ 5b. Klik "Hapus(N)" │             │
│  │                     │    │                     │             │
│  │ • Keluar mode       │    │ • Dialog konfirmasi │             │
│  │   seleksi           │    │   muncul            │             │
│  │ • Reset pilihan     │    │                     │             │
│  └─────────────────────┘    └──────────┬──────────┘             │
│                                        │                        │
│                                        ▼                        │
│                             ┌─────────────────────┐             │
│                             │ 6. Konfirmasi Hapus │             │
│                             │                     │             │
│                             │ "Hapus N catatan    │             │
│                             │  yang dipilih?"     │             │
│                             │                     │             │
│                             │ [Batal]   [Hapus]   │             │
│                             └──────────┬──────────┘             │
│                                        │                        │
│                                        ▼                        │
│                             ┌─────────────────────┐             │
│                             │ 7. Proses Delete    │             │
│                             │                     │             │
│                             │ • Loading state     │             │
│                             │ • Delete dari DB    │             │
│                             │ • Refresh list      │             │
│                             │ • Toast sukses      │             │
│                             │ • Reset mode        │             │
│                             └─────────────────────┘             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Flow 2: Pembatalan Seleksi

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│ Mode Seleksi     │ ──▶ │ Klik "Batal"     │ ──▶ │ Kembali ke       │
│ Aktif            │     │ atau klik card   │     │ Mode Normal      │
│                  │     │ yang sama        │     │                  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

## Panduan Implementasi

### Langkah 1: Update `types.ts` (Opsional)

Tidak perlu perubahan type karena Note sudah memiliki `id` yang digunakan untuk tracking seleksi.

### Langkah 2: Update `App.tsx`

#### 2.1. Tambah State untuk Mode Seleksi

```typescript
// Tambahkan di dalam function App()
const [noteSelectionMode, setNoteSelectionMode] = useState(false);
const [selectedNotes, setSelectedNotes] = useState<Set<string>>(new Set());
```

#### 2.2. Tambah Handler Functions

```typescript
// Toggle mode seleksi
const toggleNoteSelectionMode = useCallback(() => {
  setNoteSelectionMode(prev => !prev);
  setSelectedNotes(new Set());
}, []);

// Toggle pilihan individual
const toggleNoteSelection = useCallback((noteId: string) => {
  setSelectedNotes(prev => {
    const newSelected = new Set(prev);
    if (newSelected.has(noteId)) {
      newSelected.delete(noteId);
    } else {
      newSelected.add(noteId);
    }
    return newSelected;
  });
}, []);

// Hapus massal
const handleDeleteSelectedNotes = useCallback(async () => {
  if (selectedNotes.size === 0) return;
  
  try {
    // Delete semua catatan terpilih secara paralel
    await Promise.all(
      Array.from(selectedNotes).map(id => deleteNoteService(id))
    );
    
    // Refresh list
    const updatedNotes = await getNotes();
    setNotes(updatedNotes);
    
    // Reset state & tampilkan toast
    showToast(`${selectedNotes.size} catatan berhasil dihapus`, 'success');
    setSelectedNotes(new Set());
    setNoteSelectionMode(false);
  } catch (error) {
    showToast('Gagal menghapus catatan', 'error');
  }
}, [selectedNotes, showToast]);
```

#### 2.3. Update UI di Header (Bagian Notes Tab)

```tsx
{activeTab === 'notes' ? (
  <>
    {/* Search dan Sort tetap sama */}
    <div className="relative group w-full md:w-[260px]">
      {/* ... existing search input ... */}
    </div>
    
    <SortDropdown value={sortBy} onChange={setSortBy} />
    
    {/* Tombol Pilih Catatan / Hapus / Batal */}
    <div className="flex items-center gap-3">
      {noteSelectionMode && selectedNotes.size > 0 && (
        <button
          onClick={handleDeleteSelectedNotes}
          className="h-12 px-6 bg-red-500 text-white font-bold rounded-xl 
                     hover:bg-red-600 active:scale-95 transition-all 
                     flex items-center gap-2 shadow-sm"
        >
          <Trash2 className="w-5 h-5" />
          Hapus ({selectedNotes.size})
        </button>
      )}
      
      <button
        onClick={toggleNoteSelectionMode}
        className={`h-12 px-6 font-bold rounded-xl transition-all active:scale-95 shadow-sm ${
          noteSelectionMode 
            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
            : 'bg-primary text-black hover:bg-primary/80'
        }`}
      >
        {noteSelectionMode ? 'Batal' : 'Pilih Catatan'}
      </button>
      
      {/* Tombol Tambah Baru - hanya muncul jika tidak dalam mode seleksi */}
      {!noteSelectionMode && (
        <button 
          onClick={() => { setEditingNote(undefined); setIsModalOpen(true); }}
          className="hidden md:inline-flex h-[48px] items-center justify-center gap-2 
                     bg-primary px-6 rounded-[20px] font-bold text-black 
                     hover:scale-105 active:scale-95 transition-transform 
                     shadow-[0_4px_12px_rgba(212,255,0,0.4)] whitespace-nowrap flex-shrink-0"
        >
          <Plus className="w-5 h-5" />
          <span>Tambah Baru</span>
        </button>
      )}
    </div>
  </>
) : // ... rest of code
```

#### 2.4. Update NoteCard Rendering di Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredNotes.map((note) => (
    <NoteCard
      key={note.id}
      note={note}
      onEdit={noteSelectionMode ? undefined : handleEditClick}
      onDelete={noteSelectionMode ? undefined : handleDeleteNote}
      onCopy={noteSelectionMode ? undefined : handleCopyContent}
      selectionMode={noteSelectionMode}
      isSelected={selectedNotes.has(note.id)}
      onToggleSelect={() => toggleNoteSelection(note.id)}
    />
  ))}
</div>
```

### Langkah 3: Update `components/NoteCard.tsx`

#### 3.1. Update Interface Props

```typescript
interface NoteCardProps {
  note: Note;
  onEdit?: (note: Note) => void;    // Ubah jadi optional
  onDelete?: (id: string) => void;   // Ubah jadi optional
  onCopy?: (note: Note) => void;     // Ubah jadi optional
  selectionMode?: boolean;           // BARU
  isSelected?: boolean;              // BARU
  onToggleSelect?: () => void;       // BARU
}
```

#### 3.2. Update Component dengan Selection Mode

```tsx
export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onEdit, 
  onDelete, 
  onCopy,
  selectionMode = false,
  isSelected = false,
  onToggleSelect
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const colorStyle = COLORS[note.color] || COLORS.yellow;
  const isNew = Date.now() - note.createdAt < 5 * 60 * 1000;

  // ... existing functions ...

  // Handler untuk klik card saat selection mode
  const handleCardClick = () => {
    if (selectionMode && onToggleSelect) {
      onToggleSelect();
    }
  };

  return (
    <TiltedCard 
      scaleOnHover={selectionMode ? 1 : 1.05}  // Disable scale saat selection
      rotateAmplitude={selectionMode ? 0 : 10} // Disable rotate saat selection
    >
      <div 
        onClick={handleCardClick}
        className={`
          group relative p-6 rounded-3xl transition-all duration-300 
          border shadow-soft hover:shadow-hover flex flex-col h-full min-h-[220px]
          ${selectionMode ? 'cursor-pointer' : ''}
          ${selectionMode && isSelected ? 'ring-4 ring-primary/50' : ''}
        `}
        style={{ 
          backgroundColor: colorStyle.hex,
          borderColor: colorStyle.hex === '#FFFFFF' ? '#E5E7EB' : colorStyle.hex
        }}
      >
        {/* Selection Checkbox - Muncul saat selection mode */}
        {selectionMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.();
            }}
            className={`
              absolute top-4 right-4 w-8 h-8 rounded-full border-2 
              flex items-center justify-center transition-all duration-200 z-10
              ${isSelected 
                ? 'bg-primary border-primary' 
                : 'bg-white border-gray-300 hover:border-primary'
              }
            `}
          >
            {isSelected && <Check className="w-5 h-5 text-black" />}
          </button>
        )}

        {/* New Badge - Sembunyikan saat selection mode */}
        {isNew && !selectionMode && (
          <span className="absolute -top-3 -right-3 bg-black text-white text-[10px] 
                           font-bold px-3 py-1 rounded-full shadow-md animate-bounce">
            BARU!
          </span>
        )}

        {/* ... existing header and content ... */}

        {/* Footer Meta */}
        <div className="mt-auto border-t border-black/5 pt-4">
          {/* ... existing meta info ... */}

          {/* Actions - Sembunyikan saat selection mode */}
          {!selectionMode && (
            <div className="flex items-center justify-end gap-2 opacity-100 
                            md:opacity-0 md:group-hover:opacity-100 
                            transition-opacity duration-200">
              {/* ... existing action buttons ... */}
            </div>
          )}
        </div>
      </div>
    </TiltedCard>
  );
};
```

### Langkah 4: Tambah Dialog Konfirmasi (Opsional tapi Direkomendasikan)

Gunakan komponen `ConfirmDialog` yang sudah ada:

```tsx
// Di App.tsx, tambah state
const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);

// Modifikasi handleDeleteSelectedNotes
const handleDeleteSelectedNotes = useCallback(async () => {
  setBulkDeleteConfirm(true);
}, []);

const handleConfirmBulkDelete = useCallback(async () => {
  // ... logic delete yang sudah ada ...
  setBulkDeleteConfirm(false);
}, [selectedNotes, showToast]);

// Di JSX, tambahkan ConfirmDialog
<ConfirmDialog
  isOpen={bulkDeleteConfirm}
  title={`Hapus ${selectedNotes.size} catatan?`}
  message="Semua catatan yang dipilih akan dihapus permanen dan tidak dapat dikembalikan."
  confirmText="Hapus Semua"
  cancelText="Batal"
  onConfirm={handleConfirmBulkDelete}
  onCancel={() => setBulkDeleteConfirm(false)}
/>
```

### Langkah 5: Update `services/storage.ts` (Opsional - untuk Bulk Delete)

Untuk optimasi, bisa ditambahkan fungsi bulk delete:

```typescript
export const deleteMultipleNotes = async (ids: string[]): Promise<void> => {
  try {
    const { error } = await supabase
      .from('notes')
      .delete()
      .in('id', ids);

    if (error) throw error;
  } catch (error) {
    console.error('Error bulk deleting from Supabase', error);
    throw error;
  }
};
```

---

## Perbandingan UI File Share vs Catatan

| Aspek | File Share | Catatan (Proposed) |
|-------|------------|-------------------|
| **Nama Tombol** | "Pilih Grup" | "Pilih Catatan" |
| **Posisi Tombol** | Di samping judul section | Di header dengan Sort |
| **Checkbox Style** | Bulat, pojok kanan atas | Bulat, pojok kanan atas |
| **Highlight Selected** | `ring-4 ring-primary/50` | `ring-4 ring-primary/50` |
| **Delete Button** | "Hapus (N)" merah | "Hapus (N)" merah |
| **Cancel Button** | "Batal" abu-abu | "Batal" abu-abu |
| **Card Actions** | Tersembunyi saat seleksi | Tersembunyi saat seleksi |
| **Confirm Dialog** | Tidak ada | Ada (direkomendasikan) |

---

## Komponen yang Perlu Dimodifikasi

### File yang Harus Diubah

| File | Perubahan |
|------|-----------|
| `App.tsx` | Tambah state & handlers untuk selection mode |
| `components/NoteCard.tsx` | Tambah props selectionMode, checkbox UI |
| `services/storage.ts` | (Opsional) Tambah `deleteMultipleNotes` |

### Dependencies Baru

Tidak ada dependencies baru yang diperlukan. Semua icon (`Check`, `Trash2`) sudah tersedia dari `lucide-react`.

---

## Estimasi Waktu Implementasi

| Task | Estimasi |
|------|----------|
| Update App.tsx (state & handlers) | 30 menit |
| Update NoteCard.tsx (UI & props) | 45 menit |
| Testing & bug fixing | 30 menit |
| **Total** | **~2 jam** |

---

## Catatan Penting

1. **Mobile Responsiveness**: Pastikan tombol-tombol di mode seleksi tidak terlalu kecil untuk di-tap di mobile
2. **Accessibility**: Tambahkan `aria-label` pada checkbox untuk screen reader
3. **Animation**: Pertimbangkan transisi halus saat masuk/keluar mode seleksi
4. **Undo Feature**: Untuk pengembangan lanjutan, bisa ditambahkan fitur "Undo" setelah hapus massal

---

## Referensi Kode Existing

- `components/FileShare.tsx:33-34` - State untuk selection
- `components/FileShare.tsx:221-252` - Handler delete massal  
- `components/FileShare.tsx:304-326` - UI tombol selection
- `components/FileGroupCard.tsx:121-136` - Checkbox UI pada card

---

*Dokumen ini dibuat pada: 29 Desember 2025*
*Versi: 1.0*
