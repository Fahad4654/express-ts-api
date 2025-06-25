// routes/index.ts
import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const mainRouter = Router();
const routesPath = __dirname;

// Get all route files
const routeFiles = fs.readdirSync(routesPath).filter(file => {
  return file !== 'index.ts' && file.endsWith('.route.ts');
});

// Dynamically import and register each route
routeFiles.forEach(async (file) => {
  try {
    const routePath = `/v1/api/${file.replace('.route.ts', '')
                                 .replace(/([a-z])([A-Z])/g, '$1-$2')
                                 .toLowerCase()}`;
    console.log(routePath)
    // Dynamic import (ESM style - works with TypeScript)
    const module = await import(path.join(routesPath, file));
    
    // Check if the module has a router export
    if (module.router) {
      mainRouter.use(routePath, module.router);
    } else {
      console.warn(`Route file ${file} doesn't export a router`);
    }
  } catch (err) {
    console.error(`Error loading route ${file}:`, err);
  }
});

export { mainRouter as allRoutes };