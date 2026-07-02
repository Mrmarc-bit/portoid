"use client";

import { useEffect, useState } from "react";
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
  Badge
} from "@once-ui-system/core";
import { baseURL, person } from "@/resources";

// VAPID Public Key from env
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "BGSr9q8mCrHwJcApstlDea8ptBXQ4V1FL8IyF0IOem-0QKNLtj3sGrILolSYG0TjD-OYgocv_s8oOcelpjSnZ4c";

// Helper to convert base64 URL VAPID key to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface GuestbookEntry {
  id: string | number;
  name: string;
  message: string;
  created_at: string;
}

export default function GuestbookPage() {
  // Guestbook states
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingEntries, setIsLoadingEntries] = useState(true);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState(false);

  // Push notification states
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionState, setPermissionState] = useState<NotificationPermission | "unsupported">("default");
  const [isSubscribingPush, setIsSubscribingPush] = useState(false);
  const [pushTestMessage, setPushTestMessage] = useState("Halo! Ini notifikasi uji coba dari PORTOID.");
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [pushStatusMsg, setPushStatusMsg] = useState("");
  const [pushErrorMsg, setPushErrorMsg] = useState("");
  const [dbMode, setDbMode] = useState<"local" | "cloud">("local");

  // Fetch entries on mount
  useEffect(() => {
    fetchEntries();
    checkPushSubscription();
  }, []);

  const fetchEntries = async () => {
    setIsLoadingEntries(true);
    try {
      const res = await fetch("/api/guestbook");
      if (res.ok) {
        const data = await res.json();
        setEntries(data);
        
        // Try to read headers or guess mode from URL
        // In local mode, the endpoint is standard nextjs
        setDbMode(process.env.NEXT_PUBLIC_SUPABASE_URL ? "cloud" : "local");
      }
    } catch (error) {
      console.error("Gagal mengambil data guestbook:", error);
    } finally {
      setIsLoadingEntries(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess(false);

    if (!name.trim()) {
      setFormError("Nama tidak boleh kosong.");
      return;
    }
    if (!message.trim()) {
      setFormError("Pesan tidak boleh kosong.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/guestbook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, message }),
      });

      if (res.ok) {
        setFormSuccess(true);
        setName("");
        setMessage("");
        fetchEntries(); // Reload list
      } else {
        const data = await res.json();
        setFormError(data.error || "Gagal menyimpan pesan.");
      }
    } catch (error) {
      setFormError("Terjadi kesalahan koneksi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Push Notification management
  const checkPushSubscription = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPermissionState("unsupported");
      return;
    }

    setPermissionState(Notification.permission);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error("Gagal mengecek push subscription:", error);
    }
  };

  const subscribePush = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushErrorMsg("Browser Anda tidak mendukung push notifications.");
      return;
    }

    setIsSubscribingPush(true);
    setPushErrorMsg("");
    setPushStatusMsg("");

    try {
      // 1. Request permission
      const permission = await Notification.requestPermission();
      setPermissionState(permission);

      if (permission !== "granted") {
        setPushErrorMsg("Izin notifikasi ditolak oleh pengguna.");
        setIsSubscribingPush(false);
        return;
      }

      // 2. Register / Ready SW
      const registration = await navigator.serviceWorker.ready;

      // 3. Subscribe Push
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      // 4. Save to Backend Database
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subscription),
      });

      if (res.ok) {
        setIsSubscribed(true);
        setPushStatusMsg("Berhasil mendaftarkan Push Notification!");
        
        // Show local self-push to verify immediately
        const appName = person.appName || "Portoid";
        const appIcon = person.appIcon || person.avatar || "/uploads/1782947031367-h25xie8.jpg";
        new Notification(appName, {
          body: "Push Notification sukses diaktifkan!",
          icon: appIcon
        });
      } else {
        const errorData = await res.json();
        setPushErrorMsg(errorData.error || "Gagal mengirim data subscribe ke backend.");
      }
    } catch (error: any) {
      console.error("Subscription flow error:", error);
      setPushErrorMsg(`Gagal berlangganan push notification: ${error.message || error}`);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const unsubscribePush = async () => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      setPushErrorMsg("Browser Anda tidak mendukung push notifications.");
      return;
    }

    setIsSubscribingPush(true);
    setPushErrorMsg("");
    setPushStatusMsg("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // 1. Call backend to remove endpoint from DB
        const res = await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: "DELETE",
        });

        // 2. Unsubscribe from browser PushManager
        await subscription.unsubscribe();

        if (res.ok) {
          setIsSubscribed(false);
          setPushStatusMsg("Berhasil menonaktifkan notifikasi.");
        } else {
          setPushErrorMsg("Gagal menghapus subscription dari database.");
        }
      } else {
        setIsSubscribed(false);
        setPushStatusMsg("Anda sudah tidak berlangganan.");
      }
    } catch (error: any) {
      console.error("Gagal menonaktifkan push notification:", error);
      setPushErrorMsg(`Gagal mematikan notifikasi: ${error.message || error}`);
    } finally {
      setIsSubscribingPush(false);
    }
  };

  const sendTestNotification = async () => {
    setIsSendingPush(true);
    setPushErrorMsg("");
    setPushStatusMsg("");

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        setPushErrorMsg("Anda belum berlangganan. Silakan aktifkan push notification terlebih dahulu.");
        setIsSendingPush(false);
        return;
      }

      // Send to backend endpoint
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: pushTestMessage,
          subscription: subscription, // send directly to client subscription for instant test
        }),
      });

      if (res.ok) {
        setPushStatusMsg("Notifikasi dikirim! Silakan tunggu notifikasi muncul di desktop/HP Anda.");
      } else {
        const data = await res.json();
        setPushErrorMsg(data.error || "Gagal mengirimkan notifikasi.");
      }
    } catch (error) {
      setPushErrorMsg("Koneksi gagal saat mengirim push notification.");
    } finally {
      setIsSendingPush(false);
    }
  };

  return (
    <Column maxWidth="m" fillWidth gap="xl" paddingY="12" horizontal="center">
      <RevealFx translateY="4" fillWidth horizontal="center" paddingBottom="4">
        <Row gap="8" vertical="center">
          <Heading wrap="balance" variant="display-strong-l">
            Buku Tamu & Notifikasi
          </Heading>
          <Badge
            background={dbMode === "cloud" ? "brand-alpha-medium" : "neutral-alpha-medium"}
            paddingX="12"
            paddingY="4"
            style={{ height: 'fit-content' }}
          >
            {dbMode === "cloud" ? "Supabase PostgreSQL Active" : "Local JSON Database Active"}
          </Badge>
        </Row>
      </RevealFx>

      <RevealFx translateY="8" delay={0.1} fillWidth horizontal="center" paddingBottom="16">
        <Text wrap="balance" onBackground="neutral-weak" variant="heading-default-xl">
          Tinggalkan pesan Anda pada database, serta aktifkan service worker untuk notifikasi web push.
        </Text>
      </RevealFx>

      <Row fillWidth gap="l" s={{ direction: "column" }}>
        {/* Left Side: Guestbook Form */}
        <Column style={{ flex: 1.2, backdropFilter: "blur(8px)" }} gap="m" padding="m" border="neutral-alpha-weak" radius="l" background="surface">
          <Heading as="h2" variant="heading-strong-l">
            Isi Buku Tamu
          </Heading>
          <Text size="s" onBackground="neutral-weak">
            Tulis nama dan komentar Anda. Data akan langsung disimpan di database.
          </Text>

          <form onSubmit={handleFormSubmit}>
            <Column gap="s" fillWidth>
              <Input
                id="guest-name"
                label="Nama Lengkap"
                placeholder="Nama Anda..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isSubmitting}
              />
              <Textarea
                id="guest-message"
                label="Komentar / Masukan"
                placeholder="Tulis pesan Anda..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                disabled={isSubmitting}
                lines={4}
              />
              
              {formError && (
                <Text size="s" style={{ color: "var(--red-medium)" }}>
                  ⚠️ {formError}
                </Text>
              )}

              {formSuccess && (
                <Text size="s" style={{ color: "var(--green-medium)" }}>
                  ✅ Pesan Anda sukses tersimpan di database!
                </Text>
              )}

              <Button
                id="submit-guestbook"
                type="submit"
                variant="primary"
                fillWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner size="s" /> : "Kirim Komentar"}
              </Button>
            </Column>
          </form>
        </Column>

        {/* Right Side: Push Notifications Setting */}
        <Column style={{ flex: 0.8, backdropFilter: "blur(8px)" }} gap="m" padding="m" border="neutral-alpha-weak" radius="l" background="surface">
          <Heading as="h2" variant="heading-strong-l">
            Web Push Notification
          </Heading>
          <Text size="s" onBackground="neutral-weak">
            Menguji integrasi Service Worker push notification yang terdaftar di browser Anda.
          </Text>

          <Column gap="m" fillWidth>
            {/* Status Indicator */}
            <Row gap="8" vertical="center" fillWidth padding="xs" radius="s" border="neutral-alpha-weak" background="page">
              <div 
                style={{
                  width: "10px", 
                  height: "10px", 
                  borderRadius: "50%", 
                  backgroundColor: isSubscribed ? "var(--green-medium)" : permissionState === "denied" ? "var(--red-medium)" : "var(--yellow-medium)"
                }} 
              />
              <Text size="s" weight="strong">
                Status: {isSubscribed ? "Aktif (Menerima Notifikasi)" : permissionState === "denied" ? "Izin Ditolak" : "Belum Aktif"}
              </Text>
            </Row>

            {/* Subscribe Button */}
            {!isSubscribed ? (
              <Button
                id="subscribe-push"
                variant="secondary"
                fillWidth
                onClick={subscribePush}
                disabled={isSubscribingPush || permissionState === "unsupported"}
              >
                {isSubscribingPush ? <Spinner size="s" /> : "Aktifkan Notifikasi"}
              </Button>
            ) : (
              <Column gap="s" fillWidth>
                <Input
                  id="push-msg"
                  label="Pesan Notifikasi Uji Coba"
                  placeholder="Ketik notifikasi..."
                  value={pushTestMessage}
                  onChange={(e) => setPushTestMessage(e.target.value)}
                  disabled={isSendingPush}
                />
                <Button
                  id="send-push"
                  variant="primary"
                  fillWidth
                  onClick={sendTestNotification}
                  disabled={isSendingPush}
                >
                  {isSendingPush ? <Spinner size="s" /> : "Kirim Notifikasi Uji Coba"}
                </Button>
                <Button
                  id="unsubscribe-push"
                  variant="danger"
                  fillWidth
                  onClick={unsubscribePush}
                  disabled={isSubscribingPush}
                >
                  {isSubscribingPush ? <Spinner size="s" /> : "Matikan Notifikasi"}
                </Button>
              </Column>
            )}

            {pushErrorMsg && (
              <Text size="s" style={{ color: "var(--red-medium)" }}>
                ⚠️ {pushErrorMsg}
              </Text>
            )}

            {pushStatusMsg && (
              <Text size="s" style={{ color: "var(--green-medium)" }}>
                ℹ️ {pushStatusMsg}
              </Text>
            )}
          </Column>
        </Column>
      </Row>

      <Line fillWidth />

      {/* Guestbook Signatures List */}
      <Column fillWidth gap="m" paddingX="xs">
        <Heading as="h2" variant="heading-strong-xl">
          Pesan Pengunjung
        </Heading>

        {isLoadingEntries ? (
          <Row fillWidth horizontal="center" padding="xl">
            <Spinner size="m" />
          </Row>
        ) : entries.length === 0 ? (
          <Row fillWidth horizontal="center" padding="l" border="neutral-alpha-weak" radius="m" background="surface">
            <Text onBackground="neutral-weak">Belum ada komentar. Jadilah yang pertama menulis di buku tamu!</Text>
          </Row>
        ) : (
          <Column gap="s" fillWidth>
            {entries.map((entry) => (
              <RevealFx key={entry.id} translateY="8" fillWidth>
                <Row
                  fillWidth
                  padding="m"
                  border="neutral-alpha-weak"
                  radius="m-4"
                  gap="m"
                  vertical="center"
                  background="surface"
                >
                  <Avatar size="s" value={entry.name} />
                  <Column gap="4" flex={1}>
                    <Row fillWidth horizontal="between" vertical="center" wrap>
                      <Text weight="strong" size="s">
                        {entry.name}
                      </Text>
                      <Text onBackground="neutral-weak" size="xs">
                        {new Date(entry.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </Text>
                    </Row>
                    <Text size="s" onBackground="neutral-medium">
                      {entry.message}
                    </Text>
                  </Column>
                </Row>
              </RevealFx>
            ))}
          </Column>
        )}
      </Column>
    </Column>
  );
}
