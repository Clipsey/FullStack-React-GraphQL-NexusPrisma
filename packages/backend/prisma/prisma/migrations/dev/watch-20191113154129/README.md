# Migration `watch-20191113154129`

This migration has been generated at 11/13/2019, 3:41:30 PM.
You can check out the [state of the schema](./schema.prisma) after the migration.

## Database Steps

```sql

```

## Changes

```diff
diff --git datamodel.mdl datamodel.mdl
migration ..watch-20191113154129
--- datamodel.dml
+++ datamodel.dml
@@ -1,0 +1,76 @@
+generator photon {
+  provider = "photonjs"
+}
+
+datasource db {
+  provider = "postgresql"
+  url      = "postgresql://postgres:mysecretpassword@localhost:5432/postgres"
+}
+
+// model User {
+//   id    String  @default(cuid()) @id
+//   email String  @unique
+//   name  String?
+//   posts Post[]
+// }
+
+// model Post {
+//   id        String   @default(cuid()) @id
+//   createdAt DateTime @default(now())
+//   updatedAt DateTime @updatedAt
+//   published Boolean  @default(true)
+//   title     String
+//   content   String?
+//   author    User?
+// }
+
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
+
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
```

## Photon Usage

You can use a specific Photon built for this migration (watch-20191113154129)
in your `before` or `after` migration script like this:

```ts
import Photon from '@generated/photon/watch-20191113154129'

const photon = new Photon()

async function main() {
  const result = await photon.users()
  console.dir(result, { depth: null })
}

main()

```
