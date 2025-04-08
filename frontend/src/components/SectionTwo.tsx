import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

const SectionTwo = () => {
  return (
    <section className="section bg-gradient-to-b from-teal-700 to-teal-900 flex items-center justify-center relative overflow-hidden min-h-screen px-6 md:px-12 py-4">
      {/* Navbar */}
      <div className="absolute top-0 left-0 w-full py-4 px-6 md:px-12 flex justify-center items-center z-20 bg-transparent backdrop-blur-sm">
        <div className="flex space-x-6 md:space-x-10">
          <a href="#" className="text-white/90 hover:text-white transition duration-300">Explore</a>
          <a href="#" className="text-white/90 hover:text-white transition duration-300">About Us</a>
          <a href="#" className="text-white/90 hover:text-white transition duration-300">Contact</a>
        </div>
        {/* Sign In button on the top right */}
        <Link to="/signin">
          <Button variant="outline" className="absolute top-4 right-4 text-white border-white/30 hover:bg-white/10 px-6 py-2 rounded-lg bg-transparent">
            Sign In
          </Button>
        </Link>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto max-w-5xl px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
        {/* Text Section */}
        <div className="animate-fade-in">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-black/20 text-white/90 text-sm mb-6">
            <span className="w-3 h-3 bg-green-400 rounded-full mr-2"></span>
            100% TRUSTED PLATFORM
          </div>
          
          <h1 className="text-2xl md:text-6xl font-bold text-white leading-tight">
            Finance With<br/>
            Security And<br/>
            <span className="text-[#FEEF56]">Flexibility</span>
          </h1>
          
          <p className="text-white/90 my-6 text-lg max-w-md">
            Easily Track Spending, Manage Investments, And Stay On Top Of All Your Deadlines - All In One Secure Platform. Get AI-Powered Insights To Optimize Your Financial Future!
          </p>
          <Link to = "/signup">
            <Button className="bg-[#00C853] hover:bg-[#00A844] text-white rounded-full py-4 px-8 text-lg flex items-center">
              Open Account
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
        </div>
        
        {/* Image Section */}
        <div className="relative animate-fade-in flex justify-center lg:justify-end">
          <div className="relative w-full max-w-xs">
            <img 
              src="/lovable-uploads/landing_image.png" 
              alt="Financial Dashboard" 
              className="w-full object-contain z-10 relative drop-shadow-lg"
            />
            
            {/* Floating Dollar Sign */}
            <div className="absolute top-1/4 -left-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg">
              <span className="text-[#00C853] text-xl font-bold">$</span>
            </div>
            
            {/* Rotating Gear */}
            <div className="absolute bottom-1/3 right-0 w-16 h-16 bg-white/10 backdrop-blur-md rounded-full p-2 flex items-center justify-center">
              <div className="w-full h-full rounded-full border-4 border-dashed border-[#00C853]/40 animate-spin-slow"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionTwo;
