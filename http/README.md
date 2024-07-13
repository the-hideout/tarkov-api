This folder is for running the API as a standalonen application, without using Cloudflare workers.

## Enviroment Variables
* `PORT` - The port the server will listen on. Default is `8088`.
* `ENVIRONMENT` - The environment to run in. Either `production` or `dev`. Default is `dev`.
* `CACHE_BASIC_AUTH` - The basic auth string to use for caching. Default is `placeholder`.
* `CLOUDFLARE_TOKEN` - The Cloudflare token to use for accessing the KV store. Default is `placeholder`.