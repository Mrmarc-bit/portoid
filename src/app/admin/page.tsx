"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Heading,
  Text,
  Button,
  Input,
  Textarea,
  Row,
  Line,
  Avatar,
  RevealFx,
  Spinner,
  Badge,
  ToggleButton,
  Flex,
  Media
} from "@once-ui-system/core";
import { FileUploadCard, UploadedFile } from "@/components/ui/file-upload-card";

interface GuestbookEntry {
  id: string | number;
  name: string;
  message: string;
  created_at: string;
}

interface ProjectEntry {
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

interface PostEntry {
  id: string | number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  image: string;
  publishedAt: string;
  tag: string[];
}

interface GalleryEntry {
  id: string | number;
  src: string;
  alt: string;
  orientation: "horizontal" | "vertical";
}

interface ProfileEntry {
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

type TabType = "overview" | "projects" | "blog" | "gallery" | "guestbook" | "broadcast" | "profile" | "settings";

export default function AdminDashboardPage() {
  const router = useRouter();
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>("overview");

  // Global loading
  const [isLoading, setIsLoading] = useState(true);
  const [dbMode, setDbMode] = useState<"local" | "cloud">("local");
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Core Data States
  const [profile, setProfile] = useState<ProfileEntry>({
    firstName: "", lastName: "", name: "", role: "", avatar: "", email: "", location: "", languages: [], locale: "",
    appName: "", appIcon: "", appDescription: "", xUrl: "", instagramUrl: "", linkedinUrl: "", githubUrl: ""
  });
  const [projects, setProjects] = useState<ProjectEntry[]>([]);
  const [posts, setPosts] = useState<PostEntry[]>([]);
  const [gallery, setGallery] = useState<GalleryEntry[]>([]);
  const [guestbook, setGuestbook] = useState<GuestbookEntry[]>([]);

  // Action / Form states
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Upload Modal states
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<"project-images" | "blog-image" | "gallery-image" | "profile-avatar" | "app-icon" | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [uploadedFilesList, setUploadedFilesList] = useState<UploadedFile[]>([]);

  // Form schemas
  const [projectForm, setProjectForm] = useState({ slug: "", title: "", summary: "", content: "", images: "", tag: "", link: "" });
  const [postForm, setPostForm] = useState({ slug: "", title: "", summary: "", content: "", image: "", tag: "" });
  const [galleryForm, setGalleryForm] = useState({ src: "", alt: "", orientation: "horizontal" as "horizontal" | "vertical" });
  const [profileForm, setProfileForm] = useState({ 
    firstName: "", lastName: "", name: "", role: "", avatar: "", email: "", location: "", languages: "", locale: ""
  });
  const [settingsForm, setSettingsForm] = useState({
    appName: "", appIcon: "", appDescription: "", xUrl: "", instagramUrl: "", linkedinUrl: "", githubUrl: "", calendarUrl: ""
  });
  const [guestbookForm, setGuestbookForm] = useState({ name: "", message: "" });
  const [broadcastMsg, setBroadcastMsg] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const openUploadModal = (target: "project-images" | "blog-image" | "gallery-image" | "profile-avatar" | "app-icon") => {
    setUploadTarget(target);
    setUploadedUrl("");
    setUploadError("");
    setUploadedFilesList([]);
    setIsUploadModalOpen(true);
  };

  const uploadFileToServer = async (file: File, id: string) => {
    try {
      setUploadedFilesList(prev => prev.map(f => f.id === id ? { ...f, progress: 20 } : f));
      
      const formData = new FormData();
      formData.append("file", file);
      
      setUploadedFilesList(prev => prev.map(f => f.id === id ? { ...f, progress: 60 } : f));

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUploadedFilesList(prev => prev.map(f => f.id === id ? {
          ...f,
          progress: 100,
          status: "completed"
        } : f));
        setUploadedUrl(data.url);
      } else {
        setUploadedFilesList(prev => prev.map(f => f.id === id ? { ...f, status: "error" } : f));
        setUploadError(data.error || "Gagal mengunggah file gambar.");
      }
    } catch (e) {
      setUploadedFilesList(prev => prev.map(f => f.id === id ? { ...f, status: "error" } : f));
      setUploadError("Koneksi gagal saat mengunggah file.");
    }
  };

  const handleFilesChange = (newFiles: File[]) => {
    const newUploadedFiles: UploadedFile[] = newFiles.map((file) => ({
      id: `${file.name}-${Date.now()}`,
      file,
      progress: 0,
      status: "uploading",
    }));
    setUploadedFilesList(prev => [...prev, ...newUploadedFiles]);
    newUploadedFiles.forEach((fileEntry) => {
      uploadFileToServer(fileEntry.file, fileEntry.id);
    });
  };

  const handleFileRemove = (id: string) => {
    setUploadedFilesList(prev => prev.filter(f => f.id !== id));
    if (uploadedFilesList.length <= 1) {
      setUploadedUrl("");
    }
  };

