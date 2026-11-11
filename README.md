# Mission Test

Mission Test is a local-first teacher test-authoring prototype. This branch is an implementation milestone, not a hosted or secure examination service.

## Teacher workflow in this milestone

- A clean app database starts with no sample tests, questions, students, or results.
- Create a test with a title, description, language, and duration.
- Add questions, edit question/option text, delete questions, and explicitly select a correct option.
- Save tests in IndexedDB, list and reopen them for editing, and delete saved tests.
- Export a student question JSON package using the public serializer; the answer key is kept in a separate private field and excluded from that package.
- Question and option strings are persisted as entered; the editor does not normalize or rewrite them.

## Local prototype security limits

IndexedDB is local to one browser profile and is not an authorization boundary. Exporting a public package without an answer key is useful data minimization, but this implementation has no server, accounts, remote sharing, or server-side scoring. Do not use it for secure or high-stakes exams. Secure exams require an authenticated backend that stores private answer keys and scores attempts server-side.

## Run and verify locally

```sh
npm install
npm test
npm run build
```

These commands must be run in a configured Node.js environment; repository edits alone do not prove they pass.
