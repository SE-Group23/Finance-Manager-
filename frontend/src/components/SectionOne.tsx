// import React, { useState } from 'react';
// import { Card } from '@/components/ui/card';
// // import { Link } from 'react-router-dom'; // Import Link from react-router-dom
// import { Link, useNavigate } from 'react-router-dom';

// const options = [
//   { title: "Expenses Tracker", description: "Track your daily spending, categorize expenses, and get insights to optimize your budget effortlessly", bgColor: "bg-yellow-100" },
//   { title: "Asset Management", description: "Monitor your assets, from savings to investments, and make informed financial decisions with real-time data.", bgColor: "bg-gray-100" },
//   { title: "AI-Powered Financial Assistance", description: "Get smart budgeting tips, personalized financial advice, and investment insights—all powered by AI.", bgColor: "bg-gray-100" }
// ];

// const SectionOne = () => {
//   const [activeIndex, setActiveIndex] = useState(0);
//   const navigate = useNavigate(); // Initialize useNavigate hook
//   console.log("Here....")

//   const handleSignInClick = () => {
//     // This will navigate to the LoginPage
//     console.log("Navigating....")
//     navigate('/signin');
//   };

//   return (
//     <section className="section light-gradient flex items-center justify-center py-12">
//       <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 animate-fade-in">
//         <div className="w-full lg:w-1/2 flex justify-center">
//           <Card className="bg-white/90 shadow-lg p-5 rounded-xl w-[85%]">
//             <div className="bg-finapp-teal-dark p-5 rounded-lg text-white">
//               <h3 className="text-md font-semibold">Saving Month</h3>
//               <div className="text-2xl font-bold mt-1">$ 1852,00</div>
//               <div className="text-xs mt-1">Increase of 12% from last month</div>
              
//               <div className="mt-6 relative h-32">
//                 <div className="absolute bottom-0 left-0 w-full flex items-end justify-between h-24">
//                   <div className="w-1/6 bg-white/70 rounded-t-md h-16 mx-1"></div>
//                   <div className="w-1/6 bg-white/70 rounded-t-md h-24 mx-1"></div>
//                   <div className="w-1/6 bg-white/70 rounded-t-md h-12 mx-1"></div>
//                   <div className="w-1/6 bg-finapp-green rounded-t-md h-32 mx-1 relative">
//                     <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-finapp-teal text-xs px-2 py-1 rounded-full font-semibold">$1,800.00</div>
//                   </div>
//                   <div className="w-1/6 bg-white/70 rounded-t-md h-20 mx-1"></div>
//                   <div className="w-1/6 bg-white/70 rounded-t-md h-16 mx-1"></div>
//                 </div>
//                 <div className="absolute bottom-0 w-full border-t border-white/30"></div>
//                 <div className="absolute bottom-8 w-full border-t border-white/30 border-dashed"></div>
//                 <div className="absolute bottom-16 w-full border-t border-white/30 border-dashed"></div>
//                 <div className="absolute bottom-24 w-full border-t border-white/30 border-dashed"></div>
//               </div>
              
//               <div className="flex justify-between text-xs mt-2">
//                 <div>April</div>
//                 <div>May</div>
//                 <div>June</div>
//                 <div>July</div>
//               </div>
//             </div>
//           </Card>
//         </div>
        
//         <div className="w-full lg:w-1/2 space-y-4">
//           <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">
//             All Your Money Needs<br/>In One App
//           </h1>
          
//           <div className="relative border-l-4 border-gray-300 pl-4 space-y-3 mt-8">
//             {/* Moving small bar */}
//             <div
//               className="absolute left-0 transition-all duration-300 ease-in-out"
//               style={{
//                 top: `${activeIndex * 100}%`,
//                 transition: 'top 0.3s ease',
//                 width: '4px', // Making the moving bar a bit thicker
//                 backgroundColor: '#4CAF50' // Making the color more distinct
//               }}
//             />
            
//             {/* Options */}
//             {options.map((option, index) => (
//               <div
//                 key={index}
//                 className="relative"
//                 onMouseEnter={() => setActiveIndex(index)}
//               >
//                 <Card className={`p-3 rounded-xl transition-all duration-300 ${index === activeIndex ? 'bg-yellow-100' : 'bg-gray-100'}`}>
//                   <h3 className="text-md font-bold">{option.title}</h3>
//                   <p className="text-gray-600 mt-1 text-sm">{option.description}</p>
//                 </Card>
//               </div>
//             ))}
//           </div>

