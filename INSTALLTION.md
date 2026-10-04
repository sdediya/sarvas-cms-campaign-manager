# Installation and Deployment Guide

## Prerequisites
1. Ensure Node.js is installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).
2. Install `pm2` globally for process management:
   ```bash
   npm install -g pm2
   ```
3. Install Angular CLI globally:
   ```bash
   npm install -g @angular/cli
   ```
4. Ensure `bash` is available on your system to run the `deploy.sh` script.

## Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd VAS_NEW/CAMPAIGN_MANAGER
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration
1. Update the `ecosystem.config.js` file if necessary to match your environment settings.
2. Ensure the `PORT` and `NODE_ENV` variables are correctly set for each environment (`development`, `staging`, `prod`).

## Building the Angular Application
1. Build the Angular application for the desired environment:
   ```bash
   npm run build:prod
   ```
   Replace `prod` with the appropriate build script if needed.

## Running the Application
1. Start the application using `pm2`:
   ```bash
   pm2 start ecosystem.config.js --env development
   ```
   Replace `development` with `staging` or `prod` as needed.

2. To check the status of the application:
   ```bash
   pm2 status
   ```

3. To view logs:
   ```bash
   pm2 logs
   ```

## Deployment Using `deploy.sh`
1. Ensure the `deploy.sh` script is executable:
   ```bash
   chmod +x deploy.sh
   ```
2. Run the script:
   ```bash
   ./deploy.sh
   ```

The script deploys the **prod** build and runs these steps, stopping at the first failure:
1. Checks that `git`, `node`, `npm`, `pm2` and `curl` are installed, and that the working tree has no uncommitted changes.
2. Pulls the latest code (`git pull --ff-only`).
3. Installs dependencies (`npm install`) only if `package.json` changed since the last successful install, or `node_modules/` is missing. The check compares a SHA-256 hash of `package.json` with the one stored in `node_modules/.package-json.sha256`.
4. Builds the app (`npm run build:prod`). If the build fails, the live site is not touched.
5. Moves the current `dist/` to `dist-backup/` and the new build into `dist/`.
6. Reloads the pm2 app (or starts it from `ecosystem.config.js --env prod` if it is not registered yet).
7. Health check: requests `http://localhost:3001/` until it returns the Angular `index.html`, for up to 30 seconds.

If the health check passes, `dist-backup/` is deleted and the pm2 process list is saved (`pm2 save`).
If it fails, the script prints recent pm2 logs, restores `dist-backup/` to `dist/`, reloads pm2, keeps the broken build in `dist-failed/` for inspection, and exits with a non-zero code. The pulled code is left in place; the script prints the `git reset` command to revert it.

Defaults can be overridden with environment variables:

| Variable | Default | Purpose |
| --- | --- | --- |
| `BRANCH` | `main` | Branch to pull |
| `APP_NAME` | `Campaign Manager` | pm2 app name |
| `PORT` | `3001` | Port used for the health check |
| `HEALTH_TIMEOUT` | `30` | Seconds to wait for the app to respond |
| `FORCE_INSTALL` | `false` | Set to `true` to run `npm install` even if `package.json` is unchanged |

Example:
```bash
BRANCH=release HEALTH_TIMEOUT=60 ./deploy.sh
```

## Additional Commands
- To stop the application:
  ```bash
  pm2 stop ecosystem.config.js
  ```
- To delete the application from `pm2`:
  ```bash
  pm2 delete ecosystem.config.js
  ```

## Notes
- Ensure proper permissions are set for the deployment server.
- Monitor the application using `pm2` dashboard or logs for any issues.
