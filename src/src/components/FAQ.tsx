import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const FAQ = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const faqs = (t('faq_list', { returnObjects: true }) || []) as { q: string, a: string }[];
  const displayedFaqs = showAll ? faqs : (faqs || []).slice(0, 5);

  return (
    <section id="faq" className="py-20 transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-4xl font-serif font-bold text-neutral-900 dark:text-[#EAEAEA] mb-12 text-center">{t('faq_title')}</h2>
        <div className="space-y-4">
          {displayedFaqs.map((faq, i) => (
            <div key={i} className="bg-white dark:bg-[#242830]/40 backdrop-blur-md rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm overflow-hidden transition-colors duration-300">
              <button 
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex justify-between items-center p-6 text-left font-bold text-neutral-900 dark:text-[#EAEAEA] hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
              >
                <h3 className="text-base md:text-lg font-bold pr-8">{faq.q}</h3>
                {openIndex === i ? <ChevronUp className="shrink-0" /> : <ChevronDown className="shrink-0" />}
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6 text-neutral-600 dark:text-[#A0AEC0] leading-relaxed"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {faqs.length > 5 && (
          <div className="mt-10 text-center">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-neutral-900 dark:text-[#EAEAEA] font-bold flex items-center gap-2 mx-auto hover:opacity-70 transition-opacity"
            >
              {showAll ? t('show_less') : t('view_more')}
              <ChevronDown className={`transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
