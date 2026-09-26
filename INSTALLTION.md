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
