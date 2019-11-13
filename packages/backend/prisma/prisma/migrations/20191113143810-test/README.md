# Migration `20191113143810-test`

This migration has been generated at 11/13/2019, 2:38:10 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."User" (
  "email" text NOT NULL DEFAULT '' ,
  "id" text NOT NULL  ,
  "name" text   ,
  "test" text   ,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."Post" (
  "content" text   ,
  "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  "id" text NOT NULL  ,
  "published" boolean NOT NULL DEFAULT true ,
  "title" text NOT NULL DEFAULT '' ,
  "updatedAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  PRIMARY KEY ("id")
);

ALTER TABLE "public"."Post" ADD COLUMN "author" text   REFERENCES "public"."User"("id") ON DELETE SET NULL;

CREATE UNIQUE INDEX "User.email" ON "public"."User"("email")
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..20191113143810-test
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,26 @@
+generator photon {
+  provider = "photonjs"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"
+}
+
+model User {
+  id    String  @default(cuid()) @id
+  test  String?
+  email String  @unique
+  name  String?
+  posts Post[]
+}
+
+model Post {
+  id        String   @default(cuid()) @id
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+  published Boolean  @default(true)
+  title     String
+  content   String?
+  author    User?
+}
```

## Photon Usage

You can use a specific Photon built for this migration (20191113143810-test)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/20191113143810-test'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