//           {/* Sign In Button */}
//           {/* <div className="mt-8">
//             <Link to="/signin">
//               <button
//                 onClick={handleSignInClick}
//                 className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
//               >
//                 Sign In
//               </button>
//             </Link>
//           </div> */}
//           <div className="mt-8">
//             <button
//               onClick={handleSignInClick}  // Use the handleSignInClick function for navigation
//               className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600"
//             >
//               Sign In
//             </button>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default SectionOne;

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom

const options = [
  { title: "Expenses Tracker", description: "Track your daily spending, categorize expenses, and get insights to optimize your budget effortlessly", bgColor: "bg-yellow-100" },
  { title: "Asset Management", description: "Monitor your assets, from savings to investments, and make informed financial decisions with real-time data.", bgColor: "bg-gray-100" },
  { title: "AI-Powered Financial Assistance", description: "Get smart budgeting tips, personalized financial advice, and investment insights—all powered by AI.", bgColor: "bg-gray-100" }
];

const SectionOne = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="section light-gradient flex items-center justify-center py-12">
      <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center gap-8 animate-fade-in">
        <div className="w-full lg:w-1/2 flex justify-center">
          <Card className="bg-white/90 shadow-lg p-5 rounded-xl w-[85%]">
            <div className="bg-finapp-teal-dark p-5 rounded-lg text-white">
              <h3 className="text-md font-semibold">Saving Month</h3>
              <div className="text-2xl font-bold mt-1">$ 1852,00</div>
              <div className="text-xs mt-1">Increase of 12% from last month</div>
              
              <div className="mt-6 relative h-32">
                <div className="absolute bottom-0 left-0 w-full flex items-end justify-between h-24">
                  <div className="w-1/6 bg-white/70 rounded-t-md h-16 mx-1"></div>
                  <div className="w-1/6 bg-white/70 rounded-t-md h-24 mx-1"></div>
                  <div className="w-1/6 bg-white/70 rounded-t-md h-12 mx-1"></div>
                  <div className="w-1/6 bg-finapp-green rounded-t-md h-32 mx-1 relative">
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-finapp-teal text-xs px-2 py-1 rounded-full font-semibold">$1,800.00</div>
                  </div>
                  <div className="w-1/6 bg-white/70 rounded-t-md h-20 mx-1"></div>
                  <div className="w-1/6 bg-white/70 rounded-t-md h-16 mx-1"></div>
                </div>
                <div className="absolute bottom-0 w-full border-t border-white/30"></div>
                <div className="absolute bottom-8 w-full border-t border-white/30 border-dashed"></div>
                <div className="absolute bottom-16 w-full border-t border-white/30 border-dashed"></div>
                <div className="absolute bottom-24 w-full border-t border-white/30 border-dashed"></div>
              </div>
              
              <div className="flex justify-between text-xs mt-2">
                <div>April</div>
                <div>May</div>
                <div>June</div>
                <div>July</div>
              </div>
            </div>
          </Card>
        </div>
        
        <div className="w-full lg:w-1/2 space-y-4">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-black">
            All Your Money Needs<br/>In One App
          </h1>
          
          <div className="relative border-l-4 border-gray-300 pl-4 space-y-3 mt-8">
            {/* Moving small bar */}
            <div
              className="absolute left-0 transition-all duration-300 ease-in-out"
              style={{
                top: `${activeIndex * 100}%`,
                transition: 'top 0.3s ease',
                width: '4px', // Making the moving bar a bit thicker
                backgroundColor: '#4CAF50' // Making the color more distinct
              }}
            />
            
            {/* Options */}
            {options.map((option, index) => (
              <div
                key={index}
                className="relative"
                onMouseEnter={() => setActiveIndex(index)}
              >
                <Card className={`p-3 rounded-xl transition-all duration-300 ${index === activeIndex ? 'bg-yellow-100' : 'bg-gray-100'}`}>
                  <h3 className="text-md font-bold">{option.title}</h3>
                  <p className="text-gray-600 mt-1 text-sm">{option.description}</p>
                </Card>
              </div>
            ))}
          </div>

          {/* Sign In Button */}
          {/* <div className="mt-8">
            <Link to="/signin">
              <button className="px-6 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600">
                Sign In
              </button>
            </Link>
          </div> */}
        </div>
      </div>
    </section>
  );
};

export default SectionOne;