  const handleUseUploadedImage = () => {
    if (!uploadedUrl || !uploadTarget) return;

    if (uploadTarget === "project-images") {
      const current = projectForm.images;
      setProjectForm({
        ...projectForm,
        images: current ? `${current}, ${uploadedUrl}` : uploadedUrl,
      });
    } else if (uploadTarget === "blog-image") {
      setPostForm({ ...postForm, image: uploadedUrl });
    } else if (uploadTarget === "gallery-image") {
      setGalleryForm({ ...galleryForm, src: uploadedUrl });
    } else if (uploadTarget === "profile-avatar") {
      setProfileForm({ ...profileForm, avatar: uploadedUrl });
    } else if (uploadTarget === "app-icon") {
      setSettingsForm({ ...settingsForm, appIcon: uploadedUrl });
    }

    setIsUploadModalOpen(false);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      setDbMode(process.env.NEXT_PUBLIC_SUPABASE_URL ? "cloud" : "local");
      
      // Fetch profile and settings along with other collections
      const [pRes, sRes, projRes, postRes, galRes, guestRes, subRes] = await Promise.all([
        fetch("/api/admin/profile").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/admin/settings").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/projects").then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/posts").then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/gallery").then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/guestbook").then(r => r.ok ? r.json() : []).catch(() => []),
        fetch("/api/push/send", { method: "POST", body: JSON.stringify({ dryRun: true }) }).then(r => r.ok ? r.json() : { total: 0 }).catch(() => ({ total: 0 }))
      ]);

      // Seed Profile if fetch failed or returned null (we fall back to local mock data)
      if (pRes && pRes.profile) {
        setProfile(pRes.profile);
        populateProfileForm(pRes.profile);
      } else {
        // Fetch profile settings from a lightweight public check, or seed defaults
        const dummyProfile = {
          firstName: "Maruf", lastName: "Muchlisin", name: "Maruf Muchlisin", role: "Design Engineer",
          avatar: "/uploads/1782947031367-h25xie8.jpg", email: "admin@suntreeart.my.id", location: "Asia/Purwokerto",
          languages: ["English", "Bahasa"], locale: "en",
          appName: "PORTOID", appIcon: "/uploads/1782964973632-3hbjly2.png", appDescription: "Design Engineer portfolio",
          xUrl: "https://x.com/marufmuchlisin", instagramUrl: "https://instagram.com/suntree_art",
          linkedinUrl: "https://linkedin.com/marufmuchlisin", githubUrl: "https://github.com/Mrmarc-bit"
        };
        setProfile(dummyProfile);
        populateProfileForm(dummyProfile);
      }

      // Populate Settings Form
      if (sRes && sRes.settings) {
        setSettingsForm({
          appName: sRes.settings.appName || "",
          appIcon: sRes.settings.appIcon || "",
          appDescription: sRes.settings.appDescription || "",
          xUrl: sRes.settings.xUrl || "",
          instagramUrl: sRes.settings.instagramUrl || "",
          linkedinUrl: sRes.settings.linkedinUrl || "",
          githubUrl: sRes.settings.githubUrl || "",
          calendarUrl: sRes.settings.calendarUrl || ""
        });
      } else if (pRes && pRes.profile) {
        setSettingsForm({
          appName: pRes.profile.appName || "",
          appIcon: pRes.profile.appIcon || "",
          appDescription: pRes.profile.appDescription || "",
          xUrl: pRes.profile.xUrl || "",
          instagramUrl: pRes.profile.instagramUrl || "",
          linkedinUrl: pRes.profile.linkedinUrl || "",
          githubUrl: pRes.profile.githubUrl || "",
          calendarUrl: pRes.profile.calendarUrl || ""
        });
      }

