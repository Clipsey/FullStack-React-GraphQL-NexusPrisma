# Migration `watch-20191113152900`

This migration has been generated at 11/13/2019, 3:29:00 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE UNIQUE INDEX "User.username" ON "public"."User"("username")

CREATE UNIQUE INDEX "_ChatMembers_AB_unique" ON "public"."_ChatMembers"("A","B")
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration watch-20191113151717..watch-20191113152900
--- datamodel.dml
+++ datamodel.dml
@@ -1,13 +1,4 @@
-generator photon {
-  provider = "photonjs"
-}
-
-datasource db {
-  provider = "postgresql"
-  url = "***"
-}
-
 enum MessageType {
   TEXT
   PICTURE
   LOCATION
```

## Photon Usage

You can use a specific Photon built for this migration (watch-20191113152900)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/watch-20191113152900'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
