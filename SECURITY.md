# Security Policy

If you discover a security vulnerability, please report it by opening an issue and marking it as confidential, or contact the maintainers directly.

Recommendations:
- Use strong `JWT_SECRET` and rotate periodically.
- Protect SMTP credentials and database credentials with environment variables.
- Use HTTPS in production.
- Limit database network access and use a dedicated DB user.
