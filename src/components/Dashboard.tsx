import { Layout } from "../layouts"
import { TokenInfo } from "../types"

export const Dashboard = ({
  tokenInfo,
  success,
  error
}: {
  tokenInfo: TokenInfo | null
  success?: string | null
  error?: string | null
}) => (
  <Layout>
    <div className="min-h-[90%] max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">HCB API Manager</h1>
        <form action="/logout" method="post">
          <button className="bg-[#f7768e] text-black px-4 py-2 hover:brightness-110 transition">
            Logout
          </button>
        </form>
      </div>

      {/* Success/Error Messages */}
      {success === 'token_exchanged' && (
        <div className="bg-[#1e202e] border border-[#9ece6a] p-4 mb-6 rounded">
          <p className="text-[#9ece6a] font-medium">Success!</p>
          <p className="text-sm text-[#565f89]">
            Your authorization code has been successfully exchanged for an access token. You can now use the HCB API proxy!
          </p>
        </div>
      )}

      {error === 'exchange_failed' && (
        <div className="bg-[#1e202e] border border-[#f7768e] p-4 mb-6 rounded">
          <p className="text-[#f7768e] font-medium">Exchange Failed</p>
          <p className="text-sm text-[#565f89]">
            There was an error exchanging your authorization code. Please try again or use the setup wizard for help.
          </p>
        </div>
      )}

      {/* Token Status */}
      <div className="bg-[#1a1b27] border border-gray-800 p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Current Token Status</h2>
        {tokenInfo ? (
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Expires:</span> {new Date(tokenInfo.expires_at * 1000).toLocaleString()}
            </p>
            <p className="text-sm">
              <span className="font-medium">Valid for:</span> {(() => {
                const totalSeconds = tokenInfo.expires_at - Math.floor(Date.now() / 1000);
                const totalMinutes = Math.floor(totalSeconds / 60);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                if (totalSeconds <= 0) {
                  return "Expired";
                } else if (hours > 0) {
                  return `${hours}h ${minutes}m`;
                } else {
                  return `${minutes}m`;
                }
              })()}
            </p>
            <div className={`inline-block px-2 py-1 text-xs ${tokenInfo.isValid ? 'bg-[#9ece6a] text-black' : 'bg-red-100 text-red-800'}`}>
              {tokenInfo.isValid ? 'Valid' : 'Expired'}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-gray-500">No token found</p>
            <div className="bg-[#1e202e] border border-[#f7768e] p-4 rounded">
              <p className="text-[#f7768e] font-medium mb-2">Setup Required</p>
              <p className="text-sm text-[#565f89] mb-3">
                You need to complete the OAuth setup to start using the HCB API proxy.
              </p>
              <a
                href="/oauth-wizard"
                className="inline-block bg-[#7aa2f7] text-black px-4 py-2 hover:brightness-110 transition font-medium text-sm"
              >
                Start setup wizard
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Exchange Code Form */}
      <div className="bg-[#1a1b27] border border-gray-800 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Exchange Authorization Code</h2>
          <a
            href="/oauth-wizard"
            className="bg-[#7aa2f7] text-black px-4 py-2 hover:brightness-110 transition text-sm font-medium"
          >
            Use setup wizard
          </a>
        </div>
        <form action="/exchange" method="post" className="space-y-4">
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
