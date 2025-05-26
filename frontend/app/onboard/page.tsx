import { onboard } from "@/app/server/actions";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-100">
      <form
        className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col gap-6"
        action={onboard} // <-- use the imported server action directly
      >
        <input type="hidden" name="uid" value={data.user.id} />
        <h2 className="text-2xl font-bold text-center text-slate-800 mb-2">
          Welcome! Let's set up your profile
        </h2>
        <div>
          <label
            htmlFor="displayName"
            className="block font-medium text-slate-700 mb-1"
          >
            Display Name
          </label>
          <input
            id="displayName"
            name="displayName"
            type="text"
            required
            placeholder="e.g. BlockOpsFan"
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="firstName"
            className="block font-medium text-slate-700 mb-1"
          >
            First Name
          </label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="lastName"
            className="block font-medium text-slate-700 mb-1"
          >
            Last Name
          </label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-300 outline-none"
          />
        </div>
        <button
          type="submit"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition"
        >
          Save
        </button>
      </form>
    </div>
  );
}
