import { Router, Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { prisma } from '../utils/prisma';

const router = Router();

// Función para servir el HTML base con meta tags dinámicos
const serveHotelPage = async (req: Request, res: Response) => {
   const { tenant } = req.params;

   try {
      // Verificar que el tenant existe
      const tenantData = await prisma.tenant.findUnique({
         where: { slug: tenant },
         select: {
            id: true,
            name: true,
            slug: true,
            brand_primary: true,
            brand_logo: true,
            currency: true,
            timezone: true,
         },
      });

      if (!tenantData) {
         // Si el tenant no existe, servir página 404
         return serve404Page(res);
      }

      // Leer el archivo HTML base
      const htmlPath = path.join(
         __dirname,
         '../../../public-frontend/dist/index.html'
      );

      if (!fs.existsSync(htmlPath)) {
         return res.status(500).send('Public frontend not built');
      }

      let html = fs.readFileSync(htmlPath, 'utf8');

      // Reemplazar meta tags dinámicos
      html = html.replace(
         '<title>Reserve-SE - Sistema de Reservas Hoteleras</title>',
         `<title>${tenantData.name} - Reservas Online</title>`
      );

      html = html.replace(
         'content="Sistema de reservas hoteleras - Reserve-SE"',
         `content="Reserva tu habitación en ${tenantData.name}. Disfruta de una experiencia única en nuestro hotel."`
      );

      // Agregar meta tags adicionales para SEO
      const additionalMetaTags = `
         <meta property="og:title" content="${
            tenantData.name
         } - Reservas Online" />
         <meta property="og:description" content="Reserva tu habitación en ${
            tenantData.name
         }. Disfruta de una experiencia única en nuestro hotel." />
         <meta property="og:type" content="website" />
         <meta property="og:url" content="https://reserve-se.com/${
            tenantData.slug
         }" />
         <meta property="og:image" content="${
            tenantData.brand_logo || 'https://reserve-se.com/logo.png'
         }" />
         <meta name="twitter:card" content="summary_large_image" />
         <meta name="twitter:title" content="${
            tenantData.name
         } - Reservas Online" />
         <meta name="twitter:description" content="Reserva tu habitación en ${
            tenantData.name
         }. Disfruta de una experiencia única en nuestro hotel." />
         <meta name="twitter:image" content="${
            tenantData.brand_logo || 'https://reserve-se.com/logo.png'
         }" />
         <link rel="canonical" href="https://reserve-se.com/${
            tenantData.slug
         }" />
      `;

      html = html.replace('</head>', `${additionalMetaTags}</head>`);

      // Agregar datos del tenant como script global para el frontend
      const tenantScript = `
         <script>
            window.__TENANT_CONFIG__ = ${JSON.stringify({
               id: tenantData.id,
               name: tenantData.name,
               slug: tenantData.slug,
               brand_primary: tenantData.brand_primary,
               brand_logo: tenantData.brand_logo,
               currency: tenantData.currency,
               timezone: tenantData.timezone,
            })};
         </script>
      `;

      html = html.replace('</head>', `${tenantScript}</head>`);

      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
   } catch (error) {
      console.error('Error serving hotel page:', error);
      return res.status(500).send('Internal server error');
   }
};

// Función para servir página 404
const serve404Page = (res: Response) => {
   const htmlPath = path.join(
      __dirname,
      '../../../public-frontend/dist/index.html'
   );

   if (!fs.existsSync(htmlPath)) {
      return res.status(500).send('Public frontend not built');
   }

   let html = fs.readFileSync(htmlPath, 'utf8');

   // Actualizar meta tags para 404
   html = html.replace(
      '<title>Reserve-SE - Sistema de Reservas Hoteleras</title>',
      '<title>Hotel no encontrado - Reserve-SE</title>'
   );

   html = html.replace(
      'content="Sistema de reservas hoteleras - Reserve-SE"',
      'content="Lo sentimos, no pudimos encontrar el hotel que buscas."'
   );

   res.setHeader('Content-Type', 'text/html');
   return res.send(html);
};

// Ruta para servir la página principal (redirige a hotel por defecto)
router.get('/', (req: Request, res: Response) => {
   res.redirect('/hotel-luna');
});

// Ruta para servir páginas de hoteles específicos (solo si no es una ruta especial)
router.get('/:tenant', (req: Request, res: Response) => {
   const { tenant } = req.params;

   // Verificar si es una ruta especial que no debe ser tratada como tenant
   const specialRoutes = [
      'sitemap.xml',
      'robots.txt',
      'manifest.json',
      'favicon.ico',
      'assets',
   ];
   if (specialRoutes.includes(tenant)) {
      return res.status(404).send('Not found');
   }

   return serveHotelPage(req, res);
});

// Ruta para servir archivos estáticos del public-frontend
router.use('/assets', (req: Request, res: Response) => {
   const filePath = path.join(
      __dirname,
      '../../../public-frontend/dist/assets',
      req.path.replace('/assets/', '')
   );

   if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
   } else {
      res.status(404).send('File not found');
   }
});

