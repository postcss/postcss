# Threat Model

What threats we think of when we design our tool and process.

## Stealing maintainer credentials

> Attacker put malware to PostCSS `devDependencies` so maintainer will be injected and their credentials will be stolen to put malware now in this package.

Solutions:

1. We are working only in Dev Container. Attacker will have very limited access to host.
2. `npm` 2FA is on hardware token, so even maintainer machine compromising will not lead to leaking full-time credentials.

## Malware in nested dependencies

> The tool’s dependencies will be hijacked and malware will be installed to all tool’s users.

Solutions:

1. We use only dependencies without own dependencies.
2. We try to reduce dependencies as much as possible.

## Malware from development dependencies

> Malware in tool’s dependencies can write some script into the tool’s source code. A maintainer releases it unnoticed.

Solutions:

1. For development we use `pnpm` without a `postinstall` script.
2. We use `pnpm` with [`minimumReleaseAge`](https://pnpm.io/supply-chain-security#delay-dependency-updates) with 1 day cool down.
3. We are using lockfile for pnpm and also for GitHub Actions.
