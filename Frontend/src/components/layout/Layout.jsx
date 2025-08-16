import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isHomePage = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className={`flex-grow ${isHomePage ? '' : 'bg-gradient-to-br from-gray-50 to-blue-50/30'}`}>
        {children}
      </main>
      {!isHomePage && <Footer />}
    </div>
  );
};

export default Layout;
