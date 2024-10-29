import * as React from "react";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { createRxDatabase, addRxPlugin, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { Provider as RxDBProvider } from "rxdb-hooks";
import { cvsSchema, snippetSchema, userSchema } from "../db/schema";

export const Route = createRootRoute({
  component: RootComponent,
});

async function initializeDb() {
  if (process.env.NODE_ENV === "development") {
    await import("rxdb/plugins/dev-mode").then(({ RxDBDevModePlugin }) => {
      addRxPlugin(RxDBDevModePlugin);
    });
  }

  const db = await createRxDatabase({
    name: "cv-builder",
    storage: getRxStorageDexie(),
    ignoreDuplicate: true,
  });

  await db.addCollections({
    user: {
      schema: userSchema,
    },
  });

  await db.addCollections({
    snippets: {
      schema: snippetSchema,
    },
  });

  await db.addCollections({
    cvs: {
      schema: cvsSchema,
    },
  });

  return db;
}

function RootComponent() {
  const [db, setDb] = React.useState<RxDatabase | null>(null);

  React.useEffect(() => {
    initializeDb().then((db) => setDb(db));
  }, []);

  if (!db) {
    return process.env.NODE_ENV === "development" ? (
      <div>Loading in dev mode...</div>
    ) : null;
  }

  return (
    <React.Fragment>
      <RxDBProvider db={db}>
        <Outlet />
        <TanStackRouterDevtools />
      </RxDBProvider>
    </React.Fragment>
  );
}
