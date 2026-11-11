# Mission Test

Mission Test is a teacher-driven test creation and student practice application. It is an evolving local-first web prototype, not yet a secure hosted exam service or a verified Android APK.

## Current prototype

- Teacher can paste multiple-choice questions, import them, edit prompts and options, mark explicit correct answers, and lock editing in the current view.
- Student practice mode accepts a student name, records choices for the current session, and scores only questions with an answer key.
- Question sets persist in the current browser using local storage.
- The parser supports numbered/un-numbered prompts, A–D options, and explicit `Answer: B` lines.
- Public sharing helper removes answer keys and explanations from student-facing question data.
- IndexedDB storage module is available for durable test and attempt records.

## Important security limitation

This prototype is **not suitable for secure examinations**. The browser has the teacher answer key and client code; local edit-locks are not authorization. The public payload helper is useful for data minimization, but a production exam needs authenticated server-side storage, authorization, server-side scoring, and server-generated public test data. Do not use the client-side helper as a security boundary.

## Run locally

```sh
npm install
npm run dev
```

## Verify

```sh
npm test
npm run build
```

No build/test result is asserted here unless those commands have been run in a configured environment.
