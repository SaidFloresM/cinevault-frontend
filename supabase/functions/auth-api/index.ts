import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(message: string, status = 400) {
  return json({ error: message }, status);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    if (req.method !== "POST") return err("Method not allowed", 405);

    const body = await req.json();

    // POST /auth-api/register
    if (action === "register") {
      const { email, password, username } = body;
      if (!email || !password || !username) return err("email, password, and username are required");
      if (password.length < 6) return err("Password must be at least 6 characters");

      const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });

      if (signUpError) return err(signUpError.message);

      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({ id: authData.user.id, username, role: "user" });

      if (profileError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return err(profileError.message);
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (sessionError) return err(sessionError.message);

      return json({
        message: "Registration successful",
        user: { id: authData.user.id, email, username, role: "user" },
      }, 201);
    }

    // POST /auth-api/login
    if (action === "login") {
      const { email, password } = body;
      if (!email || !password) return err("email and password are required");

      const anonClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!
      );

      const { data, error } = await anonClient.auth.signInWithPassword({ email, password });
      if (error) return err(error.message, 401);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("username, role")
        .eq("id", data.user.id)
        .maybeSingle();

      return json({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        user: {
          id: data.user.id,
          email: data.user.email,
          username: profile?.username || "",
          role: profile?.role || "user",
        },
      });
    }

    // POST /auth-api/me
    if (action === "me") {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) return err("Missing authorization header", 401);

      const userClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const { data: { user }, error: authError } = await userClient.auth.getUser();
      if (authError || !user) return err("Unauthorized", 401);

      const { data: profile } = await supabase
        .from("user_profiles")
        .select("username, role")
        .eq("id", user.id)
        .maybeSingle();

      return json({
        id: user.id,
        email: user.email,
        username: profile?.username || "",
        role: profile?.role || "user",
      });
    }

    return err("Unknown action", 404);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});
