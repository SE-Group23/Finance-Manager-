
import React, { useEffect, useRef, useState } from 'react';
import SectionOne from './SectionTwo'; // Using SectionTwo as SectionOne
import SectionTwo from './SectionOne'; // Using SectionOne as SectionTwo
import SectionThree from './SectionThree';

const ScrollablePage = () => {
  const [activeSection, setActiveSection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  
  // Navigation dots
  const scrollToSection = (index: number) => {
    sectionRefs[index].current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const scrollPosition = window.scrollY;
      const windowHeight = window.innerHeight;
      
      // Determine which section is in view
      const sectionIndex = Math.round(scrollPosition / windowHeight);
      setActiveSection(Math.min(Math.max(sectionIndex, 0), 2));
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <div ref={containerRef} className="scroll-container">
      <div ref={sectionRefs[0]}>
        <SectionOne />
      </div>
      <div ref={sectionRefs[1]}>
        <SectionTwo />
      </div>
      <div ref={sectionRefs[2]}>
        <SectionThree />
      </div>
      
      {/* Navigation dots */}
      <div className="fixed right-8 top-1/2 transform -translate-y-1/2 z-50">
        <div className="flex flex-col gap-4">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => scrollToSection(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                activeSection === index 
                  ? 'bg-finapp-teal scale-125' 
                  : 'bg-gray-400 hover:bg-gray-600'
              }`}
              aria-label={`Scroll to section ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ScrollablePage;
