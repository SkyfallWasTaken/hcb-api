import { Layout } from "../layouts"
import { TokenInfo } from "../types"

export const Dashboard = ({ tokenInfo }: { tokenInfo: TokenInfo | null }) => (
  <Layout>
    <div className="min-h-[90%] max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">HCB API Manager</h1>
        <form action="/logout" method="POST">
          <button className="bg-[#f7768e] text-black px-4 py-2 hover:brightness-110 transition">
            Logout
          </button>
        </form>
      </div>

      {/* Token Status */}
      <div className="bg-[#1a1b27] border border-gray-800 p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Current Token Status</h2>
        {tokenInfo ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Expires:</span> {new Date(tokenInfo.expires_at * 1000).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Valid for:</span> {Math.round((tokenInfo.expires_at - Date.now() / 1000) / 3600)} hours
            </p>
            <div className={`inline-block px-2 py-1 text-xs ${tokenInfo.isValid ? 'bg-[#9ece6a] text-black' : 'bg-red-100 text-red-800'}`}>
              {tokenInfo.isValid ? 'Valid' : 'Expired'}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No token found</p>
        )}
      </div>

      {/* Exchange Code Form */}
      <div className="bg-[#1a1b27] border border-gray-800 p-6">
        <h2 className="text-2xl font-semibold mb-4">Exchange Authorization Code</h2>
        <form action="/exchange" method="POST" className="space-y-4">
          <div>
            <label htmlFor="code" className="block text-sm font-medium text-[#565f89] mb-2">
              Authorization Code
            </label>
            <textarea
              id="code"
              name="code"
              required
              rows={3}
              className="w-full px-3 py-2 text-lg bg-[#1e202e] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your authorization code here..."
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-[#385090] text-white py-2 px-4 focus:outline-none"
          >
            Exchange Code
          </button>
        </form>
      </div>
    </div>
  </Layout>
)
