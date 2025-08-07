import './globals.css';
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { FirebaseProvider } from './firebaseContext';

export const metadata: Metadata = {
  title: 'GenixAI',
  description: 'Experience the next generation of AI-powered tools.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <FirebaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={true}
          >
            {children}
          </ThemeProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
