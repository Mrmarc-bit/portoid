"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Column,
  Heading,
  Text,
  Button,
  Input,
  Row,
  RevealFx,
  Spinner
} from "@once-ui-system/core";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        // Redirect to admin dashboard
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Gagal masuk. Silakan periksa kembali kredensial Anda.");
      }
    } catch (error) {
      setErrorMsg("Koneksi gagal saat menghubungi server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Column
      fillWidth
      horizontal="center"
      vertical="center"
      style={{ minHeight: "70vh" }}
      paddingY="24"
    >
      <Column
        maxWidth={28}
        fillWidth
        gap="l"
        padding="l"
        border="neutral-alpha-weak"
        radius="l"
        background="surface"
        style={{ backdropFilter: "blur(12px)", boxShadow: "var(--shadow-l)" }}
      >
        <Column gap="xs" align="center" horizontal="center">
          <RevealFx translateY="4">
            <Heading as="h1" variant="heading-strong-xl" style={{ textAlign: "center" }}>
              Admin Login
            </Heading>
          </RevealFx>
          <RevealFx translateY="8" delay={0.1}>
            <Text size="s" onBackground="neutral-weak" style={{ textAlign: "center" }}>
              Silakan masuk untuk mengelola buku tamu & notifikasi.
            </Text>
          </RevealFx>
        </Column>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <Column gap="m" fillWidth>
            <Input
              id="admin-username"
              label="Username"
              placeholder="Masukkan username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isLoading}
            />

            <Input
              id="admin-password"
              type="password"
              label="Password"
              placeholder="Masukkan password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />

            {errorMsg && (
              <RevealFx fillWidth>
                <Text size="s" style={{ color: "var(--red-medium)", textAlign: "center" }}>
                  ⚠️ {errorMsg}
                </Text>
              </RevealFx>
            )}

            <Button
              id="btn-login"
              type="submit"
              variant="primary"
              fillWidth
              disabled={isLoading}
            >
              {isLoading ? <Spinner size="s" /> : "Masuk"}
            </Button>
          </Column>
        </form>

        <Row fillWidth horizontal="center">
          <Button
            href="/"
            variant="tertiary"
            size="s"
          >
            Kembali ke Beranda
          </Button>
        </Row>
      </Column>
    </Column>
  );
}
