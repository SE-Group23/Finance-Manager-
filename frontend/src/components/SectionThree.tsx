import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';

const TestimonialCard = ({
  quote,
  name,
  rating,
  avatarIndex,
  isActive,
}: {
  quote: string;
  name: string;
  rating: number;
  avatarIndex: number;
  isActive: boolean;
}) => {
  return (
    <Card
      className={`p-6 rounded-xl shadow-md h-full transition-all duration-500 ease-in-out ${
        isActive ? 'bg-green-600 text-white scale-105' : 'bg-white text-gray-800'
      }`}
    >
      <div className={`text-4xl font-serif mb-4 ${isActive ? 'text-white' : 'text-finapp-teal'}`}>"</div>
      <p className="mb-6">{quote}</p>

      <div className="flex items-center mt-auto">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 font-bold ${
            isActive ? 'bg-white text-green-600' : 'bg-finapp-teal text-white'
          }`}
        >
          {avatarIndex}
        </div>
        <div>
          <p className="font-semibold">{name}</p>
          <div className="flex">
            {Array(rating)
              .fill(0)
              .map((_, i) => (
                <svg
                  key={i}
                  className={`w-4 h-4 ${isActive ? 'text-yellow-300' : 'text-finapp-green'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const SectionThree = () => {
  const testimonials = [
    {
      quote: 'The AI gives me smart tips based on my spending—feels like a personal finance coach!',
      name: 'Mike Torello',
      avatarIndex: 1,
    },
    {
      quote: 'All my finances in one place—saving and investing feels so much simpler!',
      name: 'Namwar Rauf',
      avatarIndex: 2,
    },
    {
      quote: 'Tracking my spending is effortless now—I finally stay within budget and never miss a deadline!',
      name: 'Thomas Magnum',
      avatarIndex: 3,
    },
    {
      quote: 'I love the simplicity of the dashboard and the personalized insights it provides!',
      name: 'Angela Moss',
      avatarIndex: 4,
    },
    {
      quote: 'This app finally made budgeting feel manageable and even fun.',
      name: 'Elliot Alderson',
      avatarIndex: 5,
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000); // Rotate every 3 seconds
    return () => clearInterval(interval);
  }, [testimonials.length]);

  const total = testimonials.length;

  const left = testimonials[(currentIndex - 1 + total) % total];
  const center = testimonials[currentIndex];
  const right = testimonials[(currentIndex + 1) % total];

  return (
    <section className="section light-gradient flex items-center justify-center">
      <div className="container mx-auto px-4 py-16 animate-fade-in">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-500 text-sm mb-6">
            <span className="text-orange-500 mr-2">▲</span>
            TESTIMONIAL
          </div>
          <h2 className="text-4xl md:text-5xl font-bold">Hear From Our Users</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 transition-all duration-500">
          <TestimonialCard {...left} rating={5} isActive={false} />
          <TestimonialCard {...center} rating={5} isActive={true} />
          <TestimonialCard {...right} rating={5} isActive={false} />
        </div>
      </div>
    </section>
  );
};

export default SectionThree;
