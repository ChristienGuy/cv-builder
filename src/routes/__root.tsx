import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { createRxDatabase, addRxPlugin, RxDatabase } from "rxdb";
import { getRxStorageDexie } from "rxdb/plugins/storage-dexie";

import { Provider as RxDBProvider } from "rxdb-hooks";

import { cvsSchema, snippetSchema, userSchema } from "../db/schema";
import { SupabaseReplication } from "@/db/replication";
import { useEffect, useState } from "react";

import { supabaseClient, supabaseUrl } from "@/db/supabase";
import { AuthProvider } from "@/auth-context";

export const Route = createRootRoute({
  component: RootComponent,
});

async function initializeDb() {
  if (import.meta.env.DEV) {
    await import("rxdb/plugins/dev-mode").then(({ RxDBDevModePlugin }) => {
      addRxPlugin(RxDBDevModePlugin);
    });
  }

  const db = await createRxDatabase({
    name: "cv-builder",
    storage: getRxStorageDexie(),
    ignoreDuplicate: true,
  });

  const collections = await db.addCollections({
    snippets: {
      schema: snippetSchema,
    },
    user: {
      schema: userSchema,
    },
    cvs: {
      schema: cvsSchema,
    },
  });

  const snippetReplication = new SupabaseReplication({
    supabaseClient: supabaseClient,
    collection: collections.snippets,
    replicationIdentifier: "myId" + supabaseUrl, // TODO: Add Supabase user ID?
    pull: {},
    push: {},
  });

  snippetReplication.error$.subscribe((error) => {
    console.error("Replication error", error);
  });

  return db;
}

function RootComponent() {
  return (
    <>
      <AuthProvider>
        <DBLayer />
      </AuthProvider>
    </>
  );
}

// TODO: manage loading state for DB initialization and replication
function DBLayer() {
  const [db, setDb] = useState<RxDatabase | null>(null);

  useEffect(() => {
    initializeDb().then((db) => setDb(db));
  }, []);

  if (!db) {
    return process.env.NODE_ENV === "development" ? (
      <div>Loading in dev mode...</div>
    ) : null;
  }

  return (
    <>
      <RxDBProvider db={db}>
        <Outlet />
        <TanStackRouterDevtools />
      </RxDBProvider>
    </>
  );
}
