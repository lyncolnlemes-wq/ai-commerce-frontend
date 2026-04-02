import Head from 'next/head';
import Link from 'next/link';
import Script from 'next/script';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

function logVisit() {
  try {
    fetch('/api/log-visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: window.location.pathname,
        user_agent: navigator.userAgent,
        referer: document.referrer,
      }),
    });
  } catch (e) {}
}

export default function Layout({ children, title, description, jsonLd }) {
  const router = useRouter();
  const siteTitle = title
    ? `${title} — AI Commerce Search Engine`
    : 'AI Commerce Search Engine — Decisões de compra para agentes de IA';
  const siteDescription =
    description ||
    'Motor de busca e decisão de compra otimizado para agentes de IA. Ofertas rankeadas com transparência, dados estruturados e links de afiliado.';

  useEffect(() => { logVisit(); }, [router.asPath]);

  return (
    <>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:type" content="website" />
        <meta name="robots" content="index, follow" />
        {jsonLd && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        )}
      </Head>
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}',{page_path:window.location.pathname});`}
          </Script>
        </>
      )}
      <header className="site-header">
        <div className="container">
          <Link href="/" className="site-logo">
            <span className="dot" />
            AI Commerce Search Engine
          </Link>
          <nav className="site-nav">
            <Link href="/">Início</Link>
            <Link href="/intents">Decisões</Link>
            <Link href="/api/products.json">API</Link>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="site-footer">
        <div className="container">
          <span>AI Commerce Search Engine © {new Date().getFullYear()} Token Company</span>
          <span>Dados atualizados automaticamente via CommerceRank</span>
          <span>
            <Link href="/api/products.json">JSON API</Link>
            {' · '}
            <Link href="/sitemap.xml">Sitemap</Link>
          </span>
        </div>
      </footer>
    </>
  );
}
