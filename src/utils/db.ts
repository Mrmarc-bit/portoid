import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import matter from "gray-matter";

// Database Types
export interface GuestbookEntry {
  id: string | number;
  name: string;
  message: string;
  created_at: string;
}

export interface PushSubscriptionEntry {
  id: string | number;
  endpoint: string;
  keys_auth: string;
  keys_p256dh: string;
  created_at: string;
}

export interface ProjectEntry {
  id: string | number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  images: string[];
  publishedAt: string;
  tag: string[];
  link?: string;
}

export interface PostEntry {
  id: string | number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  publishedAt: string;
  tag: string[];
}

export interface GalleryEntry {
  id: string | number;
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical";
}

export interface ProfileEntry {
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  avatar: string;
  email: string;
  location: string;
  languages: string[];
  locale: string;
  appName?: string;
  appIcon?: string;
  appDescription?: string;
  xUrl?: string;
  instagramUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const isSupabaseConfigured = SUPABASE_URL !== "" && (SUPABASE_ANON_KEY !== "" || SUPABASE_SERVICE_KEY !== "");

const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY)
  : null;

const LOCAL_DB_PATH = path.join(process.cwd(), "db.json");

function parseTags(tag: unknown): string[] {
  if (Array.isArray(tag)) return tag as string[];
  if (typeof tag === "string") return [tag];
  return [];
}

// Helper to seed initial project, post and gallery details from MDX and config files
function getInitialSeedData() {
  const initialProjects: ProjectEntry[] = [];
  const initialPosts: PostEntry[] = [];
  
  // Parse static MDX projects
  try {
    const projectsDir = path.join(process.cwd(), "src", "app", "work", "projects");
    if (fs.existsSync(projectsDir)) {
      const files = fs.readdirSync(projectsDir).filter(f => f.endsWith(".mdx"));
      files.forEach((file, idx) => {
        const rawContent = fs.readFileSync(path.join(projectsDir, file), "utf-8");
        const { data, content } = matter(rawContent);
        initialProjects.push({
          id: `seed-project-${idx + 1}`,
          slug: path.basename(file, ".mdx"),
          title: data.title || "",
          summary: data.summary || "",
          content: content || "",
          images: data.images || [],
          publishedAt: data.publishedAt || new Date().toISOString(),
          tag: parseTags(data.tag),
          link: data.link || ""
        });
      });
    }
  } catch (e) {
    console.error("Failed to seed projects from MDX:", e);
  }

  // Parse static MDX blog posts
  try {
    const postsDir = path.join(process.cwd(), "src", "app", "blog", "posts");
    if (fs.existsSync(postsDir)) {
      const files = fs.readdirSync(postsDir).filter(f => f.endsWith(".mdx"));
      files.forEach((file, idx) => {
        const rawContent = fs.readFileSync(path.join(postsDir, file), "utf-8");
        const { data, content } = matter(rawContent);
        initialPosts.push({
          id: `seed-post-${idx + 1}`,
          slug: path.basename(file, ".mdx"),
          title: data.title || "",
          summary: data.summary || "",
          content: content || "",
          image: data.image || "",
          publishedAt: data.publishedAt || new Date().toISOString(),
          tag: parseTags(data.tag)
        });
      });
    }
  } catch (e) {
    console.error("Failed to seed blog posts from MDX:", e);
  }

  const initialGallery: GalleryEntry[] = [
    { id: 1, src: "/images/gallery/horizontal-1.jpg", alt: "Gallery Image 1", orientation: "horizontal" },
    { id: 2, src: "/images/gallery/vertical-4.jpg", alt: "Gallery Image 2", orientation: "vertical" },
    { id: 3, src: "/images/gallery/horizontal-3.jpg", alt: "Gallery Image 3", orientation: "horizontal" },
    { id: 4, src: "/images/gallery/vertical-1.jpg", alt: "Gallery Image 4", orientation: "vertical" }
  ];

  const initialProfile: ProfileEntry = {
    firstName: "Maruf",
    lastName: "Muchlisin",
    name: "Maruf Muchlisin",
    role: "Design Engineer",
    avatar: "/uploads/1782947031367-h25xie8.jpg",
    email: "admin@suntreeart.my.id",
    location: "Asia/Purwokerto",
    languages: ["English", "Bahasa"],
    locale: "en"
  };

  return {
    projects: initialProjects,
    posts: initialPosts,
    gallery: initialGallery,
    profile: initialProfile
  };
}

