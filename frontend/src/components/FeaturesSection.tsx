import type React from "react"
import barChart from "../assets/bar-chart-landing.png" 

const FeaturesSection: React.FC = () => {
  return (
    <section className="min-h-screen w-full bg-gray-100 py-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div className="flex items-center justify-center">
            {/* <div className="overflow-hidden rounded-lg bg-teal-800 p-6 text-white"> */}
              {/* <div className="mb-4"> */}
                {/* <div className="mb-1 text-sm">Saving, Month</div> */}
                {/* <div className="text-3xl font-bold">$ 1852.00</div> */}
                {/* <div className="text-sm">Increase of 12% from last month</div> */}
              {/* </div> */}

              {/* <div className="overflow-hidden rounded-lg bg-primary-dark p-6 text-white"> */}
                {/* <div className="mb-4">
                  <div className="mb-1 text-sm">Saving, Month</div>
                  <div className="text-3xl font-bold">$ 1852.00</div>
                  <div className="text-sm">Increase of 12% from last month</div>
                </div> */}

                <div className="mt-6">
                  <img 
                    src={barChart} 
                    alt="Monthly savings chart showing increases with June at $20,000"
                    className="h-auto w-3/4 mx-auto"
                  />
                </div>
              {/* </div> */}
            {/* </div> */}
          </div>

          <div className="flex flex-col justify-center">
            <h2 className="mb-8 text-4xl font-bold">All Your Money Needs In One App</h2>

            <div className="space-y-6">
              <div className="overflow-hidden rounded-lg border-l-4 border-green-500 bg-green-50 p-6">
                <h3 className="mb-2 text-lg font-semibold">Expenses Tracker</h3>
                <p className="text-gray-700">
                  Track your daily spending, categorize expenses, and get insights to optimize your budget effortlessly
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">Asset Management</h3>
                <p className="text-gray-700">
                  Monitor your assets, from savings to investments, and make informed financial decisions with real-time
                  data.
                </p>
              </div>

              <div className="overflow-hidden rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm">
                <h3 className="mb-2 text-lg font-semibold">AI-Powered Financial Assistance</h3>
                <p className="text-gray-700">
                  Get smart budgeting tips, personalized financial advice, and investment insights—all powered by AI.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
