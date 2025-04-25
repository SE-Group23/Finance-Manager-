"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { fetchZakatAndTaxSummary } from "../services/zakatTaxService"
import { useNavigate } from "react-router-dom"

interface ZakatSummary {
  nisaab_status: {
    status: string
    based_on: string
  }
  current_assets: number
  cash_savings: number
  total_assets: number
  asset_breakdown: {
    gold: number
    currency: number
    stocks: number
  }
  nisaab_threshold: number
  zakat_rate: number
  zakat_payable: number
}

interface TaxSummary {
  threshold_status: {
    status: string
    based_on: string
  }
  annual_income: number
  tax_bracket: string
  tax_rate: number
  tax_payable: number
  due_date: {
    date: string
    days_remaining: number
  }
}

// Default empty states - will be replaced with real data
const emptyZakat: ZakatSummary = {
  nisaab_status: {
    status: "Loading...",
    based_on: "Loading...",
  },
  current_assets: 0,
  cash_savings: 0,
  total_assets: 0,
  asset_breakdown: {
    gold: 0,
    currency: 0,
    stocks: 0,
  },
  nisaab_threshold: 0,
  zakat_rate: 0,
  zakat_payable: 0,
}

const emptyTax: TaxSummary = {
  threshold_status: {
    status: "Loading...",
    based_on: "Loading...",
  },
  annual_income: 0,
  tax_bracket: "Loading...",
  tax_rate: 0,
  tax_payable: 0,
  due_date: {
    date: "Loading...",
    days_remaining: 0,
  },
}

