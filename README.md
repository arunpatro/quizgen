# qa-bot

This is a project to automate QA.

## running (streamlit)

Choose one of the apps in the src folder to run, and run like:

```sh
streamlit run src/app_v2.py
```

## running (web app)

First start the local frontend dev server:

```sh
cd web && npm install
npm run dev
```

Then start the local backend dev server:

```sh
cd server
flask run
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
