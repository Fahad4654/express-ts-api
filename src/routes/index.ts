import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const mainRouter = Router();
const routesPath = __dirname;

// Get all route files (handles both .ts and .js extensions)
const routeFiles = fs.readdirSync(routesPath).filter(file => {
  const isRouteFile = 
    file !== 'index.ts' && 
    file !== 'index.js' && 
    (file.endsWith('.route.ts') || file.endsWith('.route.js'));
  return isRouteFile;
});

// Dynamically import and register each route
routeFiles.forEach(async (file) => {
  try {
    // Remove both .ts and .js extensions for route path
    const baseName = file.replace('.route.ts', '').replace('.route.js', '');
    const routePath = `/v1/api/${baseName
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .toLowerCase()}`;
    
    console.log(`Registering route: ${routePath}`);

    // Dynamic import works with both .ts and .js
    const module = await import(path.join(routesPath, file));
    
    // Check for common export patterns
    const router = module.router || module.default?.router || module.default;
    
    if (router) {
      mainRouter.use(routePath, router);
    } else {
      console.warn(`Route file ${file} doesn't export a router properly`);
      console.warn(`Available exports:`, Object.keys(module));
    }
  } catch (err) {
    console.error(`Error loading route ${file}:`, err);
  }
});

export { mainRouter as allRoutes };