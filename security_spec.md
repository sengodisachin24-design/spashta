# SPASHTA Firestore Security Specification

## 1. Data Invariants
- Every document in `/users/{userId}` must belong to `request.auth.uid == userId`, with `request.auth.token.email_verified == true`.
- Subcollection documents (`/houses/{houseId}`, `/messages/{messageId}`, `/moods/{moodId}`) require the parent `/users/{userId}` document to exist (`exists(...)`), must enforce `userId == request.auth.uid`, and must match `isValidId()` regex (`^[a-zA-Z0-9_-]+$`, <= 128 chars).
- Once a `HouseProject` reaches `stage == 'completed'`, it is terminal and cannot be modified.
- Immutable fields (`uid`, `joinedAt`, `userId`, `id`, `startedAt`, `timestamp`) cannot change on update.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Unauthenticated read/write to `/users/uid1`.
2. Unverified email token (`email_verified: false`) writing to `/users/uid1`.
3. Cross-user read/write (`/users/otherUid` by `uid1`).
4. Shadow field injection (`isAdmin: true` in `/users/uid1`).
5. Oversized ID poisoning (`1KB` string for `houseId`).
6. Cross-owner spoofing (`userId: "victim"` inside `/users/uid1/houses/h1`).
7. Modifying terminal completed house (`stage == 'completed'` -> `bricksUsed: 0`).
8. Mutating `joinedAt` or `uid` on `/users/uid1` update.
9. Injecting invalid `mood` enum value (`"hacked"`).
10. Injecting unbounded `reflectionLog` array (> 50 items) or `tags` (> 10 items).
11. Injecting oversized chat text (> 4000 chars).
12. Querying `list` on `/users` collection without owner isolation.
