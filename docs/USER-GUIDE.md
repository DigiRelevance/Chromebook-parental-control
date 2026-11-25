# Chromebook Parental Control — User Guide

*For the parent, not the developer. If you just want to set up the rules,
this is the only document you need.*

## What you get

- A **console** you open in your own browser, protected by a PIN only you
  know: add each child, set their internet rules, see what they actually use.
- An **enforcing Chrome extension** for each child's Chromebook that blocks
  disallowed browsing before the page loads and shows a friendly lock page
  that says *why*.
- **Usage metering**: the Chromebook counts a minute for every minute a site is
  open in the focused window while the child is active, so daily and per-site
  limits are based on real use.
- **No cloud**: everything lives on your own machine. If the server is off or
  the Chromebook is on another network, it keeps enforcing the last rules it
  knew about, and daily and per-site limits still count down and start afresh
  each midnight. If you want rule changes and usage to keep flowing when the
  Chromebook is away, see [Using SCOUT away from home](#using-scout-away-from-home).

## What you can control

| Control | What it does |
| ------- | ------------ |
| Internet on/off | One switch that blocks every website for that child. |
| Mode | *Everything allowed except blocked sites*, or *Approved sites only*. |
| Allowed hours | Internet only between, say, 08:00 and 20:00, on the days you tick. A window can cross midnight. |
| Off days | Whole days with no web access: weekdays (e.g. every Sunday) or one-off dates (exams, holidays). |
| Daily limit | A total minutes-per-day cap across every site. Blank = no limit. |
| Per-site limits | A minutes cap for one site — e.g. 30 minutes of YouTube, everything else as normal. |
| Blocked sites | Never allowed, whatever else is set. `youtube.com` also covers `m.youtube.com`, `www.youtube.com`, etc. |
| Approved sites | In *Approved sites only* mode, the only sites that open. |

Home-network addresses (your router, printer, this console) always stay
reachable unless the internet switch is off.

## Setup — one time

**On the machine that will host the server** (a Raspberry Pi, a laptop that is
usually on, a NAS with Docker, or the Chromebook itself in Linux mode). Pick
whichever of these you find easier.

### Option A — one line (Raspberry Pi, Ubuntu/Debian, Chromebook Linux)

Open a terminal and paste:

```bash
curl -fsSL https://raw.githubusercontent.com/DigiRelevance/Chromebook-parental-control/main/install.sh | sudo bash
```

Wait a minute or two. At the end it prints:

- the **console address** (something like `http://192.168.1.23:4100`) and a QR
  code you can scan with your phone;
- a one-time **setup code** like `KTRM-XPBD`.

SCOUT now starts by itself whenever the machine boots. Handy commands later:
`sudo chpc status`, `sudo chpc logs`, `sudo chpc update`, `sudo chpc reset-pin`.

### Option B — Docker (NAS, home server)

On Linux, macOS or a NAS shell:

```bash
curl -fsSLO https://raw.githubusercontent.com/DigiRelevance/Chromebook-parental-control/main/docker-compose.yml
docker compose up -d
docker compose logs chpc
```

On Windows, open PowerShell with Docker Desktop running. PowerShell's `curl`
is an alias for `Invoke-WebRequest` and rejects the Linux flags (the error
mentions `fsSLO`), so download the file this way:

```powershell
Invoke-WebRequest https://raw.githubusercontent.com/DigiRelevance/Chromebook-parental-control/main/docker-compose.yml -OutFile docker-compose.yml
docker compose up -d
docker compose logs chpc
```

The log shows the **setup code**. The console is at `http://<that machine>:4100`.
(Many NAS apps, such as Portainer or Container Manager, let you paste the
compose file into a form instead of typing commands.)

### Option C — Node by hand

```bash
git clone <your-repo-url> chpc && cd chpc
npm install && npm run build
HOST=0.0.0.0 CHPC_PUBLIC_DIR=web/dist npm start
```

The terminal prints the setup code.

### Then: choose your PIN

Open the console address in a browser. The first screen asks for the **setup
code** and a **PIN** of your choosing (6+ characters; `123456` and the like are
refused), and asks you to tick a box accepting the licence and disclaimer
(the README's [Disclaimer](../README.md#disclaimer) section: use SCOUT only on
devices you are entitled to supervise, it comes without warranty, and it
supports supervision rather than replacing it). The code works once; after
that the PIN is the only key.

> **Choosing a PIN.** Anyone with the PIN can change every rule — it is the key to
> the whole system. You can change it later in **Settings**. Lost it? On the
> server run `sudo chpc reset-pin` (or `docker compose exec chpc node
> server/src/cli.js reset-pin` then `docker compose restart`) to get a fresh
> setup code.

## Unlocking the console

Open the console address. Enter the PIN. Tick **Remember on this device** only
on your own phone or laptop, never on a shared or child device. The **Lock**
button in the top bar forgets the PIN again. After ten wrong attempts from one
device the console locks that device out for 15 minutes.

## Adding a child and their rules

1. Type the child's name in **New child name…** and click **Add child**.
2. You land on their page with three tabs: **Policy · Devices · Usage**.
3. On **Policy**:
   - leave **Internet is allowed** on (turn it off for an instant "everything off");
   - pick the **Mode**;
   - set a **Daily minutes limit** if you want one;
   - tick **Off days** and/or add one-off dates;
   - tick **Restrict internet to these hours** and set the times and days;
   - add **Blocked sites** and **Per-site time limits** (type the site, press Enter or Add);
   - click **Save policy**. A yellow *unsaved changes* pill reminds you if you
     forget.
4. Changes reach the child's Chromebook within a minute.

## Pairing the child's Chromebook (one time per device)

1. In the console, open the child → **Devices** → give the device a name →
   **Generate code**. You get an 8-letter code like `KTRM-XPBD` and the console
   address to type in. The code is that Chromebook's key: whoever has it can
   read the child's rules and report usage as that device. Revoke it from the
   same tab if it leaks.
2. Once, in the **Family Link** app or site: *Controls → Google Chrome and
   Web → Advanced settings* and make sure *Permissions for sites, apps and
   extensions* is set so the child can ask you to approve installations.
3. On the Chromebook, signed in as the child, open the SCOUT listing on the
   Chrome Web Store: `https://chromewebstore.google.com/detail/scout/<extension-id>` (the link is added here after the first
   store approval) and click **Add to Chrome**. Family Link asks for a parent:
   choose **Ask in person**, enter your Google password, and the extension
   installs. A pairing screen opens by itself.
4. On that screen enter the **console address** (`http://SERVER-IP:4100`) and
   the **pairing code**, click **Pair & connect**. It should say *Paired* and
   show the child's name. Pin the *SCOUT* icon (puzzle-piece menu → pin) so the
   child can see the current rules.
5. Back in the console, the Devices tab shows *last seen just now* within a
   minute. Type a site into **Test a decision** to see what the Chromebook will
   do with it right now.

Why the store and not "Load unpacked"? A Family Link supervised account cannot
use Developer mode: ChromeOS blocks it by policy, the parent has no switch to
allow it, and turning supervision off and on again wipes anything sideloaded in
between (and for under-13s supervision cannot be switched off at all). The
`extension/` folder in the repository is for developers testing on an
unsupervised profile.

### Important: what the extension cannot stop

Family Link approves the installation, but consumer Family Link cannot
force-install an extension or stop a child switching it off or removing it in
`chrome://extensions`. Only a managed Chromebook (a school, or your own Google
Workspace with Chrome management) can do that. So:

- the console marks a Chromebook **not reporting** when it has not checked in
  for 30 minutes (home screen pill and the Devices tab). A Chromebook that is
  switched off or offline looks the same, so treat it as a prompt to look, not
  proof of tampering; if the device is on and online, the extension was
  disabled or removed: reinstall it from the store with your approval and
  pair again;
- do **not** give the child the owner account of the Chromebook;
- say plainly to the child that the rules are there and that removing the
  extension is visible.

Unpairing from inside the popup requires the guardian PIN, and only works while
the console is reachable, so the child cannot quietly opt out that way.

## Using SCOUT away from home

A Chromebook does not stay in the house. There are two ways to run SCOUT, and
you can move from the first to the second later.

### Option 1 — server at home (the default)

Nothing extra to set up. When the Chromebook is on another network (school,
grandparents, a holiday):

- **the rules still apply**: blocked sites, approved sites, allowed hours and
  off days all carry on from the last rules the Chromebook received;
- **time limits still work**: the Chromebook counts minutes itself, and the
  daily limit and per-site limits start afresh at midnight each day, exactly
  as they do at home;
- **changes you make do not arrive** until the Chromebook is back on the home
  network, and the console shows it as **not reporting** in the meantime;
- **usage catches up afterwards**: when it reconnects, the minutes from each
  day away appear in the Usage tab under the day they happened (up to 31 days
  back). They do not count against the limit for the day it comes home.

### Option 2 — server reachable from anywhere

If you want rule changes to arrive within a minute wherever the Chromebook is,
and usage to report as it happens, run the server where the Chromebook can
always reach it: a small cloud server (a few pounds a month), with a web
address of your own and HTTPS.

**What changes, honestly.** The console is then on the internet, not just your
home network. Your family's rules and usage still sit only on a server you
control, and nobody else receives them, but the guardian PIN becomes the only
thing between the internet and your console. Use a long PIN that you use
nowhere else. After ten wrong attempts from one address SCOUT locks that
address out for 15 minutes.

**Setup.**

1. Rent the smallest Ubuntu server from any provider and note its IP address.
2. Where your domain's DNS is managed, add an **A record** for a name such as
   `scout.example.com` pointing at that IP address.
3. Log in to the server and install Docker:

   ```bash
   curl -fsSL https://get.docker.com | sh
   ```

4. Create a folder and a file called `docker-compose.yml` in it with the
   following, replacing `scout.example.com` with your own name. The second
   service, Caddy, provides HTTPS and fetches its certificate automatically.

   ```yaml
   services:
     chpc:
       image: ghcr.io/digirelevance/chromebook-parental-control:latest
       environment:
         CHPC_TRUST_PROXY: "1"
       volumes:
         - chpc-data:/data
       restart: unless-stopped

     caddy:
       image: caddy:2
       command: caddy reverse-proxy --from scout.example.com --to chpc:4100
       ports:
         - "80:80"
         - "443:443"
       volumes:
         - caddy-data:/data
       restart: unless-stopped

   volumes:
     chpc-data:
     caddy-data:
   ```

5. Start it and read the setup code:

   ```bash
   docker compose up -d
   ```

   ```bash
   docker compose logs chpc
   ```

6. Open `https://scout.example.com`, enter the setup code and choose your PIN.
   Add your children and rules as usual.
7. Pair each Chromebook using `https://scout.example.com` as the console
   address. A Chromebook that was paired with a home address must be unpaired
   and paired again with the new one.

**Rules for remote hosting.**

- Always `https://`. Never open port 4100 to the internet directly: the PIN
  would travel unprotected.
- Keep `CHPC_TRUST_PROXY: "1"` as shown, so lockouts apply to the real visitor
  and not to the proxy.
- Keep the server updated: `docker compose pull && docker compose up -d`.
- Moving an existing home installation? Copy the database file across before
  first start, or simply set the rules up again.

Already have a machine at home and prefer not to rent one? A tunnel or reverse
proxy that gives the home server an HTTPS address works the same way; the
Chromebook only needs an `https://` address it can reach from any network.

## Day to day

| Want to… | Do this |
| -------- | ------- |
| See what a child used today | Child → **Usage**: minutes used, top sites, 7-day bars. |
| Switch the internet off right now | Child → **Policy** → untick **Internet is allowed** → Save. |
| Give one extra hour tonight | Widen the **Allowed hours** or raise the **Daily minutes limit**, Save. Undo tomorrow. |
| Block a site for good | **Blocked sites** → type it → Add → Save. |
| Let only school sites work | Mode → **Approved sites only**, add the sites, Save. |
| Check what the Chromebook would do with a site | **Devices** → **Test a decision**. |
| Unpair a Chromebook | **Devices** → **Unpair** next to it. It stops being managed within a minute. |
| Rename a child | Click the name at the top of their page. |
| Remove a child | Dashboard → × next to the name. Their rules, devices and usage are deleted. |
| Change the time zone the rules run in | **Settings** (top right). |
| Change the PIN | **Settings** → Guardian PIN. Every browser and every Chromebook popup will ask for the new one. |
| Forgot the PIN | On the server: `sudo chpc reset-pin` (Docker: see Setup). It prints a new setup code. |
| Update SCOUT | `sudo chpc update` (Docker: `docker compose pull && docker compose up -d`). Rules and data are kept. |

## What the lock page says

When a page is blocked the child sees a lock page naming the site and one of:

- *Internet is switched off*
- *Today is an off day*
- *Outside allowed hours*
- *Daily time is used up*
- *This site is blocked*
- *Time limit for this site reached*
- *Site not on the approved list*
- *Console unreachable* (the Chromebook has never received rules and cannot
  reach the console — everything except the home network is locked until it can)

## Troubleshooting

| Symptom | First thing to check |
| ------- | -------------------- |
| Console shows *server offline* | Is the server running? Same Wi-Fi? Right IP and port 4100? |
| Console shows "set up your PIN" again | The PIN was reset, or the database was moved. Use the setup code from `sudo chpc status` / the server log. |
| Lost the setup code | `sudo chpc status` shows it while setup is pending; or restart the server for a fresh one. |
| A device shows **not reporting** | The Chromebook has not checked in for 30 minutes. If it is on and online, open `chrome://extensions` on it: SCOUT has been switched off or removed. Reinstall from the Chrome Web Store (parent approval), pair again. |
| "Add to Chrome" is greyed out or the child cannot ask for approval | In Family Link: *Controls → Google Chrome and Web → Advanced settings → Permissions for sites, apps and extensions*. |
| Popup says the code is not recognised | Codes are letters only, no digits — retype it, or revoke and generate a new one. Check the console address (include `http://`). |
| Child can browse but no limits apply | Devices tab: is *last seen* recent? If not, the extension is off, unpaired or cannot reach the server. Reload it from `chrome://extensions`. |
| Usage stays at 0 | Minutes are only counted while the child is active in a focused Chrome window. If it stays at 0 while they browse, see the previous row. |
| A site I blocked still opens | Match is by site name: `bbc.co.uk` blocks `www.bbc.co.uk` and `news.bbc.co.uk`, but not `bbc.com`. Add each. |
| Rules changed but the Chromebook still acts on old ones | It refreshes every minute. The popup's **Refresh now** forces it. |
| Wrong day boundary / off day starts at the wrong time | Check the time zone in **Settings**. |
| Chromebook was away and its usage looks missing | It reports when it next reaches the console; each day away then appears under its own date. Days more than 31 days old are not recorded. |
| Rule changes do not reach a Chromebook that is away from home | Expected with the server at home. See [Using SCOUT away from home](#using-scout-away-from-home). |
| Locked out after too many PIN attempts | Wait 15 minutes, or restart the server. |
| Using a normal laptop instead of a Chromebook | Works the same: install Chrome, load the same `extension/` folder unpacked. |

## Privacy

- Rules, children, devices and usage live in **one SQLite file** on your
  machine (`/var/lib/chpc/chpc.db` with the installer, the `/data` volume in Docker). Back it up if you
  care about the rules; deleting it is a full reset.
- Your PIN is stored only as a salted hash; nobody can read it back.
- Only the **site name** (hostname) of what the child visits is recorded —
  never full page addresses, searches or page content.
- Usage older than **90 days** is deleted automatically
  (`CHPC_RETENTION_DAYS` changes this).
- Nothing goes to anyone else: no accounts, no telemetry, no third-party
  cloud. With the server at home, nothing leaves your home network. If you
  choose to host it remotely, the same data travels over HTTPS to that server
  of yours and nowhere else.
- Deleting a child deletes everything about them immediately.
- The full statement is [PRIVACY.md](../PRIVACY.md) in the repository; it is
  also the privacy policy linked from the Chrome Web Store listing.

## Files worth knowing

| Path | What it is |
| ---- | ---------- |
| `/var/lib/chpc/chpc.db` | Your data (one-line installer). Docker: the `chpc-data` volume. By hand: `data/chpc.db`. |
| `/etc/chpc/chpc.env` | Service settings (one-line installer). |
| `extension/` | The folder to load on each Chromebook. |
| `docs/SECURITY-REPORT.md` | What was reviewed, what was fixed, what remains. |
| `docs/HLD.md`, `docs/LLD.md` | Design documents, if a developer helps you. |
