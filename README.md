# CyberLab Server

A small Node.js and Express backend where I practice real authentication and access control.

## What it does

- **Register:** creates an account and stores only a bcrypt hash of the password
- **Login:** checks the password and returns a signed JWT that lasts 1 hour
- **Same error message** for a wrong password and an unknown username, so attackers can't learn which usernames exist
- **Input validation:** usernames must be 3-20 letters, numbers or underscores, and non-text input is rejected
- **Security headers:** helmet adds protections like X-Frame-Options and Content-Security-Policy, and hides the X-Powered-By header
- **Timing defense:** unknown usernames still get a dummy bcrypt check, so replies take about the same time as for real users (rough check only)
- **Admin-only route:** the role is checked on the server, so users can't change it in their browser
- **Fake or edited tokens** are rejected because the signature doesn't match

## Important notes

This is a learning project, not production software. Users are stored in a local SQLite database file (`cyberlab.db`) that is not uploaded to GitHub. The JWT secret is read from a private `.env` file (not uploaded to GitHub). Login is rate limited to 5 attempts per 15 minutes per device, and registration to 5 requests per hour per device. The first account created becomes admin as a learning shortcut, which would not be safe on a public server. The server runs only on my phone and is not deployed online yet.

## Built with

Node.js, Express, SQLite, bcryptjs, jsonwebtoken, express-rate-limit, helmet, Git and GitHub

## Related project

The CyberLab portfolio site: https://kazeemmayowa70-prog.github.io/CyberLab/

## Security tests I ran

I tested these on my own server only:

- Wrong password and unknown username return the same error message
- The 6th failed login within 15 minutes is blocked by rate limiting
- The 6th register request within an hour is blocked by rate limiting
- A made-up token is rejected
- A real token edited from `user` to `admin` is rejected (the signature no longer matches)
- A regular user is blocked from the admin route
- Usernames with spaces or symbols, and non-text input, are rejected
