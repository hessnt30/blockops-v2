"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/utils/supabase/server";

/**
 * Login function to authenticate a user.
 * It retrieves user credentials from the FormData object,
 * attempts to sign in using Supabase,
 * and redirects to the dashboard on success.
 *
 * @param formData - FormData object containing user details
 * @returns void - Redirects to the dashboard
 */
export async function login(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    redirect("/error");
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

/**
 * Logout function to sign out the user.
 * It uses Supabase to sign out and redirects to the login page.
 *
 * @returns void - Redirects to the login page after logout
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout error:", error);
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

/**
 * Signup function to register a new user.
 * It retrieves user credentials from the FormData object,
 * attempts to sign up using Supabase,
 * and redirects to the onboarding page after successful signup.
 *
 * @param formData - FormData object containing user details
 * @returns void - Redirects to the onboarding page after successful signup
 */
export async function signup(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { data: signUpData, error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  console.log("signUpData", signUpData);

  // Add user to "users" table after successful sign up
  if (signUpData.user) {
    console.log("Inserting user into 'users' table", {
      id: signUpData.user.id,
      email: signUpData.user.email,
    });
    if (signUpData.user) {
      const { error: insertError } = await supabase.from("users").insert([
        {
          id: signUpData.user.id,
          email: signUpData.user.email,
        },
      ]);
      if (insertError) {
        console.error("Insert error:", insertError);
      }
    }
  }

  revalidatePath("/", "layout");
  redirect("/onboard");
}

/**
 * Onboarding function to set up user profile.
 * It retrieves user details from the FormData object,
 * attempts to update the user in the "users" table,
 * and redirects to the dashboard after successful onboarding.
 *
 * @param formData - FormData object containing user details
 * @returns void - Redirects to the dashboard after successful onboarding
 */
export async function onboard(formData: FormData) {
  const supabase = await createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    displayName: formData.get("displayName") as string,
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    id: formData.get("uid") as string,
  };

  // Update the user row where id matches the provided uid
  const { error: updateError } = await supabase
    .from("users")
    .update({
      display_name: data.displayName,
      first_name: data.firstName,
      last_name: data.lastName,
    })
    .eq("id", data.id);

  if (updateError) {
    console.error("Update error:", updateError);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
