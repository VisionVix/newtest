import './globals.css'
export const metadata = { title: 'New Project-nextjs', description: 'Converted by VEX Studio' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
      </head>
      <body>{children}
      </body>
    </html>
  )
}