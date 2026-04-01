import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Phone, MapPin, Send, Instagram, ArrowRight, Award, Share2, ExternalLink, Loader2, Image as ImageIcon, Clock, Youtube, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Button } from './components/Button';
import { CourseCard } from './components/CourseCard';
import { ContactForm } from './components/ContactForm';
import { CourseRegistrationForm } from './components/CourseRegistrationForm';
import { LanguageSelector } from './components/LanguageSelector';
import { ThemeToggle } from './components/ThemeToggle';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { Gallery } from './components/Gallery';
import { ScrollToTop } from './components/ScrollToTop';
import { sendTelegramMessage } from './services/telegramService';
import { Logo } from './components/Logo';
import { InstructorModal } from './components/InstructorModal';
import { LoadingScreen } from './components/LoadingScreen';
import { useData } from './context/DataContext';
import { useAuth } from './context/AuthContext';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';

import { Toaster } from 'sonner';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <LoadingScreen />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const NavLink = ({ href, children, isActive, onClick, setActiveSection, isScrolled }: { href: string, children: React.ReactNode, isActive?: boolean, onClick?: () => void, setActiveSection?: (id: string) => void, isScrolled?: boolean }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: targetId } });
      return;
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (setActiveSection) setActiveSection(targetId);
      // Use replaceState to clear hash from URL immediately without triggering route change
      window.history.replaceState(null, '', window.location.pathname);
    }
    if (onClick) onClick();
  };

  return (
    <a 
      href={href} 
      onClick={handleClick}
      className={`relative px-2 lg:px-3 py-2 text-sm font-medium transition-all duration-500 ease-in-out rounded-xl group ${!isScrolled ? 'drop-shadow-sm' : ''} ${
        isActive 
          ? (isScrolled ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10' : 'text-white bg-white/10')
          : (isScrolled 
              ? 'text-slate-600 hover:text-emerald-600 dark:text-gray-300 dark:hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-white/5' 
              : 'text-white/80 hover:text-white hover:bg-white/10')
      }`}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <motion.span 
          layoutId="activeNavLine"
          className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1/2 h-[2px] rounded-full ${isScrolled ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-white drop-shadow-md'}`}
          initial={{ width: 0 }}
          animate={{ width: '50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}
    </a>
  );
};

export default function App() {
  const location = useLocation();

  useEffect(() => {
    // Globally block hashes on non-root paths like /admin or /login
    if (window.location.hash && location.pathname !== '/') {
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, [location.pathname]);

  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboardWrapper />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

function AdminDashboardWrapper() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { loading, error } = useData();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#1A1D23] p-4">
        <div className="bg-white dark:bg-[#242830] p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xatolik yuz berdi</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      </div>
    );
  }

  return <AdminDashboard onLogout={async () => {
    await signOut();
    navigate('/');
  }} />;
}

function LandingPage() {
  const { t, i18n } = useTranslation();
  const { courses, settings, loading, error } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ['0%', '30%']);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      // Use replaceState to ensure URL is clean
      window.history.replaceState(null, '', window.location.pathname);
    }
  };

  useEffect(() => {
    // Cleanup duplicate hashes or unwanted hashes
    if (window.location.hash) {
      const hash = window.location.hash;
      // If it's a duplicate hash like #admin#gallery
      if (hash.split('#').length > 2) {
        const parts = hash.split('#');
        const lastHash = parts[parts.length - 1];
        window.history.replaceState(null, '', window.location.pathname + '#' + lastHash);
        return;
      }

      const id = hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
          setActiveSection(id);
          // Clear hash from URL using replaceState
          window.history.replaceState(null, '', window.location.pathname);
        }, 100);
      } else {
        // If no element found, just clear the hash
        window.history.replaceState(null, '', window.location.pathname);
      }
    }
  }, [location.pathname]); // Only run when pathname changes or on initial load

  useEffect(() => {
    // Check for target in location state (from navigation)
    if (location.state?.scrollTo) {
      const id = location.state.scrollTo;
      scrollToSection(id);
      // Clear state after scrolling
      navigate(location.pathname, { replace: true, state: {} });
    } 
    // On initial load, check session storage for last section
    else if (!window.location.hash) {
      const lastSection = sessionStorage.getItem('lastSection');
      if (lastSection && lastSection !== 'home') {
        const element = document.getElementById(lastSection);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'auto' }); // Use auto for initial load
            setActiveSection(lastSection);
          }, 100);
        }
      }
    }
  }, [location.pathname]); // Only run on pathname change or initial load

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY < 100) {
        setActiveSection('home');
        sessionStorage.setItem('lastSection', 'home');
      }
    };

    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          sessionStorage.setItem('lastSection', entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);
    const sections = ['home', 'courses', 'about', 'gallery', 'results', 'faq', 'contact'];
    sections.forEach(id => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  // Body scroll lock effect
  useEffect(() => {
    if (isMenuOpen || isModalOpen || selectedInstructor) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen, isModalOpen, selectedInstructor]);

  useEffect(() => {
    if (!settings) return;

    // Add Schema.org JSON-LD for LocalBusiness
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "LanguageSchool",
      "name": "Intensive Nemis tili markazi",
      "image": settings.logoUrl || "https://ais-dev-sfa22jzcti3iz5tt2pp3d7-3908952633.asia-southeast1.run.app/logo.png",
      "@id": "https://intensive.uz",
      "url": "https://intensive.uz",
      "telephone": settings.phone,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": settings.address,
        "addressLocality": "Toshkent",
        "addressCountry": "UZ"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": 41.2827,
        "longitude": 69.2135
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday"
        ],
        "opens": "09:00",
        "closes": "20:00"
      },
      "sameAs": [
        settings.instagramLink,
        settings.telegramLink,
        settings.youtubeLink
      ].filter(Boolean)
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaData);
    document.head.appendChild(script);

    return () => {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
    };
  }, [settings]);

  const handleConsultation = async (data: any) => {
    const success = await sendTelegramMessage(data.name, data.phone, 'Konsultatsiya', '-', '-', undefined, undefined, data.message);
    return success;
  };

  const handleRegistration = async (data: any) => {
    const success = await sendTelegramMessage(
      data.studentName || data.name, 
      data.phone, 
      data.course, 
      data.teacher, 
      data.time || data.schedule,
      data.email,
      data.contactMethod
    );
    return success;
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-site-gradient p-4 text-center">
        <div className="bg-white dark:bg-neutral-900 p-8 rounded-3xl shadow-2xl border border-red-100 dark:border-red-900/30 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <X size={32} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Xatolik yuz berdi</h2>
          <p className="text-neutral-600 dark:text-gray-400 mb-8 leading-relaxed">
            {error}
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-600/20 transition-all active:scale-95"
          >
            <ArrowRight size={20} />
            Qayta urinish
          </Button>
          
          <p className="mt-6 text-xs text-neutral-400 dark:text-gray-500 italic">
            Agar muammo davom etsa, iltimos Supabase sozlamalarini va internet ulanishingizni tekshiring.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-neutral-900 dark:text-[#EAEAEA] font-sans bg-site-gradient transition-colors duration-300">
      <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/90 dark:bg-white/[0.03] backdrop-blur-[12px] shadow-md border-b border-neutral-200/50 dark:border-white/10 py-2.5' 
          : 'bg-transparent border-b border-transparent py-4 md:py-6'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex justify-between items-center">
          <a 
            href="#home" 
            className={`pl-2 lg:pl-6 ${!isScrolled ? "drop-shadow-md" : ""}`} 
            onClick={(e) => { 
              e.preventDefault(); 
              scrollToSection('home');
            }}
          >
            <Logo className={`h-12 sm:h-14 lg:h-16 w-auto transition-all duration-500 ease-in-out ${isScrolled ? 'opacity-100' : 'opacity-90'}`} />
          </a>
          
          {/* Desktop menu */}
          <div className="hidden lg:flex gap-x-1 xl:gap-x-2 items-center lg:ml-8 xl:ml-12">
            <NavLink href="#home" isActive={activeSection === 'home'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('home')}</NavLink>
            <NavLink href="#courses" isActive={activeSection === 'courses'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('courses')}</NavLink>
            <NavLink href="#about" isActive={activeSection === 'about'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('about')}</NavLink>
            <NavLink href="#gallery" isActive={activeSection === 'gallery'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('gallery')}</NavLink>
            <NavLink href="#results" isActive={activeSection === 'results'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('results')}</NavLink>
            <NavLink href="#faq" isActive={activeSection === 'faq'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('faq')}</NavLink>
            <NavLink href="#contact" isActive={activeSection === 'contact'} setActiveSection={setActiveSection} isScrolled={isScrolled}>{t('contact')}</NavLink>
          </div>
          
          <div className="flex items-center gap-x-2 md:gap-x-3">
            <div className="flex items-center gap-1 md:gap-2">
              <ThemeToggle isScrolled={isScrolled} />
              <LanguageSelector isScrolled={isScrolled} />
            </div>
            <Button onClick={() => setIsModalOpen(true)} className="hidden lg:block bg-emerald-600/90 backdrop-blur-md text-white hover:bg-emerald-500 rounded-full px-6 py-2.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] transition-all duration-300 transform hover:-translate-y-0.5 font-medium text-sm whitespace-nowrap border border-emerald-500/50">{t('enroll')}</Button>
            
            {/* Mobile menu button */}
            <button 
              className={`lg:hidden p-2 backdrop-blur-md border shadow-sm rounded-full transition-all duration-500 ease-in-out active:scale-90 ${
                isScrolled 
                  ? 'bg-white/80 dark:bg-[#242830]/80 border-slate-200 dark:border-neutral-700/50 text-slate-800 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-white' 
                  : 'bg-white/10 border-white/40 text-white hover:bg-white/20'
              }`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </nav>

      </header>

      {/* Mobile menu - Apple-style minimalist drawer */}
      <AnimatePresence mode="wait">
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-md z-[60] lg:hidden"
            />
            
            {/* Side Drawer */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-[100dvh] w-[85%] max-w-sm bg-white/90 dark:bg-[#1A1D23]/90 backdrop-blur-2xl z-[70] lg:hidden shadow-2xl border-l border-white/20 dark:border-white/10 flex flex-col overscroll-contain"
            >
              <div className="p-6 flex justify-between items-center shrink-0">
                <Logo className="w-24 h-auto" />
                <button 
                  onClick={() => setIsMenuOpen(false)}
                  className="p-2 bg-gray-100 dark:bg-white/5 rounded-full text-gray-500 hover:text-black dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 px-6 py-4 flex flex-col overflow-y-auto min-h-0 pb-10">
                <nav className="flex flex-col">
                  {[
                    { id: 'home', label: t('home') },
                    { id: 'courses', label: t('courses') },
                    { id: 'about', label: t('about') },
                    { id: 'gallery', label: t('gallery') },
                    { id: 'results', label: t('results') },
                    { id: 'faq', label: t('faq') },
                    { id: 'contact', label: t('contact') }
                  ].map((item, index) => (
                    <motion.a 
                      key={item.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      href={`#${item.id}`} 
                      className={`text-lg font-medium py-4 border-b border-gray-100/50 dark:border-white/5 transition-colors flex items-center justify-between group ${
                        activeSection === item.id 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-neutral-900 dark:text-neutral-200 hover:text-emerald-500'
                      }`} 
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMenuOpen(false);
                        const targetId = item.id;
                        
                        if (location.pathname !== '/') {
                          navigate('/', { state: { scrollTo: targetId } });
                          return;
                        }

                        scrollToSection(targetId);
                      }}
                    >
                      {item.label}
                      {activeSection === item.id && (
                        <motion.div layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      )}
                    </motion.a>
                  ))}
                </nav>
                
                <div className="mt-8 space-y-4">
                  <Button 
                    onClick={() => { setIsModalOpen(true); setIsMenuOpen(false); }} 
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 rounded-xl py-4 shadow-lg shadow-emerald-500/20 font-bold transition-all"
                  >
                    {t('enroll')}
                  </Button>
                </div>
              </div>

              <div className="p-6 bg-gray-50 dark:bg-[#20242B] border-t border-gray-200 dark:border-white/10 overflow-visible mt-auto">
                <div className="grid grid-cols-2 gap-4">
                  <LanguageSelector variant="mobile" isDropup={true} />
                  <ThemeToggle variant="mobile" />
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6 h-[100dvh] overscroll-contain">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-white dark:bg-[#242830] max-w-lg w-full relative rounded-3xl shadow-2xl transition-colors duration-300 flex flex-col max-h-[90vh]"
          >
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 md:top-6 md:right-6 text-gray-400 hover:text-black dark:hover:text-[#EAEAEA] transition-colors z-[110] p-2 bg-gray-100 dark:bg-[#1A1D23] rounded-full shadow-sm">
              <X size={20} />
            </button>
            <div className="overflow-y-auto overscroll-contain rounded-3xl flex-1">
              <CourseRegistrationForm onSendMessage={handleRegistration} courses={courses} onClose={() => setIsModalOpen(false)} />
            </div>
          </motion.div>
        </div>
      )}

      <main>
        {/* Full-screen Hero section */}
        <section id="home" className="relative h-screen flex items-center justify-center text-center px-4 sm:px-6 overflow-hidden">
          {/* Background Image with Parallax and subtle zoom */}
          <motion.div 
            className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat animate-slow-zoom" 
            style={{ 
              backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1280&h=720&auto=format&fit=crop&q=60')`,
              y: backgroundY
            }}
          ></motion.div>
          
          <div className="relative z-10 max-w-5xl mx-auto mt-16 px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 leading-[1.1] break-words text-white drop-shadow-lg">
                {t('hero_title')}
              </h1>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            >
              <p className="text-base sm:text-xl lg:text-2xl mb-8 sm:mb-10 max-w-3xl mx-auto break-words text-gray-100 drop-shadow-md font-medium leading-relaxed">
                {t('hero_desc')}
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: "easeOut" }}
            >
            <a 
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('contact');
              }}
            >
              <Button 
                variant="secondary" 
                className="bg-white text-black hover:bg-gray-100 rounded-full px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {t('consultation')}
              </Button>
            </a>
            </motion.div>
          </div>
        </section>

        {/* Content sections with white background */}
        <div className="transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20">
            <section id="courses" className="mb-16 md:mb-20 scroll-mt-24">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA] mb-8 md:mb-12 text-center">{t('courses_title')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {courses.map((c, i) => {
                  return (
                    <div 
                      key={i} 
                      className={`flex flex-col h-full ${c.imageUrl ? 'md:col-span-2' : ''}`}
                    >
                      <CourseCard 
                        index={i} 
                        course={c}
                        onInstructorClick={setSelectedInstructor}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="about" className="mb-16 md:mb-20 scroll-mt-24">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
                <motion.div 
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="relative z-10 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-lg md:shadow-2xl">
                    <img 
                      src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1200&h=1500&auto=format&fit=crop" 
                      alt="Intensive Nemis tili markazi jamoasi va o'quvchilari" 
                      className="w-full h-full object-cover aspect-[4/5]"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/40 to-transparent" />
                  </div>
                  {/* Abstract Shape */}
                  <div className="absolute -top-10 -left-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse" />
                  <div className="absolute -bottom-10 -right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse delay-700" />
                  
                  {/* Enhanced Experience Badge */}
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5, type: "spring" }}
                    className="absolute -bottom-2 -right-2 md:-bottom-8 md:-right-8 bg-white/80 dark:bg-[#242830]/80 backdrop-blur-xl p-4 md:p-8 rounded-2xl shadow-sm border border-white dark:border-white/10 z-20 flex items-center gap-3 md:gap-6"
                  >
                    <div className="w-10 h-10 md:w-16 md:h-16 bg-emerald-500 rounded-xl md:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
                      <Award className="w-5 h-5 md:w-8 md:h-8" />
                    </div>
                    <div>
                      <div className="text-2xl md:text-5xl font-serif font-bold text-neutral-900 dark:text-white leading-none mb-1">10+</div>
                      <div className="text-[8px] md:text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {t('years_experience')}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                >
                  <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA] mb-6 md:mb-8 leading-tight">
                    {t('about_title')}
                  </h2>
                  <div className="space-y-4 md:space-y-6 text-base md:text-lg text-neutral-600 dark:text-[#A0AEC0] leading-relaxed">
                    <p>
                      Bizning markazimizda <span className="text-emerald-600 dark:text-emerald-400 font-bold">{t('about_german_lang')}</span> o'rganish nafaqat bilim olish, balki yangi imkoniyatlar eshigini ochishdir. 
                    </p>
                    <p>
                      Biz har bir o'quvchining <span className="text-neutral-900 dark:text-white font-bold underline decoration-emerald-500/30 underline-offset-8">{t('about_high_results')}</span> ga erishishi uchun individual yondashuv va eng zamonaviy metodikalardan foydalanamiz.
                    </p>
                    <p>
                      {t('about_desc')}
                    </p>
                  </div>
                  
                  <div className="mt-10 grid grid-cols-2 gap-8">
                    <div>
                      <div className="text-2xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA]">500+</div>
                      <div className="text-sm text-neutral-400">{t('students_count')}</div>
                    </div>
                    <div>
                      <div className="text-2xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA]">95%</div>
                      <div className="text-sm text-neutral-400">{t('success_rate')}</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </section>

            <section id="gallery" className="py-12 md:py-20 scroll-mt-24">
              <Gallery />
            </section>
            
            <section id="results" className="py-12 md:py-20 scroll-mt-24">
              <Testimonials />
            </section>

            <section id="faq" className="py-12 md:py-20 scroll-mt-24">
              <FAQ />
            </section>

            <section id="contact" className="flex flex-col md:flex-row items-stretch gap-20 py-12 md:py-20 max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
              {/* Form Column - Dynamic Height */}
              <div className="flex-1 bg-white dark:bg-[#242830]/40 backdrop-blur-md border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-colors duration-300 w-full overflow-hidden flex flex-col">
                <ContactForm onSendMessage={handleConsultation} />
              </div>
              
              {/* Info Column - Centered Vertically */}
              <div className="flex-1 flex flex-col gap-6 justify-center">
                {/* Phone Block */}
                <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-[3px] group">
                  <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">
                      <Phone size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1 font-sans truncate">{t('phone')}</h3>
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <a href={`tel:${settings.phone.replace(/\s/g, '')}`} className="text-sm md:text-base font-bold text-neutral-900 dark:text-white hover:text-green-600 transition-colors font-sans whitespace-nowrap">{settings.phone}</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Block */}
                <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-[3px] group">
                  <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">
                      <Share2 size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 md:mb-3 font-sans truncate">{t('social')}</h3>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        {settings.telegramLink && (
                          <a href={settings.telegramLink} target="_blank" rel="noopener noreferrer" className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-green-600 hover:text-white transition-all font-sans whitespace-nowrap">
                            Telegram
                          </a>
                        )}
                        {settings.instagramLink && (
                          <a href={settings.instagramLink} target="_blank" rel="noopener noreferrer" className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-green-600 hover:text-white transition-all font-sans whitespace-nowrap">
                            Instagram
                          </a>
                        )}
                        {settings.youtubeLink && (
                          <a href={settings.youtubeLink} target="_blank" rel="noopener noreferrer" className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-green-600 hover:text-white transition-all font-sans whitespace-nowrap">
                            YouTube
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Block */}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white dark:bg-[#242830]/40 backdrop-blur-md p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-[3px] flex flex-row items-center gap-3 sm:gap-4 md:gap-6 group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 group-hover:scale-110 transition-transform">
                    <MapPin size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1 font-sans truncate">{t('address')}</h3>
                    <p className="text-sm md:text-base font-bold text-neutral-900 dark:text-white leading-tight font-sans hyphens-auto group-hover:text-green-600 transition-colors">
                      {settings.address}
                    </p>
                  </div>
                </a>

                {/* Map Block */}
                <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl overflow-hidden h-48 sm:h-64 relative group flex-1 min-h-[200px]">
                  <iframe 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(settings.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    className="absolute inset-0 w-full h-full grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500"
                  ></iframe>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="bg-[#1A1D23] dark:bg-[#14161a] text-white pt-16 pb-8 transition-colors duration-300 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5 flex flex-col items-start">
            <div className="mb-6 p-2 -ml-2 rounded-xl bg-white/[0.03] border border-white/5 inline-block shadow-sm backdrop-blur-sm">
              <Logo className="w-40 h-auto text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.1)]" />
            </div>
            <p className="text-gray-400 text-base leading-relaxed max-w-md opacity-80">
              {t('footer_desc')}
            </p>
          </div>
          
          <div className="md:col-span-3">
            <h3 className="text-xl font-serif font-bold mb-6 text-white tracking-tight">{t('footer_links')}</h3>
            <ul className="grid grid-cols-2 md:grid-cols-1 gap-x-8 gap-y-4">
              {[
                { id: 'home', label: t('home') },
                { id: 'courses', label: t('courses') },
                { id: 'results', label: t('results') },
                { id: 'gallery', label: t('gallery') },
                { id: 'faq', label: t('faq') },
                { id: 'contact', label: t('contact') }
              ].map((link) => (
                <li key={link.id}>
                  <a 
                    href={`#${link.id}`} 
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.id);
                    }}
                    className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group py-0.5"
                  >
                    <span className="w-0 group-hover:w-4 h-[1px] bg-white transition-all duration-300"></span>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xl font-serif font-bold mb-6 text-white tracking-tight">{t('footer_contact')}</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                  <MapPin size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{t('address')}</p>
                  <p className="text-gray-300 text-sm leading-snug">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                  <Clock size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{t('working_hours')}</p>
                  <p className="text-gray-300 text-sm leading-snug">{settings.workingHours}</p>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-4">
                {settings.telegramLink && (
                  <a 
                    href={settings.telegramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-full hover:bg-[#0088cc] hover:-translate-y-1 transition-all duration-300 group shadow-lg"
                  >
                    <Send size={20} className="text-gray-300 group-hover:text-white" />
                  </a>
                )}
                {settings.instagramLink && (
                  <a 
                    href={settings.instagramLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-full hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:-translate-y-1 transition-all duration-300 group shadow-lg"
                  >
                    <Instagram size={20} className="text-gray-300 group-hover:text-white" />
                  </a>
                )}
                {settings.youtubeLink && (
                  <a 
                    href={settings.youtubeLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-3 bg-white/5 rounded-full hover:bg-[#FF0000] hover:-translate-y-1 transition-all duration-300 group shadow-lg"
                  >
                    <Youtube size={20} className="text-gray-300 group-hover:text-white" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-500 text-sm">
              &copy; 2026 {settings.siteName}. {t('footer_copyright')}
            </p>
          </div>
          <div className="flex gap-8 text-gray-600 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
            <button id="admin-footer-btn" onClick={() => navigate('/admin')} className="hover:text-gray-400 transition-colors uppercase">Admin</button>
          </div>
        </div>
      </footer>

      <ScrollToTop />
      
      <InstructorModal 
        instructor={selectedInstructor}
        isOpen={!!selectedInstructor}
        onClose={() => setSelectedInstructor(null)}
      />
    </div>
  );
}
