import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import { ROUTES } from './config/constan';
import { AuthProvider } from './features/auth/context/AuthContext';

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Pages = lazy(() => import('./pages/Pages'));
const Posts = lazy(() => import('./pages/Posts'));
const CreatePost = lazy(() => import('./pages/CreatePost'));
const EditPost = lazy(() => import('./pages/EditPost'));

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path={ROUTES.HOME} element={<Home />} />
              <Route path={ROUTES.PAGES} element={<Pages />} />
              <Route path={ROUTES.POSTS} element={<Posts />} />
              <Route path={ROUTES.CREATE_POST} element={<CreatePost />} />
              <Route path={`${ROUTES.EDIT_POST}/:postId`} element={<EditPost />} />
              <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
            </Routes>
          </Suspense>
        </Layout>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}