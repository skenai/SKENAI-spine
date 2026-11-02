# Contributing to @skenai/spine

Thanks for keeping the spine clean. Three hard rules, then the DCO.

## Hard rules

- **DCO sign-off on every commit.** Every commit must carry a
  `Signed-off-by: Name <email>` trailer (see below). PRs with unsigned
  commits are not merged.
- **PRs from forks.** No direct pushes to `main`. **No force-push to
  `main`** under any circumstances.
- **Boundary holds.** `npm run check:boundary` must pass. The spine ships
  no settlement engine internals — adjudication, mint, reconcile, tithe,
  persistence.

## Content policy

Do not commit:

- Private-client names or closed lane identifiers (the boundary check
  enforces a term list; it is not exhaustive — judgment applies).
- IDs that identify tenant infrastructure — Drive folder IDs, database
  row IDs, internal deployment names.
- Tenant secrets, tokens, keys, or credentials of any kind.
- Anything you would not publish on the OPEN tier of the three-tier model
  (see README).

## Developer Certificate of Origin

This project uses the Developer Certificate of Origin 1.1 (DCO). By adding a
`Signed-off-by:` trailer to each commit (`git commit -s`), you certify:

```
Developer Certificate of Origin
Version 1.1

Copyright (C) 2004, 2006 The Linux Foundation and its contributors.
1 Letterman Drive
Suite D4700
San Francisco, CA, 94129

Everyone is permitted to copy and distribute verbatim copies of this
license document, but changing it is not allowed.


Developer's Certificate of Origin 1.1

By making a contribution to this project, I certify that:

(a) The contribution was created in whole or in part by me and I
    have the right to submit it under the open source license
    indicated in the file; or

(b) The contribution is based upon previous work that, to the best
    of my knowledge, is covered under an appropriate open source
    license and I have the right under that license to submit that
    work with modifications, whether created in whole or in part
    by me, under the same open source license (unless I am
    permitted to submit under a different license), as indicated
    in the file; or

(c) The contribution was provided directly to me by some other
    person who certified (a), (b) or (c) and I have not modified
    it.

(d) I understand and agree that this project and the contribution
    are public and that a record of the contribution (including all
    personal information I submit with it, including my sign-off) is
    maintained indefinitely and may be redistributed consistent with
    this project or the open source license(s) involved.
```

## Before you open a PR

```bash
npm run build
npm test
npm run check:boundary
```

All three must pass. Keep diffs small; keep comments truthful — a constant is
a constant, a demo is a demo.
