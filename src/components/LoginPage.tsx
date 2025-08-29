import { Layout } from "../layouts"

export const LoginPage = () => (
  <Layout title="Login - HCB API Manager">
    <div className="min-h-[90%] flex items-center justify-center">
      <div className="bg-[#1a1b27] p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to <span className="text-[#f7768e]">HCB API Manager</span></h1>
        <form action="/login" method="POST" className="space-y-4">
          <div>
            <label htmlFor="masterKey" className="block text-sm font-medium text-[#565f89] mb-2">
              Master Key
            </label>
            <input
              type="password"
              id="masterKey"
              name="masterKey"
              required
              className="w-full px-3 py-2 text-lg bg-[#1e202e] border border-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter master key"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  </Layout>
)
