# SCOUT case study — draft for digirelevance.com

*Draft copy for a new case study under Writing, with a card on the Automation & Data
index. Not yet published. Open points for Nick are listed at the end.*

---

## Page copy

**Eyebrow:** Case study · Family technology

**H1:** When "allowed" and "blocked" are not enough

**Standfirst:** Most parental controls answer two questions: how long, and which
sites. Children have found the gap between them. SCOUT adds the missing control,
a time limit on an individual site, and runs alongside Google Family Link on the
family Chromebook.

**Meta bar:**
Sector: Family / consumer · Platform: Chrome and ChromeOS · Works with: Google Family Link ·
Stack: Chrome extension (Manifest V3), Node.js, SQLite, React · Hosting: self-hosted at home

---

### The problem: one site, a thousand games

Parental controls were designed around a simple model. A site is either
acceptable or it is not, and the device is either within its screen-time
allowance or it is not. Google Family Link does both of those jobs well on a
Chromebook, and it remains the foundation here.

The trouble is the growing number of sites that are neither good nor bad. A
single games portal gives a child access to thousands of games behind one web
address. A video site holds both the revision clip the teacher recommended and
six hours of everything else. Block the site and you remove something that is
fine in moderation, and sometimes something school actually uses. Allow it and
the whole of the day's screen time goes into it.

Children are also quicker than the block list. When one games site is blocked,
another appears in the playground conversation by the end of the week. A parent
maintaining a list of banned addresses is always one step behind.

What parents are really asking for is a third answer: *yes, but not for long*.

### What was needed

- A time limit on a specific site, separate from the overall daily allowance.
- A clear view of where the time is actually going, so a new site is noticed
  when it first appears and not weeks later.
- Rule changes that take effect in minutes, without touching the child's device.
- No replacement for Family Link. It already handles the account, the device
  and app approvals; the new tool should fill the gap and nothing more.
- The family's browsing data kept inside the home.

### The solution

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

- **Per-site time limits.** Thirty minutes a day on the games portal, with
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
went to, and the last seven days. A new games site does not need to be known
about in advance; it shows up in the list by name with the time spent on it.

From there the parent has a choice that the usual controls do not offer. They
can block it, or they can decide it is fine for twenty minutes and cap it. The
change reaches the Chromebook within a minute. A *Test a decision* box in the
console shows what the Chromebook would do with any site at that moment, so the
rule can be checked before the child finds out the hard way.

This turns an argument about a banned site into a conversation about a fair
amount of time, which is an easier conversation to have.

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

It is a tool that supports supervision. It does not replace it.

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
  such as a games portal, working alongside Google Family Link.
- **Tags:** Chrome extension · Family Link · Self-hosted · Open source

---

## Open points before publishing

1. **No outcome figures or quotes are included**, because none were supplied.
   Two places would benefit from real ones: a short quote from a parent after
   the "Keeping up with a moving target" section, and a before/after figure
   (for example, time on games sites per day) in the same section.
2. **Origin story.** The draft describes the problem in general terms. If SCOUT
   was built for your own household, a first-person opening paragraph saying so
   would be stronger. I have not written one because I do not know the details.
3. **Chrome Web Store status.** The draft says SCOUT is installed from the
   Chrome Web Store. The user guide still shows the store link as pending first
   approval. Confirm the listing is live before publishing, or soften the line.
4. **Family Link comparison.** The draft says Family Link handles overall time
   and site blocking but not a time limit on an individual website. Please
   confirm this still matches what you see in Family Link today.
5. **CTA.** The button wording and link target are my suggestion; match them to
   the other case studies.
6. **Category.** "Family technology" would be a new filter pill on the index.
