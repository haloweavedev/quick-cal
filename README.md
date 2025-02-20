# 🗓️ QuickCal – The Calendar With Attitude™  

Sure, there are plenty of calendar apps out there. But do they come with **sarcasm** and **zero empathy for your overbooked schedule**? QuickCal is here to judge your life choices and help you (sort of) stay organized at the same time.  

---

## 🚀 Features That Might Improve Your Life (or Judge It)  

### 📆 Multi-Google-Calendar Support  
Why juggle multiple calendars when you can let QuickCal do the juggling and remind you how much your life is spiraling out of control?  

### 🎤 Snarky Meeting Insights  
Watch our AI analyze your meetings and provide *delightfully blunt* commentary—like telling you that your "Weekly Sync" should probably have been an email.  

### ✅ Task Extraction  
We use some fancy AI magic to dig out action items from your meeting transcripts so you don't have to. Bonus: we'll remind you that you're probably going to procrastinate anyway.  

### 🎨 Fun, Brutalist UI  
Because there's nothing like bold lines, bright colors, and unapologetic drop shadows to highlight the emptiness (or over-crowdedness) of your calendar.  

### 🔑 Primary vs. Secondary Account Management  
- **Primary Account**: The main calendar you connect. The one that you actually want to keep somewhat sane.  
- **Secondary Accounts**: Those "extra" Google calendars that you swear you'll reference but will only check once a month.  

### 🎙️ (Optional) Deepgram Nova Integration  
Coming soon(ish)! Let our soon-to-be-implemented meeting bot eavesdrop on your calls, produce transcripts, and judge you in real-time. Just kidding—no real-time scolding… yet.  

---

## 🤔 Why Would You Use QuickCal?  
✅ **One-Stop Calendar Consolidation** – No more flitting between multiple tabs—just one place to see your entire chaotic life.  
✅ **AI-Driven Real Talk** – QuickCal will blatantly tell you if you're overbooked or if that recurring "catch-up" is just code for "time sink."  
✅ **Productive(ish) Task Handling** – Turn your meeting transcripts into tasks. Maybe you'll complete them, maybe not—but hey, at least the tasks exist now.  

---

## 🛠️ Tech Stack  

1. **⚡ Next.js 15+** – Because we thrive on the bleeding edge, ignoring the occasional papercut from "beta" features.  
2. **🎨 TailwindCSS** – So we can quickly style your calendar to match our *neo-brutalist* vibe.  
3. **📊 Prisma + PostgreSQL** – A fancy ORM + DB combo storing your data (and unsubtle remarks).  
4. **🔐 NextAuth.js** – We let you sign in with Google so QuickCal can sync your events and *definitely not* judge your private life.  
5. **🎙️ (Planned) Deepgram Nova** – For transcribing your meetings. You talk, we store, we dissect, we deliver tasks and pithy commentary.  

---

## 🏗️ Getting Started  

### 1️⃣ Clone This Repo  
```bash
git clone https://github.com/haloweavedev/quick-cal.git
cd quickcal
```

### 2️⃣ Install Dependencies  
```bash
npm install
```

### 3️⃣ Configure Env  
- Update your `.env` with your Google OAuth client secrets and DB credentials.  
- Cross fingers that you didn't forget a semicolon.  

### 4️⃣ Run the Development Server  
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to admire your near-future meltdown schedule.  

---

## 🚀 Deployment  

- We like **Vercel**. It's easy, integrated with Next.js, and it'll let you ship your sarcasm to production in style.  
- Or host anywhere that supports Node.js if you want to complicate your life.  

---

## 🔮 What's Next?  

🔹 **Deepgram Bot** – A "meeting bot" that joins your calls, generates transcripts, and highlights who's ignoring your weekly stand-up.  
🔹 **AI Summaries** – Let the AI give you a comedic summary of what everyone was *really* thinking.  
🔹 **Task Nudges** – Got tasks piling up? QuickCal will "nudge" you at 2 AM with a friendly reminder—just in time to ruin a perfectly good night's sleep.  

---

## 🤝 Contributing  

1. **Fork, Pull Request, Wait for Sarcastic Feedback** – We'll check out your code and throw in a witty remark or two.  
2. **Feature Ideas?** – If you want more judgmental features (maybe an end-of-week "life choices" review?), open an issue. We're happy to consider new ways of mocking time management.  

---

## 📜 License  

[MIT](./LICENSE). We're basically saying **"do whatever you want"**, but if you break it, you blame yourself. QuickCal is not responsible for any existential crises resulting from glimpsing your jam-packed schedule in one place.  

---

**Thanks for checking out QuickCal!** 🎉  
May your to-do lists be short, your transcripts be enlightening, and your sense of humor remain intact as you navigate the wild, often comedic world of scheduling!