import React from "react";
import { Column, Heading, Text, Line } from "@once-ui-system/core";
import { Meta } from "@once-ui-system/core";
import { baseURL } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: "Privacy Policy",
    description: "Kebijakan Privasi Portoid",
    baseURL: baseURL,
    path: "/privacy",
  });
}

export default function PrivacyPage() {
  const currentYear = new Date().getFullYear();

  return (
    <Column maxWidth="m" fillWidth gap="xl" paddingY="12" horizontal="center" style={{ margin: "auto" }}>
      <Column fillWidth gap="m">
        <Heading as="h1" variant="heading-strong-xl">
          Kebijakan Privasi
        </Heading>
        <Text size="s" onBackground="neutral-weak">
          Terakhir diperbarui: {currentYear}
        </Text>
        <Line background="neutral-alpha-weak" />
      </Column>

      <Column fillWidth gap="l">
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            1. Pengumpulan Informasi
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Kami mengumpulkan informasi yang Anda berikan secara langsung saat berinteraksi dengan situs kami, seperti nama dan pesan yang Anda kirimkan melalui Buku Tamu (Guestbook) atau saat mendaftar buletin kami.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            2. Penggunaan Informasi
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Informasi yang dikumpulkan digunakan semata-mata untuk mengelola kiriman pada Buku Tamu, memberikan notifikasi push (jika Anda mendaftar), dan menganalisis interaksi situs secara umum untuk meningkatkan pengalaman pengguna.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            3. Cookies dan Pelacakan
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Situs ini dapat menggunakan cookie untuk mengingat preferensi Anda (seperti tema gelap/terang) serta token sesi administratif yang aman jika Anda masuk ke panel admin.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            4. Perlindungan Data
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Kami berkomitmen menjaga keamanan data Anda. Kami menggunakan koneksi terenkripsi (HTTPS) dan tidak menjual atau menyebarkan informasi pribadi Anda ke pihak ketiga mana pun tanpa izin Anda.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            5. Kontak Kami
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Jika Anda memiliki pertanyaan mengenai kebijakan privasi ini, silakan hubungi kami melalui alamat email administratif yang tercantum pada footer situs ini.
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