// Ruta para servir el favicon
router.get('/favicon.ico', (req: Request, res: Response) => {
   const faviconPath = path.join(
      __dirname,
      '../../../public-frontend/dist/favicon.ico'
   );

   if (fs.existsSync(faviconPath)) {
      res.sendFile(faviconPath);
   } else {
      res.status(404).send('Favicon not found');
   }
});

// Ruta para servir el manifest.json (PWA)
router.get('/manifest.json', (req: Request, res: Response) => {
   const manifestPath = path.join(
      __dirname,
      '../../../public-frontend/dist/manifest.json'
   );

   if (fs.existsSync(manifestPath)) {
      res.sendFile(manifestPath);
   } else {
      res.status(404).send('Manifest not found');
   }
});

// Ruta para servir robots.txt
router.get('/robots.txt', (req: Request, res: Response) => {
   const robotsPath = path.join(
      __dirname,
      '../../../public-frontend/dist/robots.txt'
   );

   if (fs.existsSync(robotsPath)) {
      res.sendFile(robotsPath);
   } else {
      // Generar robots.txt dinámicamente
      const robotsContent = `User-agent: *
Allow: /

Sitemap: https://reserve-se.com/sitemap.xml`;

      res.setHeader('Content-Type', 'text/plain');
      res.send(robotsContent);
   }
});

// Ruta para generar sitemap.xml dinámicamente
router.get('/sitemap.xml', async (req: Request, res: Response) => {
   try {
      const tenants = await prisma.tenant.findMany({
         select: {
            slug: true,
            updated_at: true,
         },
      });

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
   <url>
      <loc>https://reserve-se.com/</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>daily</changefreq>
      <priority>1.0</priority>
   </url>
   ${tenants
      .map(
         (tenant) => `
   <url>
      <loc>https://reserve-se.com/${tenant.slug}</loc>
      <lastmod>${tenant.updated_at.toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.8</priority>
   </url>`
      )
      .join('')}
</urlset>`;

      res.setHeader('Content-Type', 'application/xml');
      res.send(sitemap);
   } catch (error) {
      console.error('Error generating sitemap:', error);
      res.status(500).send('Error generating sitemap');
   }
});

// Ruta para servir vite.svg
router.get('/vite.svg', (req: Request, res: Response) => {
   const viteSvgPath = path.join(
      __dirname,
      '../../../public-frontend/dist/vite.svg'
   );

   if (fs.existsSync(viteSvgPath)) {
      res.sendFile(viteSvgPath);
   } else {
      res.status(404).send('Vite SVG not found');
   }
});

// Rutas para servir archivos del widget
router.get('/dist/style.css', (req: Request, res: Response) => {
   const widgetCssPath = path.join(__dirname, '../../../widget/dist/style.css');

   if (fs.existsSync(widgetCssPath)) {
      res.setHeader('Content-Type', 'text/css');
      res.sendFile(widgetCssPath);
   } else {
      res.status(404).send('Widget CSS not found');
   }
});

router.get('/dist/booking-widget.umd.cjs', (req: Request, res: Response) => {
   const widgetJsPath = path.join(
      __dirname,
      '../../../widget/dist/booking-widget.umd.cjs'
   );

   if (fs.existsSync(widgetJsPath)) {
      res.setHeader('Content-Type', 'application/javascript');
      res.sendFile(widgetJsPath);
   } else {
      res.status(404).send('Widget JS not found');
   }
});

export default router;
