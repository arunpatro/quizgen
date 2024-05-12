<div align="center">

<img src="./docs/source/_static/logo.png" alt="QuizGen Logo" width=200></img>

# QuizGen

Generate quizes to test your understanding.

[Try Online](http://....vercel.app) •
[Report a Bug](https://github.com/arunpatro/quizgen/issues) •
[Stay tuned](#stay-tuned-for)

</div>

## about
QuizGen is an AI app to generate quizes from content.

## running locally (web app)
1. First create a `.env` from the `.env.sample` in the `web/api` directory
2. Start the local frontend dev server:
```sh
cd web && npm install
npm run dev
```
3. Start the local backend dev server:
```sh
cd api
uvicorn app:app --reload --port 5000
```

## vercel
```sh
npm i -g vercel
vercel
```
Connection between the two should be automatic (see `web/vite.config.ts` for proxy config).

## features
1. generate MCQ questions from ai
2. edit questions
3. export questions
4. demos

## todo
- [TODO] explain yourself along with citations/references
- [BUG] quiz reseting may be issues
