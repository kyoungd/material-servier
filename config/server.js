module.exports = ({ env }) => ({
  host: env('HOST', '0.0.0.0'),
  port: env.int('PORT', 1337),
  admin: {
    auth: {
      secret: env('ADMIN_JWT_SECRET', 'b39c1ceb403a920a815b226e7e668270'),
    },
  },
  cron: { enabled: true }
});
