import pydantic
import dspy

class QuizItem(pydantic.BaseModel):
    question: str
    options: list[dict]
    correct_option: int


class Quiz(pydantic.BaseModel):
    items: list[QuizItem]


class QuizQuestions(dspy.Signature):
    """I want to create a quiz from some provided text. This will be used to test my understanding of the subject objetively. Generate 5 meaningful questions based on the provided text."""

    document = dspy.InputField()

    question_1 = dspy.OutputField(desc="often between 5 and 15 words")
    question_2 = dspy.OutputField(desc="often between 5 and 15 words")
    question_3 = dspy.OutputField(desc="often between 5 and 15 words")
    question_4 = dspy.OutputField(desc="often between 5 and 15 words")
    question_5 = dspy.OutputField(desc="often between 5 and 15 words")


class SingleMCQ(dspy.Signature):
    """Generate one correct answer and three incorrect answers for the provided question, from the given document."""

    context = dspy.InputField()
    question = dspy.InputField()
    correct = dspy.OutputField(desc="the correct answer, often between 1 and 10 words")
    incorrect_1 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_2 = dspy.OutputField(desc="often between 1 and 10 words")
    incorrect_3 = dspy.OutputField(desc="often between 1 and 10 words")


class QuizGen(dspy.Module):
    def __init__(self):
        super().__init__()
        self.generate_questions = dspy.Predict(QuizQuestions)
        self.generate_mcq = dspy.Predict(SingleMCQ)

    def forward(self, document) -> Quiz:
        questions = self.generate_questions(document=document)
        print(questions)
        quiz_items = []
        for _, q in questions.items():
            mcq = self.generate_mcq(question=q, context=document)
            options = [
                mcq["correct"],
                mcq["incorrect_1"],
                mcq["incorrect_2"],
                mcq["incorrect_3"],
            ]
            # add ids and shuffle to avoid bias
            ids = list(range(1, len(options) + 1))
            random.shuffle(ids)
            options = [
                {"id": opt_id, "text": opt} for (opt_id, opt) in zip(ids, options)
            ]
            random.shuffle(options)
            quiz_items.append(
                QuizItem(question=q, options=options, correct_option=ids[0])
            )
        return Quiz(items=quiz_items)
