import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FlashyCardy Course",
  description: "A flashcard course application with authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: 'oklch(0.923 0.003 48.717)',
          colorBackground: 'oklch(0.147 0.004 49.25)',
          colorInputBackground: 'oklch(1 0 0 / 15%)',
          colorInputText: 'oklch(0.985 0.001 106.423)',
          colorText: 'oklch(0.985 0.001 106.423)',
          colorTextSecondary: 'oklch(0.709 0.01 56.259)',
          borderRadius: '0.625rem',
          colorNeutral: 'oklch(0.268 0.007 34.298)',
          colorDanger: 'oklch(0.704 0.191 22.216)',
          colorSuccess: 'oklch(0.646 0.222 41.116)',
          colorWarning: 'oklch(0.828 0.189 84.429)',
          fontSize: '1rem',
          fontFamily: 'var(--font-poppins), ui-sans-serif, system-ui, sans-serif'
        },
        elements: {
          card: {
            backgroundColor: 'oklch(0.216 0.006 56.043)',
            border: '1px solid oklch(1 0 0 / 10%)',
            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
          },
          headerTitle: {
            color: 'oklch(0.985 0.001 106.423)',
            fontFamily: 'var(--font-poppins), ui-sans-serif, system-ui, sans-serif'
          },
          headerSubtitle: {
            color: 'oklch(0.709 0.01 56.259)',
            fontFamily: 'var(--font-poppins), ui-sans-serif, system-ui, sans-serif'
          },
          socialButtonsBlockButton: {
            backgroundColor: 'oklch(0.268 0.007 34.298)',
            border: '1px solid oklch(1 0 0 / 15%)',
            color: 'oklch(0.985 0.001 106.423)',
            '&:hover': {
              backgroundColor: 'oklch(0.323 0.008 34.298)'
            }
          },
          formButtonPrimary: {
            backgroundColor: 'oklch(0.923 0.003 48.717)',
            color: 'oklch(0.216 0.006 56.043)',
            '&:hover': {
              backgroundColor: 'oklch(0.853 0.003 48.717)'
            }
          },
          footerActionLink: {
            color: 'oklch(0.923 0.003 48.717)',
            '&:hover': {
              color: 'oklch(0.853 0.003 48.717)'
            }
          }
        }
      }}
    >
      <html lang="en" className={`dark ${poppins.variable}`} style={{ fontFamily: poppins.style.fontFamily }}>
        <body
          className={`${poppins.className} antialiased`}
          style={{ fontFamily: poppins.style.fontFamily }}
        >
          <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-foreground">
                    FlashyCardy Course
                  </h1>
                </div>
                <div className="flex items-center space-x-4">
                  <SignedIn>
                    <UserButton 
                      appearance={{
                        baseTheme: dark,
                        elements: {
                          avatarBox: {
                            width: '2.25rem',
                            height: '2.25rem'
                          },
                          userButtonPopoverCard: {
                            backgroundColor: 'oklch(0.216 0.006 56.043)',
                            border: '1px solid oklch(1 0 0 / 10%)',
                            boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)'
                          },
                          userButtonPopoverActionButton: {
                            color: 'oklch(0.985 0.001 106.423)',
                            '&:hover': {
                              backgroundColor: 'oklch(0.268 0.007 34.298)'
                            }
                          }
                        }
                      }}
                    />
                  </SignedIn>
                </div>
              </div>
            </div>
          </header>
          <main>
            {children}
          </main>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
