# Deployment Guide

This guide explains how to deploy the Finance AI Assistant application using Render.

## Prerequisites

Before deploying, ensure you have:

- A GitHub account.
- Access to the Finance AI Assistant repository.
- A Render account.
- Node.js and npm installed for local development.

## Deploying with Render

1. Sign in to [Render](<https://render.com/>).
2. Select **New Web Service**.
3. Connect your GitHub account.
4. Select the `finance-ai-assistant-app` repository.
5. Configure the service using the settings below.

### Build configuration

| Setting | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |

## Environment Variables

Add all required environment variables in the Render dashboard.

Refer to the project's `.env.example` file, if available, for the expected variable names.

Never commit API keys, passwords, database credentials, or other secrets to GitHub.

## Troubleshooting

### Build fails

- Check that dependencies are correctly declared in `package.json`.
- Review the Render build logs.
- Verify that the build command completes locally.

### Server fails to start

- Check the Render runtime logs.
- Verify that the configured start command matches `package.json`.
- Check Express route definitions for compatibility with the installed Express version.

### Application configuration issues

- Confirm that required environment variables are configured.
- Check that external API services are available.
- Verify that production configuration is correct.

## Production Checklist

- [ ]Build completes successfully.
- [ ]Server starts successfully.
- [ ]Environment variables are configured.
- [ ]Application routes work correctly.
- [ ]Sensitive credentials are not committed.
- [ ]Deployment is tested after publishing changes.

## Further Information

- [Render Documentation](<https://render.com/docs>)
- [Node.js Documentation](<https://nodejs.org/docs>)
- [Express Documentation](<https://expressjs.com/>)

---

Maintained as part of the Finance AI Assistant project.
