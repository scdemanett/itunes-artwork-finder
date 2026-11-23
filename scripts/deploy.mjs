// Deploys the Worker with routes from DEPLOY_ROUTES (set in .env), so personal domains stay out of the repo.
// Run via `npm run deploy`, which builds first and loads .env. Extra arguments are passed to `wrangler deploy`.
// Without DEPLOY_ROUTES, Wrangler deploys to workers.dev and leaves any existing routes untouched.
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const routes = (process.env.DEPLOY_ROUTES ?? '')
    .split(',')
    .map((route) => route.trim())
    .filter(Boolean);

console.log(routes.length ? `Deploying with routes: ${routes.join(', ')}` : 'No DEPLOY_ROUTES set: deploying to workers.dev only.');

const wrangler = fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js', import.meta.url));
execFileSync(process.execPath, [wrangler, 'deploy', ...routes.flatMap((route) => ['--route', route]), ...process.argv.slice(2)], {
    stdio: 'inherit',
});
