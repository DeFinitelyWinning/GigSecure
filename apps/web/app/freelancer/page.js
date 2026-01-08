"use client";

import ActiveGigs from "../../components/ActiveGigs";
import { Header } from "../../components/Header";

export default function FreelancerPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Header />

      <main className="max-w-full px-3 md:px-4 py-4">
        <section className="flex justify-between items-start gap-8">
          {/* LEFT COLUMN: Title & List */}
          <div className="flex-1 max-w-xl">
            <h1 className="heading-machina text-lg md:text-xl mb-2">Freelancer Dashboard</h1>

            <p className="text-xs text-slate-400 mb-6">
              View gigs sent to you. When the job is done, ask the client for the
              <span className="text-amber-500 font-bold mx-1">Secret Key</span>
              and click "Unlock Funds" to get paid.
            </p>

            {/* The 'role="freelancer"' prop tells this component to:
                1. Fetch gigs where YOU are the Destination
                2. Show the 'Unlock Funds' button
            */}
            <ActiveGigs role="freelancer" />
          </div>

          {/* RIGHT COLUMN: Spacer (Kept empty to match Client Layout structure) */}
          <div className="hidden md:flex flex-col items-end justify-center text-xs gap-2 opacity-50">
            {/* No buttons needed here for Freelancers */}
            <span className="text-slate-600">GigSecure v1.0</span>
          </div>
        </section>
      </main>
    </div>
  );
}
