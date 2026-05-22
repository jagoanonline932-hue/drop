import {
  readdirSync,
  statSync,
  existsSync,
} from 'node:fs';

import {
  join,
  relative,
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

function buildRouteTree(
  dir: string,
  basePath = ''
): Tree {
  const files = readdirSync(dir);

  const node: Tree = {
    path: basePath,

    children: [],

    hasPage: false,

    hasLayout: false,

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

    const stat =
      statSync(filePath);

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
    } else if (
      file === 'page.jsx' ||
      file === 'page.tsx'
    ) {
      node.hasPage = true;
    } else if (
      file === 'layout.jsx' ||
      file === 'layout.tsx'
    ) {
      node.hasLayout = true;
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

    if (
      param.startsWith(
        '...'
      )
    ) {
      return '*';
    }

    if (
      param.startsWith('[') &&
      param.endsWith(']')
    ) {
      return `:${param.slice(
        1,
        -1
      )}?`;
    }

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

function generateRoutes(
  node: Tree
): RouteConfigEntry[] {
  const routes: RouteConfigEntry[] =
    [];

  const routePath =
    node.path
      .split('/')
      .map(transformSegment)
      .join('/');

  const pagePath =
    createComponentPath(
      node.path,
      existsSync(
        join(
          APP_DIR,
          node.path,
          'page.tsx'
        )
      )
        ? 'page.tsx'
        : 'page.jsx'
    );

  if (node.hasPage) {
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

if (import.meta.env.DEV) {
  import.meta.glob(
    './app/**/page.{jsx,tsx}'
  );

  import.meta.glob(
    './app/**/layout.{jsx,tsx}'
  );

  if (import.meta.hot) {
    import.meta.hot.accept(() => {
      import.meta.hot?.invalidate();
    });
  }
}

const tree = buildRouteTree(
  APP_DIR
);

const routes = [
  ...generateRoutes(tree),

  route(
    '*',
    './__create/not-found.tsx'
  ),
];

export default routes;
