import type React from "react"
import reviewer1 from "../assets/reviewer1.svg"
import reviewer2 from "../assets/reviewer2.svg" 
import reviewer3 from "../assets/reviewer3.svg"

const TestimonialsSection: React.FC = () => {
  return (
    <section className="min-h-screen w-full bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-2 flex justify-center">
          <div className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
            <span className="mr-1">🔥</span> TESTIMONIAL
          </div>
        </div>

        <h2 className="mb-16 text-center text-4xl font-bold">Hear From Our Users</h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Testimonial 1 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
              </svg>
            </div>
            <p className="mb-4 text-gray-700">
              The AI gives me smart tips based on my spending—feels like a personal finance coach!
            </p>
            <div className="flex items-center">
              <div className="mr-4 h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                <img
                //   src="/placeholder.svg?height=40&width=40"
                  src={reviewer1}  
                  alt="Mike Torello"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="mb-1 flex text-green-500">★★★★★</div>
                <div className="font-medium">Mike Torello</div>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="rounded-lg border border-gray-200 bg-teal-800 p-6 text-white shadow-sm">
            <div className="mb-4 text-green-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
              </svg>
            </div>
            <p className="mb-4">All my finances in one place—saving and investing feels so much simpler!</p>
            <div className="flex items-center">
              <div className="mr-4 h-10 w-10 overflow-hidden rounded-full bg-teal-700">
                <img
                //   src="/placeholder.svg?height=40&width=40"
                  src={reviewer2}
                  alt="Namwar Rauf"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="mb-1 flex text-green-400">★★★★★</div>
                <div className="font-medium">Namwar Rauf</div>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-green-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"></path>
                <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"></path>
              </svg>
            </div>
            <p className="mb-4 text-gray-700">
              Tracking my spending is effortless now—I finally stay within budget and never miss a deadline!
            </p>
            <div className="flex items-center">
              <div className="mr-4 h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                <img
                //   src="/placeholder.svg?height=40&width=40"
                  src={reviewer3}
                  alt="Thomas Magnum"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="mb-1 flex text-green-500">★★★★★</div>
                <div className="font-medium">Thomas Magnum</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
