# Infrastructure

Production deployment assets for the CMS platform.

| Path                                                         | Purpose                                                             |
| ------------------------------------------------------------ | ------------------------------------------------------------------- |
| [nginx/cms-gateway.conf](./nginx/cms-gateway.conf)           | Reverse proxy — `/api` → API, `/` → web, `/storefront` → storefront |
| [../docker-compose.server.yml](../docker-compose.server.yml) | Production Docker Compose stack                                     |
| [../.env.production.example](../.env.production.example)     | Server environment template                                         |
| [../scripts/remote-deploy.sh](../scripts/remote-deploy.sh)   | CI/CD deploy script (also installed at `/opt/cms/remote-deploy.sh`) |

See [docs/architecture/DEPLOYMENT_ARCHITECTURE.md](../docs/architecture/DEPLOYMENT_ARCHITECTURE.md).
