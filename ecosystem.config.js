module.exports = {
  apps: [
    {
      name: "Campaign Manager",
      script: "server.js",     // Your custom Node.js server script
      watch: false,
      autorestart: true,
      restart_delay: 1000,
      log_date_format : "YYYY-MM-DD HH:mm:ss",
      env: {
        NODE_ENV: "development",
        PORT: 6886             
      },
      env_staging: {
        NODE_ENV: "staging",
        PORT: 6886              
      },
      env_prod: {
        NODE_ENV: "prod",
        PORT: 6886              
      }
    }
  ]
};