import Link from "next/link";
import { auth } from "@/auth";
import { ArrowRight, Calendar, Clock, AlarmClock, Zap, Brain } from "lucide-react";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session?.user;
  
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calendar className="h-8 w-8" />
            <span className="text-2xl font-bold">QuickCal</span>
          </div>
          <nav>
            {isAuthenticated ? (
              <Link href="/dashboard" className="brutalist-button">
                Dashboard
              </Link>
            ) : (
              <Link href="/login" className="brutalist-button">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      
      <main className="flex-grow">
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="brutalist-box max-w-4xl mx-auto">
            <h1 className="heading-xl mb-6">
              QuickCal: Because Your Calendar Needed an <span className="brutalist-highlight">Attitude Adjustment</span>
            </h1>
            <p className="text-lead mb-8">
              Oh great, <em>another</em> calendar app. But wait! This one&apos;s got AI, sarcasm, and
              absolutely zero sympathy for your poor time management skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {isAuthenticated ? (
                <Link href="/dashboard" className="brutalist-purple brutalist-button inline-flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <Link href="/login" className="brutalist-purple brutalist-button inline-flex items-center gap-2">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <Link href="#features" className="brutalist-button inline-flex items-center gap-2">
                Learn More <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
        
        <section id="features" className="py-16 container mx-auto px-4">
          <h2 className="heading-lg text-center mb-12">Features That Will Change Your Life&#8482;</h2>
          
          <div className="brutalist-grid">
            <div className="brutalist-card">
              <Clock className="h-10 w-10 mb-4" />
              <h3 className="heading-sm mb-3">Smart Scheduling</h3>
              <p className="mb-3">AI-powered scheduling that&apos;s probably just as confused as you are about your availability.</p>
              <p className="text-sm italic">&quot;It scheduled my therapy right after my ex&apos;s wedding. How thoughtful!&quot; - A User</p>
            </div>
            
            <div className="brutalist-card">
              <Brain className="h-10 w-10 mb-4" />
              <h3 className="heading-sm mb-3">Meeting Insights</h3>
              <p className="mb-3">Get AI summaries of your meetings that include what was actually said and what everyone was really thinking.</p>
              <p className="text-sm italic">&quot;Now I know who&apos;s secretly plotting my downfall!&quot; - Paranoid Manager</p>
            </div>
            
            <div className="brutalist-card">
              <AlarmClock className="h-10 w-10 mb-4" />
              <h3 className="heading-sm mb-3">Brutal Reminders</h3>
              <p className="mb-3">Get reminders that don&apos;t sugarcoat how late you are or how unprepared you&apos;ll be.</p>
              <p className="text-sm italic">&quot;It called me a &apos;perpetually tardy disaster&apos; and I&apos;ve never been on time since.&quot; - Chronically Late Person</p>
            </div>
            
            <div className="brutalist-card">
              <Zap className="h-10 w-10 mb-4" />
              <h3 className="heading-sm mb-3">Multi-Calendar Syncing</h3>
              <p className="mb-3">Connect all your Google Calendars so you can disappoint people across multiple platforms simultaneously.</p>
              <p className="text-sm italic">&quot;Now everyone knows I&apos;m avoiding them equally!&quot; - Professional Hermit</p>
            </div>
          </div>
        </section>
        
        <section className="py-16 container mx-auto px-4">
          <div className="brutalist-yellow max-w-2xl mx-auto p-8 text-center">
            <h2 className="heading-md mb-6">Ready to have your calendar judge you?</h2>
            <p className="text-lead mb-6">Join thousands of other masochists who apparently enjoy being sassed by their scheduling software.</p>
            <Link href="/login" className="brutalist-button">
              Start Your Free Trial*
            </Link>
            <p className="text-xs mt-4 italic">*Free as in &quot;we&apos;ll judge you for free, forever&quot;</p>
          </div>
        </section>
        
        <section className="py-16 container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-md text-center mb-8">How QuickCal Works</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2 brutalist-box bg-[#F3F4F6]">
                  <div className="font-mono text-sm">
                    <div className="mb-4 bg-black text-white p-2">calendar_judgment.ai</div>
                    <pre className="p-4 overflow-x-auto">
{`function analyzeSchedule(events) {
  if (events.length === 0) {
    return "Wow, your calendar is emptier than your social life.";
  }
  
  if (tooManyMeetings(events)) {
    return "Have you considered therapy for your meeting addiction?";
  }
  
  return "You&apos;ve achieved mediocre calendar management. Congrats?";
}`}
                    </pre>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="heading-sm mb-3">1. Connect Your Calendar</h3>
                  <p>
                    Sign in with Google and connect as many calendars as you want. Our AI will scan your events and immediately form judgmental opinions about your life choices.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row-reverse gap-8 items-center">
                <div className="w-full md:w-1/2 brutalist-box bg-[#F3F4F6]">
                  <div className="flex flex-col space-y-3 p-2">
                    <div className="calendar-event bg-white">
                      <div className="flex justify-between">
                        <div><span className="font-bold">Weekly Team Meeting</span></div>
                        <div className="text-xs">9:00 - 10:00 AM</div>
                      </div>
                      <div className="text-xs italic mt-1 text-red-600">
                        AI NOTE: This could&apos;ve been an email.
                      </div>
                    </div>
                    <div className="calendar-event bg-white">
                      <div className="flex justify-between">
                        <div><span className="font-bold">Lunch with Craig</span></div>
                        <div className="text-xs">12:00 - 1:30 PM</div>
                      </div>
                      <div className="text-xs italic mt-1 text-red-600">
                        AI NOTE: Craig always talks about CrossFit. Prepare to be bored.
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="heading-sm mb-3">2. Receive Brutal Insights</h3>
                  <p>
                    Our AI analyzes your meetings and adds snarky comments directly to your events. It&apos;s like having a personal assistant who secretly hates you.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-full md:w-1/2 brutalist-box bg-white">
                  <div className="task-item mb-0">
                    <div className="flex items-start gap-2">
                      <input type="checkbox" className="mt-1" />
                      <div>
                        <p className="font-bold">Prepare Q4 Report</p>
                        <p className="text-xs">Extracted from meeting &quot;Q4 Planning&quot;</p>
                        <p className="text-xs italic text-red-600 mt-1">AI NOTE: You&apos;ll probably procrastinate on this until the day before.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2">
                  <h3 className="heading-sm mb-3">3. Task Extraction &amp; Management</h3>
                  <p>
                    QuickCal automatically extracts action items from your meetings and adds pessimistic predictions about your likelihood of completing them.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-16 container mx-auto px-4 bg-[#F3F4F6]">
          <div className="max-w-4xl mx-auto">
            <h2 className="heading-md text-center mb-12">Frequently Asked Questions</h2>
            <div className="space-y-6">
              <div className="brutalist-box">
                <h3 className="heading-sm mb-2">Is my calendar data secure?</h3>
                <p>As secure as your life choices. But yes, we use industry-standard encryption and definitely don&apos;t sell your data to calendar enthusiasts on the dark web.</p>
              </div>
              
              <div className="brutalist-box">
                <h3 className="heading-sm mb-2">Can I turn off the sarcastic AI?</h3>
                <p>You could, but then what&apos;s the point? You might as well go back to your boring regular calendar app that doesn&apos;t judge you.</p>
              </div>
              
              <div className="brutalist-box">
                <h3 className="heading-sm mb-2">Does QuickCal work with other calendar platforms?</h3>
                <p>Currently we only support Google Calendar because, let&apos;s be honest, who uses anything else? We might add support for Outlook if enough people beg.</p>
              </div>
              
              <div className="brutalist-box">
                <h3 className="heading-sm mb-2">Is QuickCal really free?</h3>
                <p>Yes, it&apos;s free. We make money by selling your calendar data to time travelers from the future. (Just kidding. Or are we?)</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t-2 border-black py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              <span className="text-xl font-bold">QuickCal</span>
            </div>
            <div className="text-center md:text-right">
              <p className="mb-2">Built with questionable decisions and excessive caffeine.</p>
              <p className="text-sm italic">©2025 QuickCal • No calendars were harmed in the making of this app</p>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-gray-200 text-center">
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/terms" className="hover:underline">Terms of Service</Link>
              <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
              <Link href="/help" className="hover:underline">Help Center</Link>
              <Link href="/contact" className="hover:underline">Contact</Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              QuickCal is not responsible for hurt feelings, missed meetings, or existential crises resulting from our AI&apos;s brutal honesty.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}