function initLocalDb() {
  if (!fs.existsSync(LOCAL_DB_PATH)) {
    const seeds = getInitialSeedData();
    const initialData = {
      profile: seeds.profile,
      guestbook: [
        {
          id: 1,
          name: "Budi Santoso",
          message: "Portofolio yang luar biasa! Desain gelap yang elegan dan transisi yang sangat halus.",
          created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
        },
        {
          id: 2,
          name: "Emily Watson",
          message: "Stunning portfolio template. The push notifications integration is brilliant!",
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ],
      subscriptions: [],
      projects: seeds.projects,
      posts: seeds.posts,
      gallery: seeds.gallery
    };
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(initialData, null, 2), "utf-8");
  }
}

function readLocalDb() {
  initLocalDb();
  try {
    const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to read local DB:", error);
    return { profile: {}, guestbook: [], subscriptions: [], projects: [], posts: [], gallery: [] };
  }
}

function writeLocalDb(data: any) {
  try {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write to local DB:", error);
  }
}

export const db = {
  isCloudMode: () => isSupabaseConfigured,

  // --- PROFILE METHODS ---
  async getProfile(): Promise<ProfileEntry> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("profile").select("*").single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase profile fetch error:", e);
      }
    }
    const local = readLocalDb();
    return local.profile;
  },

  async updateProfile(profile: ProfileEntry): Promise<ProfileEntry> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("profile")
          .upsert([{ id: 1, ...profile }])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase profile update error:", e);
      }
    }
    const local = readLocalDb();
    local.profile = profile;
    writeLocalDb(local);
    return profile;
  },

  // --- SETTINGS METHODS ---
  async getSettings(): Promise<any> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase settings fetch error:", e);
      }
    }
    const local = readLocalDb();
    return local.settings || {
      appName: local.profile?.appName || "",
      appIcon: local.profile?.appIcon || "",
      appDescription: local.profile?.appDescription || "",
      xUrl: local.profile?.xUrl || "",
      instagramUrl: local.profile?.instagramUrl || "",
      linkedinUrl: local.profile?.linkedinUrl || "",
      githubUrl: local.profile?.githubUrl || "",
      calendarUrl: local.profile?.calendarUrl || "https://cal.com"
    };
  },

  async updateSettings(settings: any): Promise<any> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("settings")
          .upsert([{ id: 1, ...settings }])
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase settings update error:", e);
      }
    }
    const local = readLocalDb();
    local.settings = settings;
    
    // Also sync to local profile object for backward compatibility
    if (local.profile) {
      local.profile.appName = settings.appName;
      local.profile.appIcon = settings.appIcon;
      local.profile.appDescription = settings.appDescription;
      local.profile.xUrl = settings.xUrl;
      local.profile.instagramUrl = settings.instagramUrl;
      local.profile.linkedinUrl = settings.linkedinUrl;
      local.profile.githubUrl = settings.githubUrl;
      local.profile.calendarUrl = settings.calendarUrl;
    }
    
    writeLocalDb(local);
    return settings;
  },

  // --- PROJECTS METHODS ---
  async getProjects(): Promise<ProjectEntry[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .order("publishedAt", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase projects fetch error:", e);
      }
    }
    const local = readLocalDb();
    return (local.projects || []).sort(
      (a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  },

  async getProjectBySlug(slug: string): Promise<ProjectEntry | null> {
    const projects = await this.getProjects();
    return projects.find((p) => p.slug === slug) || null;
  },

  async addProject(project: Omit<ProjectEntry, "id">): Promise<ProjectEntry> {
    const newProject = {
      ...project,
      id: `project-${Date.now()}`
    };
    if (supabase) {
      try {
        const { data, error } = await supabase.from("projects").insert([project]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase project insert error:", e);
      }
    }
    const local = readLocalDb();
    local.projects = local.projects || [];
    local.projects.push(newProject);
    writeLocalDb(local);
    return newProject;
  },

  async updateProject(id: string | number, project: Omit<ProjectEntry, "id">): Promise<ProjectEntry | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("projects")
          .update(project)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase project update error:", e);
      }
    }
    const local = readLocalDb();
    const idx = local.projects.findIndex((p: any) => String(p.id) === String(id));
    if (idx > -1) {
      local.projects[idx] = { ...local.projects[idx], ...project };
      writeLocalDb(local);
      return local.projects[idx];
    }
    return null;
  },

  async deleteProject(id: string | number): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (!error) return true;
      } catch (e) {
        console.error("Supabase project delete error:", e);
      }
    }
    const local = readLocalDb();
    const initialLen = local.projects.length;
    local.projects = local.projects.filter((p: any) => String(p.id) !== String(id));
    if (local.projects.length < initialLen) {
      writeLocalDb(local);
      return true;
    }
    return false;
  },

  // --- BLOG POSTS METHODS ---
  async getPosts(): Promise<PostEntry[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .order("publishedAt", { ascending: false });
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase posts fetch error:", e);
      }
    }
    const local = readLocalDb();
    return (local.posts || []).sort(
      (a: any, b: any) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  },

  async getPostBySlug(slug: string): Promise<PostEntry | null> {
    const posts = await this.getPosts();
    return posts.find((p) => p.slug === slug) || null;
  },

  async addPost(post: Omit<PostEntry, "id">): Promise<PostEntry> {
    const newPost = {
      ...post,
      id: `post-${Date.now()}`
    };
    if (supabase) {
      try {
        const { data, error } = await supabase.from("posts").insert([post]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase post insert error:", e);
      }
    }
    const local = readLocalDb();
    local.posts = local.posts || [];
    local.posts.push(newPost);
    writeLocalDb(local);
    return newPost;
  },

  async updatePost(id: string | number, post: Omit<PostEntry, "id">): Promise<PostEntry | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("posts")
          .update(post)
          .eq("id", id)
          .select()
          .single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase post update error:", e);
      }
    }
    const local = readLocalDb();
    const idx = local.posts.findIndex((p: any) => String(p.id) === String(id));
    if (idx > -1) {
      local.posts[idx] = { ...local.posts[idx], ...post };
      writeLocalDb(local);
      return local.posts[idx];
    }
    return null;
  },

  async deletePost(id: string | number): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from("posts").delete().eq("id", id);
        if (!error) return true;
      } catch (e) {
        console.error("Supabase post delete error:", e);
      }
    }
    const local = readLocalDb();
    const initialLen = local.posts.length;
    local.posts = local.posts.filter((p: any) => String(p.id) !== String(id));
    if (local.posts.length < initialLen) {
      writeLocalDb(local);
      return true;
    }
    return false;
  },

  // --- GALLERY METHODS ---
  async getGalleryImages(): Promise<GalleryEntry[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase.from("gallery").select("*");
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase gallery fetch error:", e);
      }
    }
    const local = readLocalDb();
    return local.gallery || [];
  },

  async addGalleryImage(image: Omit<GalleryEntry, "id">): Promise<GalleryEntry> {
    const newImage = {
      ...image,
      id: `gallery-${Date.now()}`
    };
    if (supabase) {
      try {
        const { data, error } = await supabase.from("gallery").insert([image]).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.error("Supabase gallery insert error:", e);
      }
    }
    const local = readLocalDb();
    local.gallery = local.gallery || [];
    local.gallery.push(newImage);
    writeLocalDb(local);
    return newImage;
  },

  async deleteGalleryImage(id: string | number): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase.from("gallery").delete().eq("id", id);
        if (!error) return true;
      } catch (e) {
        console.error("Supabase gallery delete error:", e);
      }
    }
    const local = readLocalDb();
    const initialLen = local.gallery.length;
    local.gallery = local.gallery.filter((g: any) => String(g.id) !== String(id));
    if (local.gallery.length < initialLen) {
      writeLocalDb(local);
      return true;
    }
    return false;
  },

  // --- GUESTBOOK METHODS ---
  async getGuestbookEntries(): Promise<GuestbookEntry[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Supabase Error fetching guestbook:", err);
      }
    }
    const localData = readLocalDb();
    return [...localData.guestbook].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  },

  async addGuestbookEntry(name: string, message: string): Promise<GuestbookEntry> {
    const newEntry = {
      name,
      message,
      created_at: new Date().toISOString(),
    };
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .insert([newEntry])
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Supabase Error adding guestbook entry:", err);
      }
    }
    const localData = readLocalDb();
    const localEntry: GuestbookEntry = {
      id: Date.now(),
      ...newEntry,
    };
    localData.guestbook.push(localEntry);
    writeLocalDb(localData);
    return localEntry;
  },

  async updateGuestbookEntry(id: string | number, name: string, message: string): Promise<GuestbookEntry | null> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("guestbook")
          .update({ name, message })
          .eq("id", id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Supabase Error updating guestbook entry:", err);
      }
    }
    const localData = readLocalDb();
    const entryIndex = localData.guestbook.findIndex((e: any) => String(e.id) === String(id));
    if (entryIndex > -1) {
      localData.guestbook[entryIndex].name = name;
      localData.guestbook[entryIndex].message = message;
      writeLocalDb(localData);
      return localData.guestbook[entryIndex];
    }
    return null;
  },

  async deleteGuestbookEntry(id: string | number): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("guestbook")
          .delete()
          .eq("id", id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase Error deleting guestbook entry:", err);
      }
    }
    const localData = readLocalDb();
    const initialLength = localData.guestbook.length;
    localData.guestbook = localData.guestbook.filter((e: any) => String(e.id) !== String(id));
    if (localData.guestbook.length < initialLength) {
      writeLocalDb(localData);
      return true;
    }
    return false;
  },

  // --- PUSH NOTIFICATION SUBSCRIPTION METHODS ---
  async addSubscription(subscriptionJson: string): Promise<PushSubscriptionEntry> {
    const parsedSub = JSON.parse(subscriptionJson);
    const endpoint = parsedSub.endpoint || "";
    const keys_auth = parsedSub.keys?.auth || "";
    const keys_p256dh = parsedSub.keys?.p256dh || "";

    const newSub = {
      endpoint,
      keys_auth,
      keys_p256dh,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .upsert([newSub], { onConflict: "endpoint" })
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (err) {
        console.error("Supabase Error adding subscription:", err);
      }
    }
    const localData = readLocalDb();
    const existingIndex = localData.subscriptions.findIndex(
      (s: any) => s.endpoint === endpoint
    );

    const localSub: PushSubscriptionEntry = {
      id: Date.now(),
      ...newSub,
    };

    if (existingIndex > -1) {
      localData.subscriptions[existingIndex] = {
        ...localData.subscriptions[existingIndex],
        ...newSub,
      };
    } else {
      localData.subscriptions.push(localSub);
    }
    writeLocalDb(localData);
    return localSub;
  },

  async getSubscriptions(): Promise<PushSubscriptionEntry[]> {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*");

        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Supabase Error fetching subscriptions:", err);
      }
    }
    const localData = readLocalDb();
    return localData.subscriptions || [];
  },

  async removeSubscription(endpoint: string): Promise<boolean> {
    if (supabase) {
      try {
        const { error } = await supabase
          .from("subscriptions")
          .delete()
          .eq("endpoint", endpoint);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Supabase Error removing subscription:", err);
      }
    }
    const localData = readLocalDb();
    const updatedSubs = (localData.subscriptions || []).filter(
      (s: any) => s.endpoint !== endpoint
    );
    localData.subscriptions = updatedSubs;
    writeLocalDb(localData);
    return true;
  }
};
