# App Store Connect screenshots

Raw in-app captures for the Media Manager screenshot upload (Distribution →
iOS App → Media Manager), one folder per iPhone display-size bucket, sized
to Apple's exact required portrait pixel dimensions:

| Folder | Pixels | Devices |
|---|---|---|
| 6.9-inch | 1320 × 2868 | iPhone 17/16 Pro Max |
| 6.9-inch-iphone-air | 1260 × 2736 | iPhone Air |
| 6.9-inch-plus-and-older-pro-max | 1290 × 2796 | iPhone 16/15 Plus, 15/14 Pro Max |
| 6.5-inch | 1284 × 2778 | iPhone 14 Plus, 13/12/11 Pro Max, 11, XS Max, XR |
| 6.3-inch | 1179 × 2556 | iPhone 17/16/15 Pro, 17/16/15, 14 Pro |
| 6.1-inch | 1170 × 2532 | iPhone 17e/16e, 14, 13 Pro, 13, 12 Pro, 12, 11 Pro, XS, X |
| 5.5-inch | 1242 × 2208 | iPhone 8/7/6s/6 Plus |
| 4.7-inch | 750 × 1334 | iPhone SE (3rd/2nd gen), 8, 7, 6s, 6 |
| 4-inch | 640 × 1136 | iPhone SE (1st gen), 5s, 5c, 5 |
| 3.5-inch | 640 × 960 | iPhone 4s, 4 |

Apple's 6.9" bucket alone actually accepts three different pixel sizes
depending which 6.9" device the screenshot was taken on — all three are
included above. Apple only strictly requires the 6.9-inch and 6.5-inch
sets today (it auto-scales the rest); the other buckets are included for
completeness.

Each folder has the same 5 screens: `01_welcome` (sign-in), `02_mood`,
`03_connect`, `04_chat`, `05_profile` — captured from a live build with a
seeded demo account, not mocked designs.

On the two oldest buckets (4-inch, 3.5-inch) some content runs under the
fixed bottom tab bar / below the fold — that's the app's current layout at
those very small screen heights, not a capture artifact.
