export const Layout = ({ children, title = "HCB API Manager" }: { children: any, title?: string }) => (
  <html>
    <head>
      <title>{title}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=Funnel+Sans:ital,wght@0,300..800;1,300..800&display=swap" rel="stylesheet" />
    </head>
    <body className="bg-[#16161f] text-[#a9b1d6]" style={{ fontFamily: 'Funnel Sans, sans-serif' }}>
      {children}
      <footer className="mt-8 mb-4 text-center text-sm text-[#7f8fa6]">
        made with <span className="text-[#f7768e]">&lt;3</span> by{' '}
        <a
          href="https://skyfall.dev/?utm_source=hcb-api"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-[#a9b1d6]"
        >
          skyfall
        </a>
      </footer>
    </body>
  </html>
)
