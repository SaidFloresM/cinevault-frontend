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

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return err("Missing authorization header", 401);

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) return err("Unauthorized", 401);

    const url = new URL(req.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const genreId = pathParts[pathParts.length - 1] !== "genres" ? pathParts[pathParts.length - 1] : null;

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (error) return err(error.message);
      return json(data);
    }

    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profile?.role !== "admin") return err("Forbidden: admin only", 403);

    if (req.method === "POST") {
      const { name, description, slug } = await req.json();
      if (!name || !slug) return err("name and slug are required");

      const { data, error } = await supabase
        .from("categories")
        .insert({ name, description: description || "", slug })
        .select()
        .single();

      if (error) return err(error.message);
      return json(data, 201);
    }

    if (req.method === "PUT") {
      if (!genreId) return err("Genre ID required");
      const body = await req.json();
      const updates: Record<string, unknown> = {};
      if (body.name !== undefined) updates.name = body.name;
      if (body.description !== undefined) updates.description = body.description;
      if (body.slug !== undefined) updates.slug = body.slug;

      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", genreId)
        .select()
        .single();

      if (error) return err(error.message);
      return json(data);
    }

    if (req.method === "DELETE") {
      if (!genreId) return err("Genre ID required");
      const { error } = await supabase.from("categories").delete().eq("id", genreId);
      if (error) return err(error.message);
      return json({ success: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});
