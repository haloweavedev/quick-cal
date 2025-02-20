import Link from "next/link";
import { Calendar, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Error",
  description: "Something went wrong with authentication",
};

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: { error?: string; primaryEmail?: string };
}) {
  // Await the searchParams to avoid the sync dynamic API error
  await Promise.resolve();
  const errorMessage = getErrorMessage(searchParams.error, searchParams.primaryEmail);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Calendar className="h-7 w-7" />
            <span className="text-xl font-bold">QuickCal</span>
          </Link>
        </div>
      </header>

      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="brutalist-box">
            <div className="text-center mb-6">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-600" />
              <h1 className="heading-md mb-2">Authentication Error</h1>
              <div className="text-lead">
                {errorMessage.split('\n').map((part, i) => (
                  <p key={i} className="mb-2">{part}</p>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4 mt-8">
              {searchParams.error === 'secondary_account' ? (
                // Special case for secondary account login attempts
                <Link href="/login" className="brutalist-button w-full text-center">
                  Sign in with Primary Account
                </Link>
              ) : (
                <Link href="/login" className="brutalist-button w-full text-center">
                  Try Again
                </Link>
              )}
              <Link href="/" className="brutalist-button-small w-full text-center">
                Return to Home
              </Link>
            </div>

            <div className="mt-8 text-center text-sm">
              <p>
                Need help? <Link href="/help" className="brutalist-underline">Contact support</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t-2 border-black py-4">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>QuickCal © 2025 • Even our errors are sarcastic</p>
        </div>
      </footer>
    </div>
  );
}

function getErrorMessage(error?: string, primaryEmail?: string): string {
  switch (error) {
    case "secondary_account":
      return `This email is already connected as a secondary calendar account.\n\nPlease sign in with your primary account (${primaryEmail || "your primary email"}) instead.`;
    case "OAuthSignin":
      return "Error starting the sign in process. Our hamsters must be on strike.";
    case "OAuthCallback":
      return "Error during the OAuth callback. Google probably judged your calendar and rejected you.";
    case "OAuthCreateAccount":
      return "Could not create a user account. We're as disappointed as you are.";
    case "EmailCreateAccount":
      return "Could not create a user account using email provider. Carrier pigeons are down.";
    case "Callback":
      return "Error during the OAuth callback. The internet spirits are displeased today.";
    case "EmailSignin":
      return "The sign in link was invalid or has expired. Just like your productivity.";
    case "CredentialsSignin":
      return "Invalid credentials. Did you forget your password? Of course you did.";
    case "SessionRequired":
      return "You need to be signed in to access that page. How shocking!";
    case "Configuration":
      return "There's an issue with our authentication configuration. Our tech team is on it (or maybe they're procrastinating).";
    case "Default":
    default:
      return "An unexpected error occurred. Our sarcasm engine is temporarily out of service.";
  }
}