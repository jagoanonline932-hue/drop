import {
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs';

import {
  join,
  sep,
} from 'node:path';

import { fileURLToPath } from 'node:url';

import {
  type RouteConfigEntry,
  index,
  route,
} from '@react-router/dev/routes';

const __dirname = fileURLToPath(
  new URL('.', import.meta.url)
);

const APP_DIR = join(
  __dirname,
  'app'
);

type Tree = {
  path: string;

  children: Tree[];

  hasPage: boolean;

  hasLayout: boolean;

  pageFile?: string;

  layoutFile?: string;

  isParam: boolean;

  paramName: string;

  isCatchAll: boolean;
};

function normalizePath(
  value: string
) {
  return value
    .split(sep)
    .join('/');
}

function safeReadDir(
  dir: string
) {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function buildRouteTree(
  dir: string,
  basePath = ''
): Tree {
  const files = safeReadDir(dir);

  const node: Tree = {
    path: basePath,

    children: [],

    hasPage: false,

    hasLayout: false,

    pageFile: undefined,

    layoutFile: undefined,

    isParam: false,

    paramName: '',

    isCatchAll: false,
  };

  const dirName =
    basePath
      .split('/')
      .pop();

  if (
    dirName?.startsWith('[') &&
    dirName.endsWith(']')
  ) {
    node.isParam = true;

    const paramName =
      dirName.slice(1, -1);

    if (
      paramName.startsWith(
        '...'
      )
    ) {
      node.isCatchAll = true;

      node.paramName =
        paramName.slice(3);
    } else {
      node.paramName =
        paramName;
    }
  }

  for (const file of files) {
    const filePath = join(
      dir,
      file
    );

    let stat;

    try {
      stat = statSync(filePath);
    } catch {
      continue;
    }

    if (stat.isDirectory()) {
      const childPath =
        basePath
          ? `${basePath}/${file}`
          : file;

      const childNode =
        buildRouteTree(
          filePath,
          childPath
        );

      node.children.push(
        childNode
      );

      continue;
    }

    if (
      file === 'page.jsx' ||
      file === 'page.tsx'
    ) {
      node.hasPage = true;

      node.pageFile = file;
    }

    if (
      file === 'layout.jsx' ||
      file === 'layout.tsx'
    ) {
      node.hasLayout = true;

      node.layoutFile = file;
    }
  }

  return node;
}

function transformSegment(
  segment: string
) {
  if (
    segment.startsWith('[') &&
    segment.endsWith(']')
  ) {
    const param =
      segment.slice(1, -1);

    // [...slug]
    if (
      param.startsWith(
        '...'
      )
    ) {
      return '*';
    }

    // [[slug]]
    if (
      param.startsWith('[') &&
      param.endsWith(']')
    ) {
      return `:${param.slice(
        1,
        -1
      )}?`;
    }

    // [id]
    return `:${param}`;
  }

  return segment;
}

function createComponentPath(
  routePath: string,
  file: string
) {
  const target =
    routePath === ''
      ? `app/${file}`
      : `app/${routePath}/${file}`;

  return `./${normalizePath(
    target
  )}`;
}

function hasPageFile(
  routePath: string
) {
  return (
    existsSync(
      join(
        APP_DIR,
        routePath,
        'page.tsx'
      )
    ) ||
    existsSync(
      join(
        APP_DIR,
        routePath,
        'page.jsx'
      )
    )
  );
}

function getPageFile(
  routePath: string
) {
  if (
    existsSync(
      join(
        APP_DIR,
        routePath,
        'page.tsx'
      )
    )
  ) {
    return 'page.tsx';
  }

  return 'page.jsx';
}

function generateRoutes(
  node: Tree
): RouteConfigEntry[] {
  const routes: RouteConfigEntry[] =
    [];

  const routePath =
    node.path
      .split('/')
      .filter(Boolean)
      .map(transformSegment)
      .join('/');

  if (
    node.hasPage &&
    hasPageFile(node.path)
  ) {
    const pagePath =
      createComponentPath(
        node.path,
        getPageFile(node.path)
      );

    if (node.path === '') {
      routes.push(
        index(pagePath)
      );
    } else {
      routes.push(
        route(
          routePath,
          pagePath
        )
      );
    }
  }

  for (const child of node.children) {
    routes.push(
      ...generateRoutes(child)
    );
  }

  return routes;
}

/**
 * 🚀 HMR + Auto Route Discovery
 */
if (import.meta.env.DEV) {
  import.meta.glob(
    './app/**/page.{jsx,tsx}'
  );

  import.meta.glob(
    './app/**/layout.{jsx,tsx}'
  );

  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      console.clear();

      console.log(
        '⚡ HyperDrop Route Engine Reloaded'
      );

      import.meta.hot?.invalidate();
    });
  }
}

/**
 * 🧠 Build Route Tree
 */
const tree = buildRouteTree(
  APP_DIR
);

/**
 * 📦 Generate All Routes
 */
const generatedRoutes =
  generateRoutes(tree);

/**
 * ❌ Global Not Found Route
 */
const notFoundRoute = route(
  '*',
  './__create/not-found.tsx'
);

/**
 * ✅ Final Export
 */
const routes: RouteConfigEntry[] = [
  ...generatedRoutes,
  notFoundRoute,
];

console.log(
  `🚀 HyperDrop Router Loaded (${routes.length} routes)`
);

export default routes;