const ZakatTaxPage: React.FC = () => {
  const [zakat, setZakat] = useState<ZakatSummary>(emptyZakat)
  const [tax, setTax] = useState<TaxSummary>(emptyTax)
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState(false)
  const [hasZakatData, setHasZakatData] = useState(true)
  const [hasTaxData, setHasTaxData] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setApiError(false)

        const response = await fetchZakatAndTaxSummary()

        // Check if the response contains the expected data structure
        if (response && response.zakat && response.tax) {
          // Check if Zakat data exists (assets are present)
          const zakatData = response.zakat
          const hasAssets =
            zakatData.current_assets > 0 ||
            zakatData.cash_savings > 0 ||
            zakatData.total_assets > 0 ||
          Object.values(zakatData.asset_breakdown).some((value) => (value as number) > 0)

          setHasZakatData(hasAssets)

          // If no assets, update the status
          if (!hasAssets) {
            zakatData.nisaab_status = {
              status: "Nisaab Threshold Not Met",
              based_on: "no assets added",
            }
            zakatData.zakat_payable = 0
          }

          setZakat(zakatData)

          // Check if Tax data exists (income is present)
          const taxData = response.tax
          const hasIncome = taxData.annual_income > 0

          setHasTaxData(hasIncome)

          // If no income, update the status
          if (!hasIncome) {
            taxData.threshold_status = {
              status: "Tax Threshold Not Met",
              based_on: "no income added",
            }
            taxData.tax_payable = 0
          }

          setTax(taxData)
        } else {
          // Use empty defaults but don't show API error
          console.warn("API response missing expected data structure", response)
          setApiError(true)
        }
      } catch (err) {
        console.error("Failed to load Zakat & Tax data:", err)
        setApiError(true)
        // State already initialized with defaults, so no need to set those again
      } finally {
        setLoading(false)
      }
    }

    // Fetch real data from the service
    fetchData()
  }, [])

  // Navigation handlers
  const navigateToAssets = () => {
    navigate("/assets")
  }

  const navigateToTransactions = () => {
    navigate("/transactions")
  }

  return (
    <div className="flex h-screen bg-background-light font-inter">
      <Sidebar activePage="zakat-tax" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-background-light py-3 px-4 border-b">
          <h1 className="text-xl font-semibold text-primary-dark">Zakat & Tax</h1>
        </header>

        <main className="flex-1 p-4 flex flex-col">
          <div className="max-w-5xl mx-auto w-full">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <p>Loading Zakat & Tax data...</p>
              </div>
            ) : apiError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-3 text-center">
                <p className="text-red-700 mb-2">Failed to load data</p>
                <button
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                  onClick={() => window.location.reload()}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Zakat Card */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl shadow p-4 h-full">
                    <h2 className="text-lg font-bold mb-3">Zakat</h2>

                    <div className={`mb-4 p-3 rounded-lg ${hasZakatData ? "bg-box-color" : "bg-gray-100"}`}>
                      <p className="font-semibold">{zakat.nisaab_status.status}</p>
                      <p className="text-xs text-gray-600">based on {zakat.nisaab_status.based_on}</p>
                    </div>

                    {!hasZakatData ? (
                      <div className="py-4 text-center">
                        <p className="text-gray-500 mb-2">No asset data available</p>
                        <p className="text-sm text-gray-400 mb-4">Add assets to calculate your Zakat</p>
                        <button
                          onClick={navigateToAssets}
                          className="px-4 py-2 bg-primary-dark hover:bg-primary-medium transition-colors text-white rounded-lg font-medium text-sm flex items-center justify-center mx-auto"
                        >
                          Add Asset Information
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Current Net Worth</p>
                          <p className="text-2xl font-bold">PKR {zakat.current_assets.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Cash & Savings</p>
                          <p className="text-xl font-bold">PKR {zakat.cash_savings.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Total Assets</p>
                          <p className="text-xl font-bold">PKR {zakat.total_assets.toLocaleString()}</p>
                        </div>

                        {/* Asset breakdown in vertical layout */}
                        <div className="space-y-2">
                          <div>
                            <p className="text-sm text-gray-600">Gold</p>
                            <p className="text-lg font-bold">PKR {zakat.asset_breakdown.gold.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Currency</p>
                            <p className="text-lg font-bold">PKR {zakat.asset_breakdown.currency.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Stocks</p>
                            <p className="text-lg font-bold">PKR {zakat.asset_breakdown.stocks.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Zakat Payable Card */}
                  <div
                    className={`py-4 px-4 text-white rounded-xl shadow ${hasZakatData ? "bg-primary-dark" : "bg-gray-400"}`}
                  >
                    <p className="text-sm mb-1">Zakat Payable</p>
                    <p className="text-2xl font-bold">
                      {hasZakatData ? `PKR ${zakat.zakat_payable.toLocaleString()}` : "PKR 0"}
                    </p>
                  </div>
                </div>

                {/* Tax Card */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-xl shadow p-4 h-full">
                    <h2 className="text-lg font-bold mb-3">Tax</h2>

                    <div className={`mb-4 p-3 rounded-lg ${hasTaxData ? "bg-box-color" : "bg-gray-100"}`}>
                      <p className="font-semibold">{tax.threshold_status.status}</p>
                      <p className="text-xs text-gray-600">based on {tax.threshold_status.based_on}</p>
                    </div>

                    {!hasTaxData ? (
                      <div className="py-8 text-center">
                        <p className="text-gray-500 mb-2">No income data available</p>
                        <p className="text-sm text-gray-400 mb-4">Add income to calculate your Tax</p>
                        <button
                          onClick={navigateToTransactions}
                          className="px-4 py-2 bg-primary-dark hover:bg-primary-medium transition-colors text-white rounded-lg font-medium text-sm flex items-center justify-center mx-auto"
                        >
                          Add Income Information
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Annual Income</p>
                          <p className="text-2xl font-bold">PKR {tax.annual_income.toLocaleString()}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Tax Bracket</p>
                          <p className="text-xl font-bold">{tax.tax_bracket.replace("$", "PKR ")}</p>
                        </div>

                        <div>
                          <p className="text-sm text-gray-600">Tax Rate</p>
                          <p className="text-xl font-bold">{tax.tax_rate}%</p>
                        </div>

                        {tax.due_date && (
                          <div className="bg-chatbot-highlight p-3 rounded-xl">
                            <p className="text-sm font-medium">Last Date To Pay</p>
                            <p className="text-lg font-bold">{tax.due_date.date}</p>
                            <div className="mt-1 inline-block bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                              {tax.due_date.days_remaining} days remaining
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Tax Payable Card */}
                  <div
                    className={`py-4 px-4 text-white rounded-xl shadow ${hasTaxData ? "bg-primary-dark" : "bg-gray-400"}`}
                  >
                    <p className="text-sm mb-1">Tax Payable</p>
                    <p className="text-2xl font-bold">
                      {hasTaxData ? `PKR ${tax.tax_payable.toLocaleString()}` : "PKR 0"}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default ZakatTaxPage
