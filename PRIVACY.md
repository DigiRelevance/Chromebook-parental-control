# SCOUT privacy policy

*Effective 25 November 2026. Applies to the SCOUT Chrome extension and the
SCOUT console and server published at
<https://github.com/DigiRelevance/Chromebook-parental-control>.*

**In one paragraph.** SCOUT is self-hosted. The extension on a child's
Chromebook talks to exactly one place: the server address a parent typed in
when pairing, which is a computer the parent runs, normally at home. It sends the site
names the child visits and the minutes spent on them, and it receives the
rules the parent set. The people who publish SCOUT run no servers, receive no
data and cannot see any family's rules or usage. There are no accounts, no
analytics, no advertising and no third-party services.

## Who is responsible for the data

The parent or guardian who installs and runs SCOUT decides what is collected,
how long it is kept and who can see it. In data-protection terms they are the
controller. The SCOUT maintainers provide software only; they have no access to
any installation and are not a processor of its data.

## What the extension processes

| Data | Where it goes | Why | Kept for |
| --- | --- | --- | --- |
| The **site name** (hostname, such as `youtube.com`) of the active tab, and the **minutes** spent on it, counted once a minute only while the browser window is focused and the child is active | The parent's own server | Daily limits, per-site time budgets and the usage view in the parent console | On the server: 90 days by default, then deleted automatically (the parent can change this). On the Chromebook: until the next successful send; minutes that could not be sent are dropped after 31 days |
| The **address of each navigation** | Nowhere. It is matched inside Chrome against the current rules by Chrome's own blocking mechanism (declarativeNetRequest) | To allow, block or redirect to the lock page | Not stored |
| **Pairing details**: the console address, the pairing code, the child's first name as the parent entered it, the current rules, the time zone, sync status, and the last blocked site name with its reason | Chrome's local extension storage on that Chromebook only | To apply the rules, show the popup and explain a block on the lock page | Until the extension is unpaired or removed |
| A **"last seen"** timestamp | The parent's own server | So the parent can see the device is connected | Until the device is unpaired |

The extension never collects full page addresses, page content, search
terms, keystrokes, passwords, messages, form entries, downloads, location,
camera or microphone input, cookies, or any account identifier such as an
email address or Google account. It does not know who the child is beyond the
first name the parent chose to type into their own console.

## Why it asks for each permission

| Permission | Used for |
| --- | --- |
| `alarms` | Waking once a minute to count time and refresh the rules |
| `declarativeNetRequest` | Blocking or redirecting navigations inside Chrome, without the extension seeing the traffic |
| `idle` | Not counting time while the child is away from the keyboard |
| `storage` | Keeping the pairing details and rules on the device |
| `tabs` | Reading the site name of the focused tab so time can be counted against it |
| Access to all sites (`<all_urls>`) | Required so the parent's rules can apply to any site. It does not read or change page content |

## What the parent's server stores

The server keeps one database file on the parent's machine containing: each
child's name and time zone; the rules; paired devices (a pairing code, an
optional label, last-seen time); usage rows of child, site name, minutes and
time; and the guardian PIN as a salted hash that cannot be read back. Usage
older than 90 days is deleted automatically unless the parent changes the
retention setting. Deleting a child deletes everything about them at once.
Unpairing a device stops all reporting from it immediately.

By default the console is reachable only on the home network over plain HTTP.
A parent may instead choose to host their server where it can be reached from
the internet, so that a Chromebook stays in contact on other networks. The
same data then travels to that server and nowhere else; such a server must be
put behind HTTPS, as the user guide describes. In both cases the server is
the parent's own and the SCOUT maintainers have no access to it.

## Sharing and third parties

Nothing is shared with anyone. The extension and the console make no requests
to any third party: no analytics, crash reporting, advertising, fonts, content
delivery networks or Google APIs. SCOUT does not sell, rent or transfer data
and never will. Its handling of data complies with the Chrome Web Store User
Data Policy, including the Limited Use requirements; the extension has no
access to Google user data.

## Children

SCOUT is installed by a parent or guardian on a device they are entitled to
supervise, for the purpose of applying their own household rules. It is not
offered to children directly and does not collect account identifiers. We
encourage parents to tell their children what is recorded: the site names and
minutes shown in the parent console are exactly what the child's device sends.

## Your choices

A parent can see every recorded site name and minute in the console's Usage
view, delete a child, unpair a device, shorten or lengthen retention, or delete
the database file to erase everything. A child can see the current rules in the
extension popup and the reason for any block on the lock page, and can ask the
parent to change or delete data. Because the maintainers hold no data, requests
about a particular family's data go to that family's parent, not to us.

## Changes and contact

This policy lives in the SCOUT repository; every change is recorded in its
history with a date. Questions or concerns can be raised through the
repository's issue tracker at
<https://github.com/DigiRelevance/Chromebook-parental-control/issues>.
