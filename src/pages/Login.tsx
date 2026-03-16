import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Share2, Loader2, Mail, Globe } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../utils/firestoreErrorHandler';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', user.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
        throw err;
      }

      if (!userDoc.exists()) {
        const username = user.email?.split('@')[0] || 'user';
        const isAdmin = user.email === import.meta.env.VITE_ADMIN_EMAIL;
        const userData = {
          userId: username,
          username: user.displayName || username,
          email: user.email,
          createdAt: new Date(),
          totalFiles: 0,
          totalViews: 0,
          balance: 0,
          isAdmin: isAdmin,
          isBanned: false,
        };

        try {
          await setDoc(doc(db, 'users', user.uid), userData);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
          throw err;
        }
      }

      if (user.email === import.meta.env.VITE_ADMIN_EMAIL) {
        navigate('/admin/overview');
      } else {
        navigate('/dashboard/files');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Google Login is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else {
        try {
          const parsedError = JSON.parse(err.message);
          setError(`Permission Error: ${parsedError.error}`);
        } catch {
          setError(err.message || 'Google authentication failed.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        if (userCredential.user.email === import.meta.env.VITE_ADMIN_EMAIL) {
          navigate('/admin/overview');
        } else {
          navigate('/dashboard/files');
        }
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const defaultId = email.split('@')[0];
        const isAdmin = email === import.meta.env.VITE_ADMIN_EMAIL;

        const userData = {
          userId: defaultId,
          username: defaultId,
          email: email,
          password: password,
          createdAt: new Date(),
          totalFiles: 0,
          totalViews: 0,
          balance: 0,
          isAdmin: isAdmin,
          isBanned: false,
        };

        try {
          await setDoc(doc(db, 'users', user.uid), userData);
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, `users/${user.uid}`);
          throw err;
        }

        if (isAdmin) {
          navigate('/admin/overview');
        } else {
          navigate('/dashboard/files');
        }
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password login is not enabled. Please enable it in the Firebase Console under Authentication > Sign-in method.');
      } else {
        try {
          const parsedError = JSON.parse(err.message);
          setError(`Permission Error: ${parsedError.error}`);
        } catch {
          setError(err.message || 'Authentication failed.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-neutral-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-4">
            <Share2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-neutral-500 text-sm mt-1">
            {isLogin ? 'Login to your account' : 'Register a new account'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
            <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white shrink-0 mt-0.5">!</div>
            <p className="text-xs text-red-700 leading-relaxed font-medium">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-all font-medium text-neutral-700 disabled:opacity-50"
          >
            <Globe className="w-5 h-5 text-blue-500" />
            Continue with Google
          </button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-neutral-400 font-medium">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Password (Min 8 chars)</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-neutral-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-xl font-medium hover:bg-emerald-700 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Login' : 'Register')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-emerald-600 font-medium hover:underline"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
