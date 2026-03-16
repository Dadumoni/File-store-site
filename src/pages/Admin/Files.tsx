import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { formatFileSize, formatNumber } from '../../utils/formatters';
import { Search, FileIcon, Trash2, Eye, Download, User } from 'lucide-react';

export default function AdminFiles() {
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'files'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setFiles(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this file?')) {
      await deleteDoc(doc(db, 'files', id));
    }
  };

  const filteredFiles = files.filter(f => 
    f.fileName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.ownerId.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">All Files</h1>
          <p className="text-sm text-neutral-500">Monitor and manage all files uploaded by users.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-neutral-200">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by file name or owner ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-neutral-200 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-neutral-500 font-medium border-b border-neutral-200">
              <tr>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Owner</th>
                <th className="px-6 py-4">Size</th>
                <th className="px-6 py-4">Views</th>
                <th className="px-6 py-4">Downloads</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-neutral-500">Loading files...</td></tr>
              ) : filteredFiles.map((f) => (
                <tr key={f.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-neutral-100 rounded flex items-center justify-center text-neutral-500">
                        <FileIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900 truncate max-w-[200px]">{f.fileName}</p>
                        <p className="text-[10px] text-neutral-400 uppercase font-bold">{f.fileType}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <User className="w-3 h-3" />
                      <span className="text-xs truncate max-w-[100px]">{f.ownerId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-neutral-600">{formatFileSize(f.fileSize)}</td>
                  <td className="px-6 py-4 font-medium text-blue-600">{formatNumber(f.views)}</td>
                  <td className="px-6 py-4 text-neutral-600">{formatNumber(f.downloads)}</td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleDelete(f.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Permanently"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
