import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { formatFileSize } from '../utils/formatters';
import { Share2, Download, FileIcon, ShieldCheck, Clock, Eye, AlertTriangle, Loader2 } from 'lucide-react';

export default function PublicFile() {
  const { slug } = useParams();
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFile = async () => {
      if (!slug) return;
      
      try {
        const q = query(collection(db, 'files'), where('shareLink', '==', slug), where('isDeleted', '==', false));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          setError('File not found or has been deleted.');
          setLoading(false);
          return;
        }

        const fileData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as any;
        setFile(fileData);

        // Record view event
        await addDoc(collection(db, 'analytics'), {
          fileId: fileData.id,
          userId: fileData.ownerId,
          event: 'view',
          timestamp: serverTimestamp(),
          ipHash: 'anonymous', // In real app, hash IP
        });

        // Increment view count and user balance
        await updateDoc(doc(db, 'files', fileData.id), {
          views: increment(1)
        });
        
        // Update owner balance (e.g. ₹0.05 per view)
        await updateDoc(doc(db, 'users', fileData.ownerId), {
          balance: increment(0.05),
          totalViews: increment(1)
        });

      } catch (err) {
        console.error(err);
        setError('An error occurred while fetching the file.');
      } finally {
        setLoading(false);
      }
    };

    fetchFile();
  }, [slug]);

  const handleDownload = async () => {
    setDownloading(true);
    // Record download event
    await addDoc(collection(db, 'analytics'), {
      fileId: file.id,
      userId: file.ownerId,
      event: 'download',
      timestamp: serverTimestamp(),
      ipHash: 'anonymous',
    });

    await updateDoc(doc(db, 'files', file.id), {
      downloads: increment(1)
    });

    // Simulate download delay
    setTimeout(() => {
      setDownloading(false);
      alert('Download started! In a real app, this would redirect to Telegram or a direct link.');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-12 h-12 text-emerald-600 animate-spin mb-4" />
        <p className="text-neutral-500 font-medium">Preparing your file...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-red-600 mb-4">
          <AlertTriangle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">Oops!</h2>
        <p className="text-neutral-500 mb-6">{error}</p>
        <button onClick={() => navigate('/')} className="bg-neutral-900 text-white px-6 py-3 rounded-xl font-medium">
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      <nav className="h-16 border-b border-neutral-200 bg-white flex items-center px-6">
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xl">
          <Share2 className="w-6 h-6" />
          <span>TeleShare</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-neutral-200 shadow-xl overflow-hidden">
          <div className="p-8 sm:p-12 text-center border-b border-neutral-200">
            <div className="w-24 h-24 bg-neutral-100 rounded-3xl flex items-center justify-center text-neutral-400 mx-auto mb-6">
              <FileIcon className="w-12 h-12" />
            </div>
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{file.fileName}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-neutral-500">
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {file.createdAt?.toDate().toLocaleDateString()}</span>
              <span className="w-1 h-1 bg-neutral-300 rounded-full"></span>
              <span>{formatFileSize(file.fileSize)}</span>
            </div>
          </div>

          <div className="p-8 sm:p-12 bg-neutral-50/50">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center">
                <Eye className="w-5 h-5 text-blue-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Views</p>
                <p className="text-xl font-bold">{file.views}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center">
                <Download className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Downloads</p>
                <p className="text-xl font-bold">{file.downloads}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-neutral-200 text-center">
                <ShieldCheck className="w-5 h-5 text-purple-500 mx-auto mb-2" />
                <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider">Status</p>
                <p className="text-xl font-bold text-emerald-600">Safe</p>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-bold text-lg hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {downloading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Download className="w-6 h-6" />}
                {downloading ? 'Generating Link...' : 'Download File'}
              </button>
              <p className="text-center text-xs text-neutral-400">
                By downloading, you agree to our Terms of Service.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Why use TeleShare?</h3>
            <ul className="space-y-3 text-sm text-neutral-600">
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mt-0.5">✓</div>
                Direct high-speed downloads with no waiting.
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mt-0.5">✓</div>
                Secure storage powered by Telegram's infrastructure.
              </li>
              <li className="flex items-start gap-3">
                <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mt-0.5">✓</div>
                No intrusive pop-up ads or malware.
              </li>
            </ul>
          </div>
          <div className="bg-emerald-600 p-8 rounded-3xl shadow-lg text-white">
            <h3 className="font-bold text-lg mb-2">Want to earn money?</h3>
            <p className="text-emerald-100 text-sm mb-6">Join our platform and start earning for every file you share. High CPM and fast payouts.</p>
            <button onClick={() => navigate('/login')} className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition-colors">
              Join TeleShare Earn
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
