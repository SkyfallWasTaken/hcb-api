import { Layout } from "../layouts"

export const OAuthWizard = () => (
  <Layout>
    <div className="min-h-[90%] max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">HCB OAuth Setup Wizard</h1>
        <a href="/dashboard" className="text-[#7aa2f7] hover:underline">
          ← Back to Dashboard
        </a>
      </div>

      <div className="space-y-8">
        {/* Step 1 */}
        <div className="bg-[#1a1b27] border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-[#7aa2f7] text-black rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              1
            </div>
            <h2 className="text-2xl font-semibold">Authorize HCB Access</h2>
          </div>
          <p className="text-[#565f89] mb-4">
            First, you need to authorize this application to access your HCB account.
          </p>
          <a
            href="https://hcb.hackclub.com/api/v4/oauth/authorize?client_id=yt8JHmPDmmYYLUmoEiGtocYwg5fSOGCrcIY3G-vkMRs&redirect_uri=hcb%3A%2F%2F&response_type=code&scope=read%20write"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#7aa2f7] text-black px-6 py-3 hover:brightness-110 transition font-medium"
          >
            Open HCB Authorization Page →
          </a>
        </div>

        {/* Step 2 */}
        <div className="bg-[#1a1b27] border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-[#9ece6a] text-black rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              2
            </div>
            <h2 className="text-2xl font-semibold">Get Authorization Code</h2>
          </div>
          <div className="space-y-4">
            <p className="text-[#565f89]">
              After clicking "Authorize" on the HCB page, you'll need to extract the authorization code:
            </p>
            <div className="bg-[#1e202e] border border-gray-700 p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <div className="bg-[#f7768e] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                  a
                </div>
                <div>
                  <p className="font-medium">Open Browser Developer Tools</p>
                  <p className="text-sm text-[#565f89]">Press <kbd className="bg-[#565f89] text-white px-2 py-1 text-xs">Ctrl+Shift+I</kbd> (or <kbd className="bg-[#565f89] text-white px-2 py-1 text-xs">Cmd+Shift+I</kbd> on Mac)</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[#f7768e] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                  b
                </div>
                <div>
                  <p className="font-medium">Go to Network Tab</p>
                  <p className="text-sm text-[#565f89]">Click on the "Network" tab in the developer tools</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[#f7768e] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                  c
                </div>
                <div>
                  <p className="font-medium">Click "Authorize" on HCB</p>
                  <p className="text-sm text-[#565f89]">This will trigger a network request</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-[#f7768e] text-black rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-1 flex-shrink-0">
                  d
                </div>
                <div>
                  <p className="font-medium">Find the Authorization Code</p>
                  <p className="text-sm text-[#565f89]">
                    Look for an "authorize" request → Response Headers → Location header
                  </p>
                  <p className="text-sm text-[#565f89] mt-1">
                    It should look like: <code className="bg-[#565f89] text-white px-1">hcb://?code=YOUR_CODE_HERE</code>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-[#1a1b27] border border-gray-800 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-[#e0af68] text-black rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              3
            </div>
            <h2 className="text-2xl font-semibold">Exchange Authorization Code</h2>
          </div>
          <p className="text-[#565f89] mb-4">
            Copy the code from the URL (everything after <code className="bg-[#565f89] text-white px-1">code=</code>) and paste it below:
          </p>
          <form action="/exchange" method="POST" className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-[#565f89] mb-2">
                Authorization Code
              </label>
              <div className="relative">
                <textarea
                  id="code"
                  name="code"
                  required
                  rows={3}
                  className="w-full px-3 py-2 text-lg bg-[#1e202e] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-[#7aa2f7]"
                  placeholder="e.g., pnbZE22FDA-cd919de5cd0d71b0121a6ac"
                ></textarea>
              </div>
              <p className="text-xs text-[#565f89] mt-1">
                Tip: The code should be about 30-40 characters long
              </p>
            </div>
            <button
              type="submit"
              className="bg-[#9ece6a] text-black py-3 px-6 hover:brightness-110 transition font-medium text-lg"
            >
              Exchange Code & Complete Setup
            </button>
          </form>
        </div>

        {/* Help Section */}
        <div className="bg-[#1e202e] border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-3 text-[#bb9af7]">Need help?</h3>
          <div className="space-y-2 text-sm text-[#565f89]">
            <p>• If you don't see the Network tab, make sure DevTools are open</p>
            <p>• If you get stuck, you can always start over by clicking the authorization link again</p>
          </div>
        </div>
      </div>
    </div>
  </Layout>
)
