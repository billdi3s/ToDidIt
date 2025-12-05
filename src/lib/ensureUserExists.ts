import { supabase } from "./supabaseClient";

/**
 * Ensures the authenticated user exists in public.users table.
 *
 * BACKGROUND:
 * When users sign up via OAuth, Supabase creates them in auth.users
 * but NOT in our custom public.users table. This causes foreign key
 * constraint violations when trying to save time_blocks.
 *
 * SOLUTION:
 * This function checks if the user exists in public.users and creates
 * them if missing. Call this before any database operation that requires
 * the user to exist in public.users.
 *
 * @throws Error if user is not authenticated or creation fails
 */
export async function ensureUserExists(): Promise<string> {
  // Get current user from Supabase Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;
  if (!user) throw new Error("User not authenticated");

  const userId = user.id;
  const userEmail = user.email || `${userId}@placeholder.local`;

  // Check if user exists in public.users
  const { data: existingUser, error: checkError } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (checkError) {
    console.error("[ensureUserExists] Error checking user:", checkError);
    throw checkError;
  }

  // User already exists, we're good
  if (existingUser) {
    return userId;
  }

  // User doesn't exist, create them
  console.log(
    `[ensureUserExists] Creating user in public.users: ${userId} (${userEmail})`
  );

  const { error: insertError } = await supabase.from("users").insert({
    id: userId,
    email: userEmail,
  });

  if (insertError) {
    // Check if error is because user was created by another concurrent request
    if (insertError.code === "23505") {
      // Unique constraint violation - user was just created, that's fine
      console.log("[ensureUserExists] User was created concurrently, continuing");
      return userId;
    }

    console.error("[ensureUserExists] Error creating user:", insertError);
    throw insertError;
  }

  console.log("[ensureUserExists] Successfully created user");
  return userId;
}
