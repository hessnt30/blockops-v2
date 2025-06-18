import { login, signup } from "@/app/server/actions";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100">
      <form className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6">
        <div className="flex flex-col items-center mb-2">
          <span className="text-3xl font-extrabold text-blue-600 tracking-tight mb-1">
            BlockOps
          </span>
          <h2 className="text-2xl font-bold text-center text-slate-800">
            Welcome Back
          </h2>
        </div>
        <div>
          <label
            htmlFor="email"
            className="block font-medium text-slate-700 mb-1"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@email.com"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="password"
            className="block font-medium text-slate-700 mb-1"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 placeholder-slate-400 focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>
        <div className="flex gap-4 mt-2">
          <button
            formAction={login}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
          >
            Log in
          </button>
          <button
            formAction={signup}
            className="w-1/2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold py-2 rounded-lg transition"
          >
            Sign up
          </button>
        </div>
      </form>
    </div>
  );
}
