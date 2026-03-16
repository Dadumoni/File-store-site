import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../context/AuthContext';
import { formatFileSize, formatNumber } from '../../utils/formatters';
import { handleFirestoreError, OperationType } from '../../utils/firestoreErrorHandler';
import { 
  Plus, 
  Copy, 
  Share2, 
  Trash2, 
  ExternalLink, 
  FileIcon, 
  MoreVertical,
  Search,
  Filter
} from 'lucide-react';

export default function Files() {
  const { user } = useAuth();
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newFile, setNewFile] = useState({
    fileName: '',
    fileSize: '',
    fileType: 'document',
    telegramFileId: '',
    channelMessageId: '',
  });

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'files'),
      where('ownerId', '==', user.uid),
      where('isDeleted', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const filesList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFiles(filesList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'files');
    });

    return () => unsubscribe();
  }, [user]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const slug = Math.random().toString(36).substring(2, 10);
    const fileData = {
      ...newFile,
      fileSize: parseInt(newFile.fileSize) * 1024 * 1024, // Convert MB to Bytes
      ownerId: user.uid,
      fileId: slug,
      shareLink: slug,
      views: 0,
      downloads: 0,
      createdAt: serverTimestamp(),
      isDeleted: false,
    };

    try {
      await addDoc(collection(db, 'files'), fileData);
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'files');
    }
    setShowUploadModal(false);
    setNewFile({
      fileName: '',
      fileSize: '',
      fileType: 'document',
      telegramFileId: '',
      channelMessageId: '',
    });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await updateDoc(doc(db, 'files', id), { isDeleted: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `files/${id}`);
      }
    }
  };

  const copyLink = (slug: string) => {
    const link = `${window.location.origin}/f/${slug}`;
    navigator.clipboard.writeText(link);
    alert('Link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Files</h1>
          <p className="text-sm text-neutral-500">Manage and share your uploaded files.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-all flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Upload File
        </button>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Filter files..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50">
            <Filter className="w-4 h-4 text-neutral-600" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">File Name</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Downloads</th>
                <th className="px-6 py-4">Created</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading files...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">No files found. Start by uploading one!</td></tr>
              ) : files.map((file) => (
                <tr key={file.id} className="hover:bg-neutral-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center text-neutral-500">
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <span className="font-medium text-neutral-900 truncate max-w-[200px]">{file.fileName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{formatFileSize(file.fileSize)}</td>
                  <td className="px-6 py-4 font-medium text-emerald-600">{formatNumber(file.views)}</td>
                  <td className="px-6 py-4 text-neutral-600">{formatNumber(file.downloads)}</td>
                  <td className="px-6 py-4 text-neutral-500">
                    {file.createdAt?.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => copyLink(file.shareLink)} className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg" title="Copy Link">
                        <Copy className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(file.id)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
              <h3 className="text-xl font-bold">Upload New File</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-neutral-400 hover:text-neutral-600">
                <Plus className="w-6 h-6 rotate-45" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">File Name</label>
                <input
                  type="text"
                  required
                  value={newFile.fileName}
                  onChange={(e) => setNewFile({...newFile, fileName: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. My Awesome Video.mp4"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Size (MB)</label>
                  <input
                    type="number"
                    required
                    value={newFile.fileSize}
                    onChange={(e) => setNewFile({...newFile, fileSize: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. 150"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Type</label>
                  <select
                    value={newFile.fileType}
                    onChange={(e) => setNewFile({...newFile, fileType: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="document">Document</option>
                    <option value="video">Video</option>
                    <option value="audio">Audio</option>
                    <option value="image">Image</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Telegram File ID</label>
                <input
                  type="text"
                  required
                  value={newFile.telegramFileId}
                  onChange={(e) => setNewFile({...newFile, telegramFileId: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Paste Telegram File ID"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Channel Message ID</label>
                <input
                  type="text"
                  required
                  value={newFile.channelMessageId}
                  onChange={(e) => setNewFile({...newFile, channelMessageId: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. 1234"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-lg font-medium hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 shadow-sm"
                >
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
