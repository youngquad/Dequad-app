# App Store Connect screenshots

Raw in-app captures for the Media Manager screenshot upload (Distribution →
iOS App → Media Manager), one folder per iPhone display-size bucket, sized
to Apple's exact required portrait pixel dimensions:

| Folder | Pixels |
|---|---|
| 6.9-inch | 1320 × 2868 |
| 6.5-inch | 1284 × 2778 |
| 6.3-inch | 1179 × 2556 |
| 6.1-inch | 1170 × 2532 |
| 5.5-inch | 1242 × 2208 |
| 4.7-inch | 750 × 1334 |
| 4-inch | 640 × 1136 |
| 3.5-inch | 640 × 960 |

Apple only requires the 6.9-inch and 6.5-inch sets today (it auto-scales
the rest); the other six are included for completeness.

Each folder has the same 5 screens: `01_welcome` (sign-in), `02_mood`,
`03_connect`, `04_chat`, `05_profile` — captured from a live build with a
seeded demo account, not mocked designs.

On the two oldest buckets (4-inch, 3.5-inch) some content runs under the
fixed bottom tab bar / below the fold — that's the app's current layout at
those very small screen heights, not a capture artifact.
