"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { connectGoogleCalendar } from "@/actions/auth";

interface AddAccountFormProps {
  userId: string;
  isPrimary?: boolean;
}

export default function AddAccountForm({
  userId,
  isPrimary = false,
}: AddAccountFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [accountLabel, setAccountLabel] = useState("");

  const defaultPlaceholder = isPrimary
    ? "e.g., Primary Calendar, Work Calendar"
    : "e.g., Personal, Work, Secret Life";

  const buttonText = isPrimary
    ? "Connect Primary Calendar"
    : "Connect Google Calendar";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!accountLabel || accountLabel.trim() === "") {
      toast.error("Please enter a label for this calendar");
      return;
    }

    setIsLoading(true);

    try {
      if (isPrimary) {
        // For primary accounts, use NextAuth flow
        console.log("Connecting primary calendar for user:", userId);
        await connectGoogleCalendar(userId, accountLabel, true);
      } else {
        // For secondary accounts, use direct window.location approach
        console.log("Connecting secondary calendar with label:", accountLabel);
        const encodedLabel = encodeURIComponent(accountLabel);

        // Directly navigate to our custom connect endpoint
        window.location.href = `/api/calendars/secondary/connect?label=${encodedLabel}`;
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Failed to connect calendar:", error);
        toast.error(`Failed to connect calendar: ${error.message}`);
      } else {
        console.error("Failed to connect calendar: unknown error", error);
        toast.error("Failed to connect calendar (unknown error).");
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label htmlFor="account-label" className="font-bold block">
            Calendar Label
          </label>
          <input
            id="account-label"
            name="label"
            type="text"
            value={accountLabel}
            onChange={(e) => setAccountLabel(e.target.value)}
            placeholder={defaultPlaceholder}
            className="brutalist-input w-full"
            disabled={isLoading}
            required
          />
          <p className="text-sm">
            This helps you identify this calendar in your dashboard.
            {isPrimary && " This will be your primary calendar."}
          </p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className={`brutalist-button w-full flex items-center justify-center gap-3 ${
              isPrimary ? "brutalist-purple" : ""
            }`}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {buttonText}
              </>
            )}
          </button>
        </div>
      </form>

      <div className="pt-4 text-center">
        <p className="text-sm italic">
          Note: We&apos;ll need access to read and sync your events.
          {isPrimary &&
            " As your primary calendar, this account will be used for AI features and insights."}
        </p>
      </div>
    </div>
  );
}
