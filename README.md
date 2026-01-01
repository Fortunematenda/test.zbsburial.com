<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## FortAI Platform

Service marketplace backend (Laravel) and mobile app (Expo React Native).

### Quick Start
- Backend
  - Copy `.env.example` to `.env` and set DB/APP_URL/CORS.
  - Install: `composer install`
  - Generate key: `php artisan key:generate`
  - Run migrations: `php artisan migrate --seed`
  - Serve: `php artisan serve --host=0.0.0.0 --port=8080`
- Mobile app
  - `cd mobile-app`
  - Copy `env.example` to `.env` and set `EXPO_PUBLIC_API_URL=https://test.zbsburial.com/api`
  - Install: `npm install` (or `yarn`)
  - Run: `npx expo start`

### Environment (Production Essentials)
- Backend
  - `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://test.zbsburial.com`
  - `CORS_ALLOWED_ORIGINS=https://test.zbsburial.com`
  - `RATE_LIMIT_PER_MINUTE=120`
  - `LOG_CHANNEL=daily`, `LOG_LEVEL=info`
  - Sessions/cookies: `SESSION_SECURE_COOKIE=true`, `SESSION_SAME_SITE=lax`, `SESSION_DOMAIN=.zbsburial.com`
  - Sanctum: `SANCTUM_STATEFUL_DOMAINS=test.zbsburial.com`
- Mobile
  - `EXPO_PUBLIC_API_URL=https://test.zbsburial.com/api`

### Security/Hardening Applied
- CORS restricted to production origin.
- API rate limiting reduced; env configurable.
- Debug routes disabled outside local/testing.
- Firebase HTTP client TLS verification enabled.
- Mobile production builds use HTTPS API and suppress dev logs.

### Build/Deploy Notes
- Optimize assets via Vite (default config).
- Consider Redis for `CACHE_STORE`, `SESSION_DRIVER`, `QUEUE_CONNECTION`.
- Run queue workers under a supervisor in production.

### Notes on Documentation Consolidation
All ad-hoc planning and status Markdown documents were removed to reduce noise. This README is the single source of truth for setup, configuration, and production notes.
