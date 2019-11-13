# Migration `watch-20191113153554`

This migration has been generated at 11/13/2019, 3:35:54 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
ALTER TABLE "public"."ChatMessage" DROP COLUMN "type",
ADD COLUMN "type" text   ;
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration watch-20191113152900..watch-20191113153554
--- datamodel.dml
+++ datamodel.dml
@@ -1,43 +1,56 @@
-enum MessageType {
-  TEXT
-  PICTURE
-  LOCATION
+generator photon {
+  provider = "photonjs"
 }
-// model UserTest {
-//   id        Int      @id
-//   profile   ProfileTest? @relation(references: [id])
-// }
-// model ProfileTest {
-//   id   Int    @id
-//   user User
-// }
+datasource db {
+  provider = "postgresql"
+  url      = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"
+}
 // model User {
-//   id        Int        @id
-//   customer  Profile?   @relation(references: id)
+//   id    String  @default(cuid()) @id
+//   email String  @unique
+//   name  String?
+//   posts Post[]
 // }
-// model Profile {
-//   id    Int     @id
-//   user  User?
+
+// model Post {
+//   id        String   @default(cuid()) @id
+//   createdAt DateTime @default(now())
+//   updatedAt DateTime @updatedAt
+//   published Boolean  @default(true)
+//   title     String
+//   content   String?
+//   author    User?
 // }
-model User {
-  id         String   @default(cuid()) @id
-  email      String   @unique
-  password   String
-  name       String?
-  posts      Post[]
-  username   String?  @unique
-  picture    String?
-  chats      Chat[]   @relation(name: "ChatMembers")
-  chatsOwned Chat[]   @relation(name: "ChatAdmin")
-  createdAt  DateTime @default(now())
-  updatedAt  DateTime @updatedAt
+model Post {
+  id        String   @default(cuid()) @id
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+  published Boolean  @default(false)
+  title     String
+  content   String?
+  author    User
 }
+enum MessageType {
+  TEXT
+  PICTURE
+  LOCATION
+}
+
+model ChatMessage {
+  id        String       @default(cuid()) @id
+  chat      Chat
+  sender    User
+  content   String?
+  createdAt DateTime     @default(now())
+  type      MessageType?
+}
+
 model Chat {
   id        String        @default(cuid()) @id
   name      String?
   picture   String?
@@ -47,22 +60,17 @@
   createdAt DateTime      @default(now())
   updatedAt DateTime      @updatedAt
 }
-model ChatMessage {
-  id        String      @default(cuid()) @id
-  chat      Chat
-  sender    User
-  content   String?
-  createdAt DateTime    @default(now())
-  type      MessageType
-}
-
-model Post {
-  id        String   @default(cuid()) @id
-  createdAt DateTime @default(now())
-  updatedAt DateTime @updatedAt
-  published Boolean  @default(false)
-  title     String
-  content   String?
-  author    User
+model User {
+  id         String   @default(cuid()) @id
+  email      String   @unique
+  password   String
+  name       String?
+  posts      Post[]
+  username   String?  @unique
+  picture    String?
+  chats      Chat[]   @relation(name: "ChatMembers")
+  chatsOwned Chat[]   @relation(name: "ChatAdmin")
+  createdAt  DateTime @default(now())
+  updatedAt  DateTime @updatedAt
 }
```

## Photon Usage

You can use a specific Photon built for this migration (watch-20191113153554)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/watch-20191113153554'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
