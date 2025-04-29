"use client"

import type React from "react"
import { useEffect } from "react"
import Sidebar from "../components/Sidebar"
import { useNavigate } from "react-router-dom"
import { useAppDispatch, useAppSelector } from "../hooks"
import { fetchZakatTaxData } from "../store/slices/zakatTaxSlice"

const ZakatTaxPage: React.FC = () => {
  const dispatch = useAppDispatch()
  const { zakat, tax, loading, error, hasZakatData, hasTaxData } = useAppSelector((state) => state.zakatTax)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch(fetchZakatTaxData())
  }, [dispatch])

  const navigateToAssets = () => {
    navigate("/assets")
  }

  const navigateToTransactions = () => {
    navigate("/transactions")
  }

  return (
    <div className="flex min-h-screen bg-background-light font-inter">
      <Sidebar activePage="zakat-tax" />

      <div className="flex-1 flex flex-col overflow-auto">
        <header className="bg-background-light py-3 px-4 border-b">
          <h1 className="text-xl font-semibold text-primary-dark">Zakat & Tax</h1>
        </header>

        <main className="flex-1 p-4 flex flex-col overflow-y-auto">
          <div className="max-w-5xl mx-auto w-full">
            {loading ? (
              <div className="flex justify-center items-center h-48">
                <p>Loading Zakat & Tax data...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-3 text-center">
                <p className="text-red-700 mb-2">Failed to load data</p>
                <button
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm"
                  onClick={() => dispatch(fetchZakatTaxData())}
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                  <div
                    className={`py-4 px-4 text-white rounded-xl shadow ${hasZakatData ? "bg-primary-dark" : "bg-gray-400"}`}
                  >
                    <p className="text-sm mb-1">Zakat Payable</p>
                    <p className="text-2xl font-bold">
                      {hasZakatData ? `PKR ${zakat.zakat_payable.toLocaleString()}` : "PKR 0"}
                    </p>
                  </div>
                </div>

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
