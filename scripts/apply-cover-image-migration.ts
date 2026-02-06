import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log("Starting migration...");

  // Update existing projects with cover images
  const updates = [
    { slug: "costa-esmeralda", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&q=80" },
    { slug: "bahias-huatulco", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80" },
    { slug: "mazunte-verde", url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1920&q=80" },
    { slug: "zipolite-sunset", url: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=1920&q=80" },
    { slug: "playa-coral", url: "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?w=1920&q=80" },
  ];

  // First check if the column exists by trying a simple query
  const { data: testData, error: testError } = await supabase
    .from("projects")
    .select("id, slug, cover_image_url")
    .limit(1);

  if (testError) {
    console.error("Column might not exist yet:", testError.message);
    console.log("Please run the following SQL in Supabase dashboard:");
    console.log("ALTER TABLE projects ADD COLUMN IF NOT EXISTS cover_image_url TEXT;");
    return;
  }

  console.log("Column exists, updating projects...");

  for (const update of updates) {
    const { data, error } = await supabase
      .from("projects")
      .update({ cover_image_url: update.url })
      .eq("slug", update.slug)
      .is("cover_image_url", null)
      .select();

    if (error) {
      console.log(`Error updating ${update.slug}:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`✓ Updated ${update.slug}`);
    } else {
      console.log(`- Skipped ${update.slug} (not found or already has image)`);
    }
  }

  console.log("Migration complete!");
}

applyMigration();
