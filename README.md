# qa-bot

This is a project to automate QA.

## running (web app)

First create a `.env` from the `.env.sample` in the `web/server` directory

Then start the local frontend dev server:

```sh
cd web && npm install
npm run dev
```

Then start the local backend dev server:

```sh
cd server
uvicorn app:app --reload --port 5000
```

Connection between the two should be automatic (see `web/vite.config.ts` for proxy config).

## features
1. generate MCQ questions from ai
2. edit questions
3. export questions
4. demo stuff
5. [TODO] explain yourself along with citations/references

## bugs to resolve
- quiz reseting may be issues
