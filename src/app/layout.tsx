import './globals.css'
import './standards.css'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html>
        <body>
            {children}
          </body>
        </html>
      )
}