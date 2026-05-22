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
    const movieId = pathParts[pathParts.length - 1] !== "movies" ? pathParts[pathParts.length - 1] : null;

    // GET /movies or GET /movies/:id
    if (req.method === "GET") {
      if (movieId && movieId !== "movies") {
        const { data, error } = await supabase
          .from("movies")
          .select("*, categories(id, name, slug)")
          .eq("id", movieId)
          .maybeSingle();

        if (error) return err(error.message);
        if (!data) return err("Movie not found", 404);
        return json(data);
      }

      const category = url.searchParams.get("category");
      const featured = url.searchParams.get("featured");
      const page = parseInt(url.searchParams.get("page") || "1");
      const limit = parseInt(url.searchParams.get("limit") || "8");
      const offset = (page - 1) * limit;

      let query = supabase
        .from("movies")
        .select("*, categories(id, name, slug)", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (category) query = query.eq("category_id", category);
      if (featured === "true") query = query.eq("is_featured", true);

      const { data, error, count } = await query;
      if (error) return err(error.message);

      return json({ movies: data, total: count, page, limit });
    }

    // Check admin role for mutations
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const isAdmin = profile?.role === "admin";

    // POST /movies
    if (req.method === "POST") {
      if (!isAdmin) return err("Forbidden: admin only", 403);

      const body = await req.json();
      const { title, description, poster_url, backdrop_url, release_year, duration_minutes, category_id, director, cast_list, rating, is_featured } = body;

      if (!title) return err("title is required");
      if (!release_year) return err("release_year is required");

      const { data, error } = await supabase
        .from("movies")
        .insert({
          title,
          description: description || "",
          poster_url: poster_url || "",
          backdrop_url: backdrop_url || "",
          release_year,
          duration_minutes: duration_minutes || 0,
          category_id: category_id || null,
          director: director || "",
          cast_list: cast_list || [],
          rating: rating || 0,
          is_featured: is_featured || false,
          created_by: user.id,
        })
        .select("*, categories(id, name, slug)")
        .single();

      if (error) return err(error.message);
      return json(data, 201);
    }

    // PUT /movies/:id
    if (req.method === "PUT") {
      if (!isAdmin) return err("Forbidden: admin only", 403);
      if (!movieId) return err("Movie ID required");

      const body = await req.json();
      const { title, description, poster_url, backdrop_url, release_year, duration_minutes, category_id, director, cast_list, rating, is_featured } = body;

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (poster_url !== undefined) updates.poster_url = poster_url;
      if (backdrop_url !== undefined) updates.backdrop_url = backdrop_url;
      if (release_year !== undefined) updates.release_year = release_year;
      if (duration_minutes !== undefined) updates.duration_minutes = duration_minutes;
      if (category_id !== undefined) updates.category_id = category_id;
      if (director !== undefined) updates.director = director;
      if (cast_list !== undefined) updates.cast_list = cast_list;
      if (rating !== undefined) updates.rating = rating;
      if (is_featured !== undefined) updates.is_featured = is_featured;

      const { data, error } = await supabase
        .from("movies")
        .update(updates)
        .eq("id", movieId)
        .select("*, categories(id, name, slug)")
        .single();

      if (error) return err(error.message);
      return json(data);
    }

    // DELETE /movies/:id
    if (req.method === "DELETE") {
      if (!isAdmin) return err("Forbidden: admin only", 403);
      if (!movieId) return err("Movie ID required");

      const { error } = await supabase.from("movies").delete().eq("id", movieId);
      if (error) return err(error.message);
      return json({ success: true });
    }

    return err("Method not allowed", 405);
  } catch (e) {
    return err(e instanceof Error ? e.message : "Internal server error", 500);
  }
});
