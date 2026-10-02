# CyberLab Server

A small Node.js and Express backend where I practice real authentication and access control.

## What it does

- **Register:** creates an account and stores only a bcrypt hash of the password
- **Login:** checks the password and returns a signed JWT that lasts 1 hour
- **Same error message** for a wrong password and an unknown username, so attackers can't learn which usernames exist
- **Admin-only route:** the role is checked on the server, so users can't change it in their browser
- **Fake or edited tokens** are rejected because the signature doesn't match

## Important notes

This is a learning project, not production software. Users are stored in memory and disappear when the server stops. The JWT secret is read from a private `.env` file (not uploaded to GitHub). Login is rate limited to 5 attempts per 15 minutes per device. Data is not stored in a database yet.

## Built with

Node.js, Express, bcryptjs, jsonwebtoken, Git and GitHub

## Related project

The CyberLab portfolio site: https://kazeemmayowa70-prog.github.io/CyberLab/
