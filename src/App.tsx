import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Phone, MapPin, Send, Instagram, ArrowRight, Award, Share2, ExternalLink } from 'lucide-react';
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

const NavLink = ({ href, children, isActive, onClick, setActiveSection, isScrolled }: { href: string, children: React.ReactNode, isActive?: boolean, onClick?: () => void, setActiveSection?: (id: string) => void, isScrolled?: boolean }) => (
  <a 
    href={href} 
    onClick={(e) => {
      e.preventDefault();
      const targetId = href.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        if (setActiveSection) setActiveSection(targetId);
      }
      if (onClick) onClick();
    }}
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

export default function App() {
  const { t, i18n } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const { scrollY } = useScroll();
  const backgroundY = useTransform(scrollY, [0, 1000], ['0%', '30%']);
  const courses = t('courses_list', { returnObjects: true }) as any[];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY < 100) {
        setActiveSection('home');
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

  const handleConsultation = async (data: any) => {
    console.log('Konsultatsiya yuborildi:', data);
    const success = await sendTelegramMessage(data.name, data.phone, 'Konsultatsiya', '-', '-');
    return success;
  };

  const handleRegistration = async (data: any) => {
    console.log('Kursga yozilish yuborildi:', data);
    const success = await sendTelegramMessage(
      data.name, 
      data.phone, 
      data.course, 
      data.teacher, 
      data.schedule,
      data.email,
      data.contactMethod
    );
    return success;
  };

  return (
    <div className="min-h-screen text-neutral-900 dark:text-[#EAEAEA] font-sans bg-site-gradient transition-colors duration-300">
      <header className={`fixed top-0 left-0 right-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/90 dark:bg-[#1A1D23]/90 backdrop-blur-md shadow-md border-b border-neutral-200/50 dark:border-white/10 py-2.5' 
          : 'bg-transparent border-b border-transparent py-4 md:py-6'
      }`}>
        <nav className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 flex justify-between items-center">
          <a href="#home" className={`pl-2 lg:pl-6 ${!isScrolled ? "drop-shadow-md" : ""}`} onClick={(e) => { 
            e.preventDefault(); 
            document.getElementById('home')?.scrollIntoView({ behavior: 'smooth' });
            setActiveSection('home');
          }}>
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
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        setActiveSection(item.id);
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
              backgroundImage: `linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1920&h=1080&auto=format&fit=crop')`,
              y: backgroundY
            }}
          ></motion.div>
          
          <div className="relative z-10 max-w-5xl mx-auto mt-16 px-2 sm:px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold mb-4 sm:mb-6 leading-[1.1] break-words text-white drop-shadow-lg">
                {t('hero_title')}
              </h2>
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
              <a href="#contact">
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
                  const isFirst = i === 0;
                  const isLast = i === courses.length - 1;
                  const isLarge = isFirst || isLast;
                  
                  return (
                    <div 
                      key={i} 
                      className={`
                        ${isFirst ? 'md:col-span-2 lg:col-span-2' : ''}
                        ${isLast ? 'md:col-span-1 lg:col-span-2' : ''}
                        flex flex-col
                      `}
                    >
                      <CourseCard 
                        index={i} 
                        {...c} 
                        isLarge={isLarge}
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
                      alt="About Us" 
                      className="w-full h-full object-cover aspect-[4/5]"
                      referrerPolicy="no-referrer"
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
                      Bizning markazimizda <span className="text-emerald-600 dark:text-emerald-400 font-bold">German language</span> (Nemis tili) o'rganish nafaqat bilim olish, balki yangi imkoniyatlar eshigini ochishdir. 
                    </p>
                    <p>
                      Biz har bir o'quvchining <span className="text-neutral-900 dark:text-white font-bold underline decoration-emerald-500/30 underline-offset-8">high results</span> (yuqori natijalar) ga erishishi uchun individual yondashuv va eng zamonaviy metodikalardan foydalanamiz.
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

            <section id="contact" className="grid grid-cols-1 lg:grid-cols-2 gap-10 py-12 md:py-20 items-stretch max-w-7xl mx-auto px-4 sm:px-6 scroll-mt-24">
              {/* Form Column - Dynamic Height */}
              <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-colors duration-300 h-full w-full overflow-hidden flex flex-col justify-center">
                <ContactForm onSendMessage={handleConsultation} />
              </div>
              
              {/* Info Column - Centered Vertically */}
              <div className="flex flex-col gap-y-6 justify-center h-full">
                {/* Phone Block */}
                <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md group">
                  <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">
                      <Phone size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1 font-sans truncate">{t('phone')}</h3>
                      <div className="flex flex-col sm:flex-row sm:gap-4">
                        <a href="tel:+998940473132" className="text-sm md:text-base font-bold text-neutral-900 dark:text-white hover:text-green-600 transition-colors font-sans whitespace-nowrap">+998 94 047 31 32</a>
                        <a href="tel:+998781139495" className="text-sm md:text-base font-bold text-neutral-900 dark:text-white hover:text-green-600 transition-colors font-sans whitespace-nowrap">+998 78 113 94 95</a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Block */}
                <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md p-6 md:p-8 border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-all duration-300 hover:shadow-md group">
                  <div className="flex flex-row items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">
                      <Share2 size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1 md:mb-3 font-sans truncate">{t('social')}</h3>
                      <div className="flex flex-wrap gap-2 md:gap-3">
                        <a href="https://t.me/INTENSIVE_Nemis_Tili" target="_blank" rel="noopener noreferrer" className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-green-600 hover:text-white transition-all font-sans whitespace-nowrap">
                          Telegram
                        </a>
                        <a href="https://www.instagram.com/intensive_nemis_tili/" target="_blank" rel="noopener noreferrer" className="px-3 md:px-4 py-1.5 md:py-2 bg-gray-50 dark:bg-white/5 rounded-lg md:rounded-xl text-xs md:text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-green-600 hover:text-white transition-all font-sans whitespace-nowrap">
                          Instagram
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Block with Interactive Map Hover Effect */}
                <div className="bg-white dark:bg-[#242830]/40 backdrop-blur-md border border-gray-100 dark:border-white/10 shadow-sm rounded-2xl transition-all duration-500 hover:shadow-md group flex flex-col overflow-hidden">
                  <div className="p-6 md:p-8 flex flex-row items-center gap-3 sm:gap-4 md:gap-6">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-green-50 dark:bg-green-500/10 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform flex-shrink-0">
                      <MapPin size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-0.5 md:mb-1 font-sans truncate">{t('address')}</h3>
                      <p className="text-sm md:text-base font-bold text-neutral-900 dark:text-white leading-tight font-sans hyphens-auto">
                        {t('address_text', "Toshkent shahri, Cho'pon ota ko'chasi, INTENSIVE Nemis tili markazi")}
                      </p>
                    </div>
                  </div>
                  
                  {/* Interactive Map - Hidden by default, expands on hover */}
                  <div className="relative max-h-0 opacity-0 group-hover:max-h-[200px] group-hover:opacity-100 transition-all duration-700 ease-in-out shadow-inner border-t border-gray-100 dark:border-white/5 overflow-hidden">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2998.27318854444!2d69.2110868!3d41.2830482!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38ae8d6d19d245ed%3A0x3abeb45f8605133c!2z0KPRh9C10LHQvdGL0Lkg0YbQtdC90YLRgCBCcmlnaHQgRnV0dXJlIEVkdWNhdGlvbg!5e0!3m2!1suz!2s!4v1710760000000!5m2!1suz!2s"
                      className="w-full h-[200px] border-0 grayscale dark:invert dark:opacity-80 transition-all duration-700 group-hover:grayscale-0 dark:group-hover:invert-0 dark:group-hover:opacity-100"
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                    
                    {/* Backdrop Blur Button Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors duration-500">
                      <a 
                        href="https://www.google.com/maps/place/%D0%A3%D1%87%D0%B5%D0%B1%D0%BD%D1%8B%D0%B9+%D1%86%D0%B5%D0%BD%D1%82%D1%80+Bright+Future+Education/@41.2830482,69.2110868,20.47z/data=!4m6!3m5!1s0x38ae8d6d19d245ed:0x3abeb45f8605133c!8m2!3d41.2831089!4d69.2112071!16s%2Fg%2F11hdxvwycz?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="pointer-events-auto bg-white/20 dark:bg-black/20 backdrop-blur-md border border-white/30 dark:border-white/10 px-6 py-3 rounded-2xl text-sm font-bold text-white shadow-2xl flex items-center gap-3 hover:bg-green-600 hover:border-green-400 transition-all duration-300 scale-90 group-hover:scale-100 opacity-0 group-hover:opacity-100 font-sans"
                      >
                        <ExternalLink size={18} />
                        {t('view_map')}
                      </a>
                    </div>
                  </div>
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
                  <a href={`#${link.id}`} className="text-gray-400 hover:text-white transition-all duration-300 flex items-center gap-2 group py-0.5">
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
                  <p className="text-gray-300 text-sm leading-snug">Toshkent shahri, Cho'pon ota ko'chasi, INTENSIVE Nemis tili markazi</p>
                </div>
              </div>

              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white/5 rounded-xl group-hover:bg-white/10 transition-colors">
                  <Phone size={20} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">{t('phone')}</p>
                  <div className="flex flex-col gap-1">
                    <a href="tel:+998940473132" className="text-gray-300 text-sm hover:text-white transition-colors">+998 94 047 31 32</a>
                    <a href="tel:+998781139495" className="text-gray-300 text-sm hover:text-white transition-colors">+998 78 113 94 95</a>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <a 
                  href="https://t.me/INTENSIVE_Nemis_Tili" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 rounded-full hover:bg-[#0088cc] hover:-translate-y-1 transition-all duration-300 group shadow-lg"
                >
                  <Send size={20} className="text-gray-300 group-hover:text-white" />
                </a>
                <a 
                  href="https://www.instagram.com/intensive_nemis_tili/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-3 bg-white/5 rounded-full hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] hover:-translate-y-1 transition-all duration-300 group shadow-lg"
                >
                  <Instagram size={20} className="text-gray-300 group-hover:text-white" />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-gray-500 text-sm">
            &copy; 2026 INTENSIVE Nemis tili markazi. {t('footer_copyright')}
          </p>
          <div className="flex gap-8 text-gray-600 text-xs uppercase tracking-widest font-bold">
            <a href="#" className="hover:text-gray-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-gray-400 transition-colors">Terms of Service</a>
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
