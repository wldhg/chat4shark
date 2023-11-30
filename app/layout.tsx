import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AIBD Chat',
  description: 'Most secure chat app in the world',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
