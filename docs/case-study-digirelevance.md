# SCOUT case study — draft for digirelevance.com

*Draft 2. Copy for a new case study under Writing, with a card on the Automation & Data
index. Not yet published. Open points for Nick are listed at the end.*

---

## Page copy

**Eyebrow:** Case study · Family technology

**H1:** When "allowed" and "blocked" are not enough

**Standfirst:** I banned Roblox at home more than 18 months ago. My kids found
other ways to play within weeks. Most parental controls limit total time and
block sites; SCOUT adds the control I was missing, a time limit on an
individual site, and works alongside Google Family Link on the family
Chromebook.

**Meta bar:**
Sector: Family / consumer · Platform: Chrome and ChromeOS · Works with: Google Family Link ·
Stack: Chrome extension (Manifest V3), Node.js, SQLite, React · Hosting: self-hosted at home

---

### Where it started

Roblox has been off our family's devices for over 18 months. The reasons are
set out in [AI, children and the business of games](ARTICLE-URL): who children
meet on these platforms, and how they are sold to.

Removing it did not end the matter. Kids aren't stupid. With the app gone, they
went to the browser, where games sites offer a vast array of games behind a
single web address. Each one I blocked was replaced by another. It is a
minefield and a constantly moving target.

That is also why the answer had to live in Chrome. Family Link can remove an
app. The workarounds were websites.

We talk to our children about online safety and about why some content is not
suitable for their age. That matters, and it is not enough by itself. The
mechanics of some of these games and sites are built to hold attention, and I
could see it in their behaviour: the countdown to screen time starting hours
ahead, the restlessness until the devices unlocked and, once they were playing,
a point where reason no longer reached them.

Timers and block lists were the only tools I had, and neither fitted the
problem.

### The gap in the usual controls

Parental controls are built around two questions: how long can the device be
used, and which sites are allowed. Google Family Link answers both well on a
Chromebook, and it remains the foundation of what we use.

The difficulty is the growing number of sites that are neither good nor bad. A
single games site gives a child a vast array of games behind one web address.
A video site holds the revision clip a teacher recommended and hours of
everything else. Block it and you remove something that is fine in moderation.
Allow it and the whole day's screen time goes into it.

What I wanted was a third answer: *yes, but not for long*.

### What I needed

- A time limit on a specific site, separate from the overall daily allowance.
- A clear view of where the time is actually going, so a new site is noticed
  when it first appears and not weeks later.
- Rule changes that take effect in minutes, without touching the child's device.
- No replacement for Family Link. It already handles the account, the device
  and app approvals; the new tool should fill the gap and nothing more.
- My family's browsing data kept inside the house.

### What I built

SCOUT is a small Chrome extension on the child's Chromebook, paired with a
console the parent opens in their own browser. The parent sets the rules; the
extension enforces them inside Chrome and reports back what was used.

**How it runs, every minute, without anyone doing anything:**

1. The extension counts a minute against a site for each minute it is open in
   the focused window while the child is actually active. An idle Chromebook
   does not use up the allowance.
2. It collects the latest rules from the parent's console and sends the usage
   it has counted.
3. It rebuilds the blocking rules Chrome applies, so a limit that has just been
   reached, or allowed hours that have just ended, take effect at once.
4. When a page is stopped, the child sees a calm lock page that names the site
   and gives the reason, for example *Time limit for this site reached*.

**The controls a parent has, per child:**

- **Per-site time limits.** Thirty minutes a day on a games site, with
  everything else as normal. The limit covers the site's sub-addresses too.
- **Daily limit** across all browsing.
- **Allowed hours** by day of the week, and whole **off days** for exams or
  holidays.
- **Blocked sites**, which always win, and an **approved sites only** mode for
  homework time.
- **One switch** to turn the internet off straight away.

### Keeping up with a moving target

The per-site limit is half of the answer. The other half is the usage view.
For each child the console shows minutes used today, the sites those minutes
went to, and the last seven days. I do not need to know about a new games site
in advance; it shows up in the list by name, with the time spent on it.

From there I have a choice the usual controls do not offer. I can block the
site, or decide it is fine for twenty minutes a day and cap it. The change
reaches the Chromebook within a minute. A *Test a decision* box in the console
shows what the Chromebook would do with any site at that moment, so a rule can
be checked before it is relied on.

The lock page matters as much as the limit. It tells the child which rule
applied and why, which fits how we try to handle this at home: the rules are
explained, not hidden.

### Working with Family Link, not around it

SCOUT is installed from the Chrome Web Store on the child's supervised account,
and Family Link asks the parent to approve it, as it would any extension. Family
Link carries on managing the account, the device and its apps. SCOUT adds the
finer control inside Chrome.

### Private by design

There is no SCOUT cloud service. The console runs on a machine the family
already owns: a Raspberry Pi, a spare laptop, a home storage box. It records
the site name and the minutes, never full page addresses, searches or page
content, and deletes usage after 90 days by default. If the home server is
switched off, the Chromebook keeps applying the last rules it received.

### Honest about the limits

No parental control is complete, and this one says so plainly.

- SCOUT covers browsing in Chrome. Android apps, Linux apps and other browsers
  remain Family Link's job.
- Limits apply to a site as a whole, by its address. SCOUT does not inspect
  what is on a page.
- On a home (non-school) Chromebook, a child can switch off or remove an
  extension. SCOUT cannot prevent that, so it makes it visible: the console
  marks a Chromebook as *not reporting* once it has been silent for 30 minutes.

It is a tool that supports supervision and the conversations that go with it.
It does not replace either.

### How it was built

SCOUT is open source under the MIT licence. Every change runs through an
automated pipeline before it is accepted: 122 tests, including a dedicated
security suite that tries to bypass the PIN, leak one child's data to another
and break the rule engine, plus dependency and code scanning. The rule engine
is written to fail closed: if something is wrong with the rules, the answer is
"blocked", not "allowed".

**CTA heading:** Have a problem the off-the-shelf tools almost solve?

**CTA text:** SCOUT started as a gap between two settings. If your business has
a process that existing software handles nearly, but not quite, we can help
close it.

**Button:** Talk to us

---

## Index card (Automation & Data page)

- **Category / sector:** Family technology
- **Title:** SCOUT parental control
- **Subtitle:** Per-site time limits for the family Chromebook
- **Description:** Most parental controls limit total time and block sites.
  SCOUT adds the control in between: a daily time limit on an individual site,
  such as a games site, working alongside Google Family Link.
- **Tags:** Chrome extension · Family Link · Self-hosted · Open source

---

## Open points before publishing

1. **Article link.** `ARTICLE-URL` in "Where it started" needs the published
   address of *AI, children and the business of games*.
2. **"Within weeks" in the standfirst.** You said they found workarounds
   "quickly"; "within weeks" is my wording. Change it if it overstates.
3. **Results.** No outcome figures are included because none were supplied. If
   you can say what changed at home since SCOUT went in (for example, time on
   games sites, or how the run-up to screen time now goes), it belongs at the
   end of "Keeping up with a moving target".
4. **Chrome Web Store status.** The draft says SCOUT is installed from the
   Chrome Web Store. The user guide still shows the store link as pending first
   approval. Confirm the listing is live before publishing, or soften the line.
5. **Family Link comparison.** The draft says Family Link handles overall time
   and site blocking but not a time limit on an individual website. Please
   confirm this still matches what you see in Family Link today.
6. **CTA and category.** The button wording, link target and the new "Family
   technology" filter pill are suggestions; match them to the other case
   studies.