      setProjects(projRes);
      setPosts(postRes);
      setGallery(galRes);
      setGuestbook(guestRes);
      setSubscribersCount(subRes.total || 0);

    } catch (e) {
      console.error("Failed to load admin dashboard data:", e);
      setErrorMsg("Gagal memuat beberapa data dari server.");
    } finally {
      setIsLoading(false);
    }
  };

  const populateProfileForm = (p: ProfileEntry) => {
    setProfileForm({
      firstName: p.firstName,
      lastName: p.lastName,
      name: p.name,
      role: p.role,
      avatar: p.avatar,
      email: p.email,
      location: p.location,
      languages: p.languages?.join(", ") || "",
      locale: p.locale
    });
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/admin/logout", { method: "POST" });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal logout:", error);
    }
  };

  // --- CRUD ACTIONS ---

  // Projects CRUD
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      ...projectForm,
      images: projectForm.images.split(",").map(i => i.trim()).filter(Boolean),
      tag: projectForm.tag.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      const url = editingId ? `/api/admin/projects/${editingId}` : "/api/admin/projects";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(editingId ? "Proyek berhasil diperbarui!" : "Proyek baru berhasil ditambahkan!");
        setEditingId(null);
        setProjectForm({ slug: "", title: "", summary: "", content: "", images: "", tag: "", link: "" });
        loadAllData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan proyek.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProject = async (id: string | number) => {
    if (!confirm("Hapus proyek ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus proyek.");
      }
    } catch (e) {
      alert("Koneksi gagal.");
    }
  };

  // Blog Posts CRUD
  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      ...postForm,
      tag: postForm.tag.split(",").map(t => t.trim()).filter(Boolean)
    };

    try {
      const url = editingId ? `/api/admin/posts/${editingId}` : "/api/admin/posts";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg(editingId ? "Artikel berhasil diperbarui!" : "Artikel baru berhasil ditambahkan!");
        setEditingId(null);
        setPostForm({ slug: "", title: "", summary: "", content: "", image: "", tag: "" });
        loadAllData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menyimpan artikel.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePost = async (id: string | number) => {
    if (!confirm("Hapus artikel ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus artikel.");
      }
    } catch (e) {
      alert("Koneksi gagal.");
    }
  };

  // Gallery CRUD
  const handleAddGalleryImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(galleryForm)
      });

      if (res.ok) {
        setSuccessMsg("Gambar berhasil ditambahkan ke galeri!");
        setGalleryForm({ src: "", alt: "", orientation: "horizontal" });
        loadAllData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal menambahkan gambar.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGalleryImage = async (id: string | number) => {
    if (!confirm("Hapus foto ini dari galeri?")) return;
    try {
      const res = await fetch(`/api/admin/gallery?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus gambar.");
      }
    } catch (e) {
      alert("Koneksi gagal.");
    }
  };

  // Guestbook Moderation CRUD
  const handleSaveGuestbook = async (id: string | number) => {
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(guestbookForm)
      });

      if (res.ok) {
        setSuccessMsg("Pesan berhasil diperbarui!");
        setEditingId(null);
        loadAllData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal memperbarui pesan.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGuestbook = async (id: string | number) => {
    if (!confirm("Hapus komentar ini secara permanen?")) return;
    try {
      const res = await fetch(`/api/admin/guestbook/${id}`, { method: "DELETE" });
      if (res.ok) {
        loadAllData();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus komentar.");
      }
    } catch (e) {
      alert("Koneksi gagal.");
    }
  };

  // Profile update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    const payload = {
      ...profileForm,
      languages: profileForm.languages.split(",").map(l => l.trim()).filter(Boolean)
    };

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setSuccessMsg("Profil berhasil diperbarui!");
        loadAllData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal memperbarui profil.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      });

      if (res.ok) {
        setSuccessMsg("Pengaturan berhasil diperbarui!");
        loadAllData();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal memperbarui pengaturan.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  // Broadcast push
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/admin/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: broadcastMsg })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(data.message || "Siaran berhasil dikirim!");
        setBroadcastMsg("");
      } else {
        setErrorMsg(data.error || "Gagal mengirimkan siaran push.");
      }
    } catch (e) {
      setErrorMsg("Koneksi gagal.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabsList = [
    { type: "overview", label: "Ringkasan" },
    { type: "projects", label: "Proyek" },
    { type: "blog", label: "Artikel Blog" },
    { type: "gallery", label: "Galeri" },
    { type: "guestbook", label: "Buku Tamu" },
    { type: "broadcast", label: "Siaran Push" },
    { type: "profile", label: "Profil" },
    { type: "settings", label: "Pengaturan" }
  ];

  return (
    <Column maxWidth="m" fillWidth gap="xl" paddingY="12" horizontal="center">
      {/* Top Header Bar */}
      <Row
        fillWidth
        paddingY="16"
        paddingX="m"
        vertical="center"
        horizontal="between"
        style={{
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          backgroundColor: "var(--page-background)",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        {/* Left Side: Avatar + Name */}
        <Row gap="m" vertical="center">
          <Avatar size="s" src={profile.avatar || undefined} value={profile.avatar ? undefined : profile.name} />
          <Column>
            <Heading variant="heading-strong-s">{profile.name}</Heading>
            <Text size="xs" onBackground="neutral-weak">Admin Dashboard</Text>
          </Column>
        </Row>

        {/* Right Side: Db mode + Logout */}
        <Row gap="m" vertical="center">
          <Badge background={dbMode === "cloud" ? "brand-alpha-medium" : "neutral-alpha-medium"} paddingX="12" paddingY="4">
            {dbMode === "cloud" ? "Supabase" : "Local JSON"}
          </Badge>
          <Button onClick={handleLogout} variant="secondary" size="s">
            Keluar
          </Button>
        </Row>
      </Row>

      {/* Tabs Navigation (Vercel-style Underline) */}
      <Row
        fillWidth
        gap="24"
        paddingX="m"
        style={{
          borderBottom: "1px solid var(--neutral-alpha-weak)",
          overflowX: "auto",
          scrollbarWidth: "none",
        }}
      >
        {tabsList.map((tab) => {
          const isActive = activeTab === tab.type;
          return (
            <Row
              key={tab.type}
              paddingY="12"
              paddingX="4"
              vertical="center"
              onClick={() => {
                setActiveTab(tab.type as TabType);
                setEditingId(null);
                setErrorMsg("");
                setSuccessMsg("");
              }}
              style={{
                cursor: "pointer",
                borderBottom: isActive ? "2px solid var(--brand-medium)" : "2px solid transparent",
                color: isActive ? "var(--neutral-strong)" : "var(--neutral-weak)",
                transition: "all 0.2s ease"
              }}
            >
              <Text weight={isActive ? "strong" : "default"} size="s" style={{ whiteSpace: "nowrap" }}>
                {tab.label}
              </Text>
            </Row>
          );
        })}
      </Row>

      {/* Notification Toast/Badge */}
      {errorMsg && (
        <Row fillWidth padding="s" radius="m-4" background="neutral-alpha-weak" border="neutral-alpha-weak" style={{ borderColor: "var(--red-alpha-weak)" }}>
          <Text size="s" style={{ color: "var(--red-medium)" }}>⚠️ {errorMsg}</Text>
        </Row>
      )}
      {successMsg && (
        <Row fillWidth padding="s" radius="m-4" background="neutral-alpha-weak" border="neutral-alpha-weak" style={{ borderColor: "var(--green-alpha-weak)" }}>
          <Text size="s" style={{ color: "var(--green-medium)" }}>✅ {successMsg}</Text>
        </Row>
      )}

      {/* Dashboard Body Content */}
      <Column fillWidth style={{ minHeight: "50vh" }}>
        {isLoading ? (
          <Row fillWidth horizontal="center" vertical="center" padding="xl" flex={1}>
            <Spinner size="l" />
          </Row>
        ) : (
          <RevealFx translateY="8" fillWidth>
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <Column fillWidth gap="l">
                <Heading as="h2" variant="heading-strong-xl">Overview Profil & Data</Heading>
                
                {/* Stats Grid */}
                <Row fillWidth gap="m" wrap s={{ direction: "column" }}>
                  <Column flex={1} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="xs">
                    <Text size="s" onBackground="neutral-weak">Total Proyek</Text>
                    <Heading variant="display-strong-l">{projects.length}</Heading>
                  </Column>
                  <Column flex={1} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="xs">
                    <Text size="s" onBackground="neutral-weak">Total Blog Post</Text>
                    <Heading variant="display-strong-l">{posts.length}</Heading>
                  </Column>
                  <Column flex={1} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="xs">
                    <Text size="s" onBackground="neutral-weak">Komentar Buku Tamu</Text>
                    <Heading variant="display-strong-l">{guestbook.length}</Heading>
                  </Column>
                  <Column flex={1} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="xs">
                    <Text size="s" onBackground="neutral-weak">Subscriber Notifikasi</Text>
                    <Heading variant="display-strong-l">{subscribersCount}</Heading>
                  </Column>
                </Row>

                {/* Profile Snapshot */}
                <Row fillWidth padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="l" vertical="center" wrap>
                  <Avatar size="xl" src={profile.avatar || undefined} value={profile.avatar ? undefined : profile.name} />
                  <Column gap="4" flex={1}>
                    <Heading variant="heading-strong-l">{profile.name}</Heading>
                    <Text size="m" onBackground="brand-medium" weight="strong">{profile.role}</Text>
                    <Text size="s" onBackground="neutral-weak">📧 {profile.email} | 📍 {profile.location}</Text>
                    <Row gap="4" marginTop="8">
                      {profile.languages?.map((lang, idx) => (
                        <Badge key={idx} background="neutral-alpha-weak">{lang}</Badge>
                      ))}
                    </Row>
                  </Column>
                  <Button onClick={() => setActiveTab("profile")} variant="secondary" size="s">Edit Profil</Button>
                </Row>
              </Column>
            )}

            {/* PROJECTS TAB */}
            {activeTab === "projects" && (
              <Row fillWidth gap="l" s={{ direction: "column" }}>
                {/* List */}
                <Column style={{ flex: 1 }} gap="m">
                  <Heading as="h2" variant="heading-strong-xl">Daftar Proyek</Heading>
                  <Column gap="s" fillWidth>
                    {projects.map((proj) => (
                      <Row key={proj.id} fillWidth padding="m" border="neutral-alpha-weak" radius="m" background="surface" horizontal="between" vertical="center" wrap gap="s">
                        <Column gap="xs" flex={1}>
                          <Text weight="strong" size="m">{proj.title}</Text>
                          <Text size="xs" onBackground="neutral-weak">Slug: /{proj.slug} | Date: {new Date(proj.publishedAt).toLocaleDateString("id-ID")}</Text>
                        </Column>
                        <Row gap="8">
                          <Button size="s" variant="tertiary" onClick={() => {
                            setEditingId(proj.id);
                            setProjectForm({
                              slug: proj.slug,
                              title: proj.title,
                              summary: proj.summary,
                              content: proj.content,
                              images: proj.images?.join(", ") || "",
                              tag: proj.tag?.join(", ") || "",
                              link: proj.link || ""
                            });
                          }}>Edit</Button>
                          <Button size="s" variant="secondary" onClick={() => handleDeleteProject(proj.id)} style={{ color: "var(--red-medium)" }}>Hapus</Button>
                        </Row>
                      </Row>
                    ))}
                  </Column>
                </Column>
                
                {/* Form */}
                <Column style={{ flex: 1 }} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="m">
                  <Heading as="h3" variant="heading-strong-l">{editingId ? "Edit Proyek" : "Tambah Proyek Baru"}</Heading>
                  <form onSubmit={handleSaveProject} style={{ width: "100%" }}>
                    <Column gap="s" fillWidth>
                      <Input id="p-title" label="Judul Proyek (Title)" value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })} required />
                      <Input id="p-slug" label="Slug URL (contoh: proyek-hebat)" value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: e.target.value })} required />
                      <Input id="p-summary" label="Ringkasan Pendek (Summary)" value={projectForm.summary} onChange={(e) => setProjectForm({ ...projectForm, summary: e.target.value })} required />
                      <Row gap="8" fillWidth vertical="center">
                        <Input id="p-images" label="Daftar Gambar URL (Pisahkan koma)" placeholder="/images/projects/cover-01.jpg" value={projectForm.images} onChange={(e) => setProjectForm({ ...projectForm, images: e.target.value })} />
                        <Button type="button" variant="secondary" onClick={() => openUploadModal("project-images")} style={{ height: "fit-content", marginTop: "16px" }}>Upload</Button>
                      </Row>
                      <Input id="p-tag" label="Tag Kategori (Pisahkan koma)" placeholder="NextJS, React, Supabase" value={projectForm.tag} onChange={(e) => setProjectForm({ ...projectForm, tag: e.target.value })} />
                      <Input id="p-link" label="Tautan Projek Eksternal (Link)" value={projectForm.link} onChange={(e) => setProjectForm({ ...projectForm, link: e.target.value })} />
                      <Textarea id="p-content" label="Isi Konten Proyek (Markdown)" value={projectForm.content} onChange={(e) => setProjectForm({ ...projectForm, content: e.target.value })} required lines={8} />
                      
                      <Row gap="8">
                        <Button type="submit" variant="primary" fillWidth disabled={isSaving}>
                          {isSaving ? <Spinner size="s" /> : "Simpan Proyek"}
                        </Button>
                        {editingId && (
                          <Button type="button" variant="tertiary" onClick={() => {
                            setEditingId(null);
                            setProjectForm({ slug: "", title: "", summary: "", content: "", images: "", tag: "", link: "" });
                          }}>Batal</Button>
                        )}
                      </Row>
                    </Column>
                  </form>
                </Column>
              </Row>
            )}

            {/* BLOG POSTS TAB */}
            {activeTab === "blog" && (
              <Row fillWidth gap="l" s={{ direction: "column" }}>
                {/* List */}
                <Column style={{ flex: 1 }} gap="m">
                  <Heading as="h2" variant="heading-strong-xl">Daftar Artikel Blog</Heading>
                  <Column gap="s" fillWidth>
                    {posts.map((post) => (
                      <Row key={post.id} fillWidth padding="m" border="neutral-alpha-weak" radius="m" background="surface" horizontal="between" vertical="center" wrap gap="s">
                        <Column gap="xs" flex={1}>
                          <Text weight="strong" size="m">{post.title}</Text>
                          <Text size="xs" onBackground="neutral-weak">Slug: /{post.slug} | Date: {new Date(post.publishedAt).toLocaleDateString("id-ID")}</Text>
                        </Column>
                        <Row gap="8">
                          <Button size="s" variant="tertiary" onClick={() => {
                            setEditingId(post.id);
                            setPostForm({
                              slug: post.slug,
                              title: post.title,
                              summary: post.summary,
                              content: post.content,
                              image: post.image || "",
                              tag: post.tag?.join(", ") || ""
                            });
                          }}>Edit</Button>
                          <Button size="s" variant="secondary" onClick={() => handleDeletePost(post.id)} style={{ color: "var(--red-medium)" }}>Hapus</Button>
                        </Row>
                      </Row>
                    ))}
                  </Column>
                </Column>
                
                {/* Form */}
                <Column style={{ flex: 1 }} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="m">
                  <Heading as="h3" variant="heading-strong-l">{editingId ? "Edit Artikel" : "Tambah Artikel Baru"}</Heading>
                  <form onSubmit={handleSavePost} style={{ width: "100%" }}>
                    <Column gap="s" fillWidth>
                      <Input id="b-title" label="Judul Artikel (Title)" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} required />
                      <Input id="b-slug" label="Slug URL (contoh: artikel-saya)" value={postForm.slug} onChange={(e) => setPostForm({ ...postForm, slug: e.target.value })} required />
                      <Input id="b-summary" label="Deskripsi Pendek (Summary)" value={postForm.summary} onChange={(e) => setPostForm({ ...postForm, summary: e.target.value })} required />
                      <Row gap="8" fillWidth vertical="center">
                        <Input id="b-image" label="Cover Image URL" placeholder="/images/blog/blog.jpg" value={postForm.image} onChange={(e) => setPostForm({ ...postForm, image: e.target.value })} />
                        <Button type="button" variant="secondary" onClick={() => openUploadModal("blog-image")} style={{ height: "fit-content", marginTop: "16px" }}>Upload</Button>
                      </Row>
                      <Input id="b-tag" label="Tag Kategori (Pisahkan koma)" placeholder="WebDev, Javascript" value={postForm.tag} onChange={(e) => setPostForm({ ...postForm, tag: e.target.value })} />
                      <Textarea id="b-content" label="Isi Artikel (Markdown)" value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} required lines={8} />
                      
                      <Row gap="8">
                        <Button type="submit" variant="primary" fillWidth disabled={isSaving}>
                          {isSaving ? <Spinner size="s" /> : "Simpan Artikel"}
                        </Button>
                        {editingId && (
                          <Button type="button" variant="tertiary" onClick={() => {
                            setEditingId(null);
                            setPostForm({ slug: "", title: "", summary: "", content: "", image: "", tag: "" });
                          }}>Batal</Button>
                        )}
                      </Row>
                    </Column>
                  </form>
                </Column>
              </Row>
            )}

            {/* GALLERY TAB */}
            {activeTab === "gallery" && (
              <Row fillWidth gap="l" s={{ direction: "column" }}>
                {/* List */}
                <Column style={{ flex: 1.2 }} gap="m">
                  <Heading as="h2" variant="heading-strong-xl">Galeri Gambar</Heading>
                  <Row fillWidth gap="s" wrap>
                    {gallery.map((img) => (
                      <Column key={img.id} padding="xs" border="neutral-alpha-weak" radius="m" background="surface" style={{ width: "calc(50% - 6px)" }}>
                        <Media src={img.src} alt={img.alt} radius="s" aspectRatio={img.orientation === "horizontal" ? "16 / 9" : "3 / 4"} />
                        <Row horizontal="between" vertical="center" marginTop="8" fillWidth>
                          <Badge background="neutral-alpha-weak">{img.orientation}</Badge>
                          <Button size="s" variant="secondary" onClick={() => handleDeleteGalleryImage(img.id)} style={{ color: "var(--red-medium)" }}>Hapus</Button>
                        </Row>
                      </Column>
                    ))}
                  </Row>
                </Column>
                
                {/* Form */}
                <Column style={{ flex: 0.8 }} padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="m">
                  <Heading as="h3" variant="heading-strong-l">Tambah Foto Baru</Heading>
                  <form onSubmit={handleAddGalleryImage} style={{ width: "100%" }}>
                    <Column gap="s" fillWidth>
                      <Row gap="8" fillWidth vertical="center">
                        <Input id="g-src" label="Path Sumber Foto (Src)" placeholder="/images/gallery/photo.jpg" value={galleryForm.src} onChange={(e) => setGalleryForm({ ...galleryForm, src: e.target.value })} required />
                        <Button type="button" variant="secondary" onClick={() => openUploadModal("gallery-image")} style={{ height: "fit-content", marginTop: "16px" }}>Upload</Button>
                      </Row>
                      <Input id="g-alt" label="Deskripsi Foto (Alt)" placeholder="Sunrise..." value={galleryForm.alt} onChange={(e) => setGalleryForm({ ...galleryForm, alt: e.target.value })} required />
                      
                      <Text size="s" onBackground="neutral-weak">Orientasi Gambar:</Text>
                      <Row gap="m">
                        <ToggleButton label="Horizontal (16:9)" selected={galleryForm.orientation === "horizontal"} onClick={() => setGalleryForm({ ...galleryForm, orientation: "horizontal" })} />
                        <ToggleButton label="Vertical (3:4)" selected={galleryForm.orientation === "vertical"} onClick={() => setGalleryForm({ ...galleryForm, orientation: "vertical" })} />
                      </Row>

                      <Button type="submit" variant="primary" fillWidth disabled={isSaving} style={{ marginTop: "8px" }}>
                        {isSaving ? <Spinner size="s" /> : "Tambahkan ke Galeri"}
                      </Button>
                    </Column>
                  </form>
                </Column>
              </Row>
            )}

            {/* GUESTBOOK TAB */}
            {activeTab === "guestbook" && (
              <Column fillWidth gap="m">
                <Heading as="h2" variant="heading-strong-xl">Moderasi Komentar Buku Tamu</Heading>
                
                {editingId && (
                  <Column padding="m" border="neutral-alpha-weak" radius="l" background="surface" gap="s" fillWidth>
                    <Heading as="h3" variant="heading-strong-l">Edit Komentar</Heading>
                    <Input id="gb-name" label="Nama" value={guestbookForm.name} onChange={(e) => setGuestbookForm({ ...guestbookForm, name: e.target.value })} />
                    <Textarea id="gb-msg" label="Pesan" value={guestbookForm.message} onChange={(e) => setGuestbookForm({ ...guestbookForm, message: e.target.value })} lines={3} />
                    <Row gap="8">
                      <Button size="s" variant="primary" onClick={() => handleSaveGuestbook(editingId)} disabled={isSaving}>
                        {isSaving ? <Spinner size="s" /> : "Simpan Perubahan"}
                      </Button>
                      <Button size="s" variant="tertiary" onClick={() => { setEditingId(null); setGuestbookForm({ name: "", message: "" }); }}>Batal</Button>
                    </Row>
                  </Column>
                )}

                <Column gap="s" fillWidth>
                  {guestbook.map((entry) => (
                    <Row key={entry.id} fillWidth padding="m" border="neutral-alpha-weak" radius="m" gap="m" vertical="center" background="surface">
                      <Avatar size="s" value={entry.name} />
                      <Column gap="4" flex={1}>
                        <Row fillWidth horizontal="between" vertical="center" wrap>
                          <Text weight="strong" size="s">{entry.name}</Text>
                          <Text onBackground="neutral-weak" size="xs">{new Date(entry.created_at).toLocaleString("id-ID")}</Text>
                        </Row>
                        <Text size="s" onBackground="neutral-medium" marginY="8">{entry.message}</Text>
                        <Line fillWidth style={{ opacity: 0.3 }} marginY="4" />
                        <Row gap="8" horizontal="end" fillWidth>
                          <Button size="s" variant="tertiary" onClick={() => {
                            setEditingId(entry.id);
                            setGuestbookForm({ name: entry.name, message: entry.message });
                          }}>Edit</Button>
                          <Button size="s" variant="secondary" onClick={() => handleDeleteGuestbook(entry.id)} style={{ color: "var(--red-medium)" }}>Hapus</Button>
                        </Row>
                      </Column>
                    </Row>
                  ))}
                </Column>
              </Column>
            )}

            {/* BROADCAST TAB */}
            {activeTab === "broadcast" && (
              <Column maxWidth={24} fillWidth gap="m" padding="m" border="neutral-alpha-weak" radius="l" background="surface" style={{ margin: "auto" }}>
                <Heading as="h2" variant="heading-strong-xl">Siaran Push Massal</Heading>
                <Text size="s" onBackground="neutral-weak">Kirimkan notifikasi web push secara real-time ke semua perangkat pengunjung yang terdaftar.</Text>
                
                <form onSubmit={handleSendBroadcast} style={{ width: "100%" }}>
                  <Column gap="s" fillWidth>
                    <Textarea
                      id="b-push-msg"
                      label="Pesan Siaran Notifikasi"
                      placeholder="Masukkan isi notifikasi push..."
                      value={broadcastMsg}
                      onChange={(e) => setBroadcastMsg(e.target.value)}
                      required
                      disabled={isSaving}
                      lines={4}
                    />
                    <Button type="submit" variant="primary" fillWidth disabled={isSaving}>
                      {isSaving ? <Spinner size="s" /> : "Kirim Broadcast"}
                    </Button>
                  </Column>
                </form>
              </Column>
            )}

            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <Column maxWidth={24} fillWidth gap="m" padding="m" border="neutral-alpha-weak" radius="l" background="surface" style={{ margin: "auto" }}>
                <Heading as="h2" variant="heading-strong-xl">Pengaturan Profil Portofolio</Heading>
                <Text size="s" onBackground="neutral-weak">Ubah detail personal profil Anda yang dirender pada homepage website.</Text>

                <form onSubmit={handleUpdateProfile} style={{ width: "100%" }}>
                  <Column gap="s" fillWidth>
                    <Heading as="h3" variant="heading-strong-s" style={{ marginTop: "8px" }}>Profil Pengguna</Heading>
                    <Input id="prof-fname" label="First Name" value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} required />
                    <Input id="prof-lname" label="Last Name" value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} required />
                    <Input id="prof-name" label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
                    <Input id="prof-role" label="Peran Profesional (Role)" value={profileForm.role} onChange={(e) => setProfileForm({ ...profileForm, role: e.target.value })} required />
                    <Input id="prof-email" label="Alamat Email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} required />
                    <Row gap="8" fillWidth vertical="center">
                      <Input id="prof-avatar" label="Avatar Image Path / URL" value={profileForm.avatar} onChange={(e) => setProfileForm({ ...profileForm, avatar: e.target.value })} />
                      <Button type="button" variant="secondary" onClick={() => openUploadModal("profile-avatar")} style={{ height: "fit-content", marginTop: "16px" }}>Upload</Button>
                    </Row>
                    <Input id="prof-loc" label="Zona Waktu / Lokasi (IANA Timezone)" placeholder="Asia/Jakarta" value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} required />
                    <Input id="prof-lang" label="Bahasa yang Dikuasai (Pisahkan koma)" placeholder="English, Bahasa" value={profileForm.languages} onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })} />
                    
                    <Button type="submit" variant="primary" fillWidth disabled={isSaving} style={{ marginTop: "16px" }}>
                      {isSaving ? <Spinner size="s" /> : "Simpan Profil"}
                    </Button>
                  </Column>
                </form>
              </Column>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <Column maxWidth={24} fillWidth gap="m" padding="m" border="neutral-alpha-weak" radius="l" background="surface" style={{ margin: "auto" }}>
                <Heading as="h2" variant="heading-strong-xl">Pengaturan Aplikasi & Media Sosial</Heading>
                <Text size="s" onBackground="neutral-weak">Kelola nama aplikasi, logo, deskripsi situs, serta tautan ke profil media sosial Anda.</Text>

                <form onSubmit={handleUpdateSettings} style={{ width: "100%" }}>
                  <Column gap="s" fillWidth>
                    <Heading as="h3" variant="heading-strong-s" style={{ marginTop: "8px" }}>Branding & Aplikasi</Heading>
                    <Input id="app-name" label="Nama Aplikasi" value={settingsForm.appName} onChange={(e) => setSettingsForm({ ...settingsForm, appName: e.target.value })} />
                    <Row gap="8" fillWidth vertical="center">
                      <Input id="app-icon" label="URL Icon Aplikasi" value={settingsForm.appIcon} onChange={(e) => setSettingsForm({ ...settingsForm, appIcon: e.target.value })} />
                      <Button type="button" variant="secondary" onClick={() => openUploadModal("app-icon")} style={{ height: "fit-content", marginTop: "16px" }}>Upload</Button>
                    </Row>
                    <Input id="app-desc" label="Deskripsi Aplikasi" value={settingsForm.appDescription} onChange={(e) => setSettingsForm({ ...settingsForm, appDescription: e.target.value })} />
                    <Input id="calendar-url" label="Tautan Jadwal Pertemuan (Google Calendar / Calendly / Cal.com)" placeholder="https://cal.com/username atau https://calendar.app.google/..." value={settingsForm.calendarUrl} onChange={(e) => setSettingsForm({ ...settingsForm, calendarUrl: e.target.value })} />

                    <Heading as="h3" variant="heading-strong-s" style={{ marginTop: "16px" }}>Media Sosial</Heading>
                    <Input id="soc-x" label="Tautan X (Twitter)" placeholder="https://twitter.com/username" value={settingsForm.xUrl} onChange={(e) => setSettingsForm({ ...settingsForm, xUrl: e.target.value })} />
                    <Input id="soc-ig" label="Tautan Instagram" placeholder="https://instagram.com/username" value={settingsForm.instagramUrl} onChange={(e) => setSettingsForm({ ...settingsForm, instagramUrl: e.target.value })} />
                    <Input id="soc-li" label="Tautan LinkedIn" placeholder="https://linkedin.com/in/username" value={settingsForm.linkedinUrl} onChange={(e) => setSettingsForm({ ...settingsForm, linkedinUrl: e.target.value })} />
                    <Input id="soc-git" label="Tautan GitHub" placeholder="https://github.com/username" value={settingsForm.githubUrl} onChange={(e) => setSettingsForm({ ...settingsForm, githubUrl: e.target.value })} />

                    <Button type="submit" variant="primary" fillWidth disabled={isSaving} style={{ marginTop: "16px" }}>
                      {isSaving ? <Spinner size="s" /> : "Simpan Pengaturan"}
                    </Button>
                  </Column>
                </form>
              </Column>
            )}
          </RevealFx>
        )}
      </Column>

      {/* Modern Upload Modal */}
      {isUploadModalOpen && (
        <Flex
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(6px)",
            zIndex: 9999,
          }}
          horizontal="center"
          vertical="center"
          padding="m"
        >
          <Column gap="m" align="center" style={{ width: "100%", maxWidth: "32rem" }}>
            <FileUploadCard
              files={uploadedFilesList}
              onFilesChange={handleFilesChange}
              onFileRemove={handleFileRemove}
              onClose={() => setIsUploadModalOpen(false)}
            />
            
            {uploadError && (
              <Text size="xs" style={{ color: "var(--red-medium)" }}>⚠️ {uploadError}</Text>
            )}

            {uploadedUrl && (
              <Row fillWidth gap="m" paddingX="m">
                <Button
                  variant="primary"
                  fillWidth
                  onClick={handleUseUploadedImage}
                >
                  Gunakan Gambar
                </Button>
              </Row>
            )}
          </Column>
        </Flex>
      )}
    </Column>
  );
}
