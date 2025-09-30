import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEOHead = ({ 
  title = "iLyra - Plataforma de Evolução Espiritual com IA",
  description = "Descubra sua jornada espiritual com a iLyra. Plataforma completa com IA, métricas espirituais, meditação guiada e muito mais. Transforme sua vida hoje!",
  keywords = "evolução espiritual, meditação, IA espiritual, chakras, consciência, espiritualidade, autoconhecimento, desenvolvimento pessoal",
  image = "/images/ilyra-og-image.jpg",
  url = "https://ilyra.com",
  type = "website"
}) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "iLyra",
    "description": description,
    "url": url,
    "applicationCategory": "LifestyleApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock"
    },
    "author": {
      "@type": "Organization",
      "name": "iLyra",
      "url": url
    },
    "publisher": {
      "@type": "Organization",
      "name": "iLyra",
      "url": url
    }
  };

  return (
    <Helmet>
      {/* Título e Meta Tags Básicas */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="iLyra" />
      <meta name="robots" content="index, follow" />
      <meta name="language" content="pt-BR" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="iLyra" />
      <meta property="og:locale" content="pt_BR" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@ilyra" />
      
      {/* Viewport e Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="msapplication-TileColor" content="#8B5CF6" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      
      {/* Preconnect para Performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {/* Hreflang para Internacionalização */}
      <link rel="alternate" hrefLang="pt-br" href={url} />
      <link rel="alternate" hrefLang="x-default" href={url} />
      
      {/* DNS Prefetch para Performance */}
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      
      {/* Preload de Recursos Críticos */}
      <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
    </Helmet>
  );
};

export default SEOHead;
