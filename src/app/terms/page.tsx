import React from "react";
import { Column, Heading, Text, Line } from "@once-ui-system/core";
import { Meta } from "@once-ui-system/core";
import { baseURL } from "@/resources";

export async function generateMetadata() {
  return Meta.generate({
    title: "Terms of Service",
    description: "Syarat dan Ketentuan Portoid",
    baseURL: baseURL,
    path: "/terms",
  });
}

export default function TermsPage() {
  const currentYear = new Date().getFullYear();

  return (
    <Column maxWidth="m" fillWidth gap="xl" paddingY="12" horizontal="center" style={{ margin: "auto" }}>
      <Column fillWidth gap="m">
        <Heading as="h1" variant="heading-strong-xl">
          Syarat & Ketentuan Layanan
        </Heading>
        <Text size="s" onBackground="neutral-weak">
          Terakhir diperbarui: {currentYear}
        </Text>
        <Line background="neutral-alpha-weak" />
      </Column>

      <Column fillWidth gap="l">
        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            1. Ketentuan Penggunaan
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Dengan mengakses situs web ini, Anda setuju untuk terikat oleh Syarat dan Ketentuan Layanan ini, serta tunduk pada hukum dan peraturan yang berlaku. Jika Anda tidak menyetujui ketentuan ini, Anda dilarang menggunakan situs ini.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            2. Hak Kekayaan Intelektual
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Seluruh konten yang dipublikasikan di situs ini, termasuk namun tidak terbatas pada teks, gambar, kode sumber, dan sistem desain, dimiliki secara eksklusif oleh pembuat portofolio, kecuali konten berlisensi terbuka atau karya pihak ketiga yang secara eksplisit dicantumkan.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            3. Penggunaan Buku Tamu (Guestbook)
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Saat menulis pesan di Buku Tamu, Anda setuju untuk tidak mengirimkan pesan yang bersifat spam, promosi komersial tidak sah, merusak, kasar, melecehkan, atau melanggar hak hukum orang lain. Administrator berhak menghapus pesan yang dinilai tidak pantas secara sepihak.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            4. Batasan Tanggung Jawab
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Portofolio ini disediakan "sebagaimana adanya". Kami tidak memberikan jaminan apa pun, baik tersurat maupun tersirat, mengenai keakuratan informasi, keandalan server, atau ketiadaan gangguan pada akses situs web.
          </Text>
        </Column>

        <Column gap="s">
          <Heading as="h2" variant="heading-strong-l">
            5. Perubahan Ketentuan
          </Heading>
          <Text size="m" style={{ lineHeight: "1.6" }}>
            Syarat dan ketentuan ini dapat direvisi sewaktu-waktu tanpa pemberitahuan sebelumnya. Dengan tetap menggunakan situs ini setelah adanya perubahan, Anda menyetujui syarat-syarat yang baru.
          </Text>
        </Column>
      </Column>
    </Column>
  );
}
