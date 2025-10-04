module.exports = {
  apps: [
    {
      name: 'xtream-proxy',
      script: './xtream-proxy-server-optimized.js',
      instances: 4,
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      max_memory_restart: '500M',
      error_file: './logs/xtream-proxy-error.log',
      out_file: './logs/xtream-proxy-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
    },
  ],
};
