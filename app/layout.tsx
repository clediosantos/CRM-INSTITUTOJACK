import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Instituto Jack - CRM & Gestão da Beleza',
  description: 'Sistema moderno de gestão e CRM para o Instituto Jack. Especialidades em Cabelo, Podologia, Unha, Depilação e Sobrancelhas. Cuidado que transforma, beleza que realça.',
  openGraph: {
    title: 'Instituto Jack - CRM & Gestão da Beleza',
    description: 'Sistema moderno de gestão e CRM para o Instituto Jack. Especialidades em Cabelo, Podologia, Unha, Depilação e Sobrancelhas. Cuidado que transforma, beleza que realça.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Instituto Jack - CRM & Gestão da Beleza',
    description: 'Sistema moderno de gestão e CRM para o Instituto Jack. Especialidades em Cabelo, Podologia, Unha, Depilação e Sobrancelhas. Cuidado que transforma, beleza que realça.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700;800&family=Montserrat:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="antialiased">
        {children}
      </body>
    </html>
  );
}
