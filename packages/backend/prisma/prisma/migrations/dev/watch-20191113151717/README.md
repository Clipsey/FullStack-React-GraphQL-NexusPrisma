# Migration `watch-20191113151717`

This migration has been generated at 11/13/2019, 3:17:25 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql
CREATE TABLE "public"."Chat" (
  "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  "id" text NOT NULL  ,
  "name" text   ,
  "owner" text   REFERENCES "public"."User"("id") ON DELETE SET NULL,
  "picture" text   ,
  "updatedAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."ChatMessage" (
  "content" text   ,
  "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
  "id" text NOT NULL  ,
  "sender" text   REFERENCES "public"."User"("id") ON DELETE SET NULL,
  "type" text NOT NULL DEFAULT 'TEXT' ,
  PRIMARY KEY ("id")
);

CREATE TABLE "public"."_ChatMembers" (
  "A" text   REFERENCES "public"."Chat"("id") ON DELETE CASCADE,
  "B" text   REFERENCES "public"."User"("id") ON DELETE CASCADE
);

ALTER TABLE "public"."User" DROP COLUMN "test",
ADD COLUMN "createdAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
ADD COLUMN "password" text NOT NULL DEFAULT '' ,
ADD COLUMN "picture" text   ,
ADD COLUMN "updatedAt" timestamp(3) NOT NULL DEFAULT '1970-01-01 00:00:00' ,
ADD COLUMN "username" text   ;

ALTER TABLE "public"."ChatMessage" ADD COLUMN "chat" text   REFERENCES "public"."Chat"("id") ON DELETE SET NULL;

CREATE UNIQUE INDEX "User.username" ON "public"."User"("username")

CREATE UNIQUE INDEX "_ChatMembers_AB_unique" ON "public"."_ChatMembers"("A","B")
```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..watch-20191113151717
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,77 @@
+generator photon {
+  provider = "photonjs"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"
+}
+
+enum MessageType {
+  TEXT
+  PICTURE
+  LOCATION
+}
+
+// model UserTest {
+//   id        Int      @id
+//   profile   ProfileTest? @relation(references: [id])
+// }
+// model ProfileTest {
+//   id   Int    @id
+//   user User
+// }
+
+// model User {
+//   id        Int        @id
+//   customer  Profile?   @relation(references: id)
+// }
+// model Profile {
+//   id    Int     @id
+//   user  User?
+// }
+
+
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
+}
+
+model Chat {
+  id        String        @default(cuid()) @id
+  name      String?
+  picture   String?
+  members   User[]        @relation(name: "ChatMembers")
+  owner     User          @relation(name: "ChatAdmin")
+  messsages ChatMessage[]
+  createdAt DateTime      @default(now())
+  updatedAt DateTime      @updatedAt
+}
+
+model ChatMessage {
+  id        String      @default(cuid()) @id
+  chat      Chat
+  sender    User
+  content   String?
+  createdAt DateTime    @default(now())
+  type      MessageType
+}
+
+model Post {
+  id        String   @default(cuid()) @id
+  createdAt DateTime @default(now())
+  updatedAt DateTime @updatedAt
+  published Boolean  @default(false)
+  title     String
+  content   String?
+  author    User
+}
```

## Photon Usage

You can use a specific Photon built for this migration (watch-20191113151717)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/watch-20191113151717'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
