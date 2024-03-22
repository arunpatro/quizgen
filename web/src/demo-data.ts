import type { QuizData } from './components/Quiz';
import eduDemoUrl from '@assets/AlbertEinstein_OnEducation.pdf';

interface Demo {
  title: string;
  url: string;
  data: QuizData;
}

const demo1: Demo = {
  title: eduDemoUrl.split('/').pop()!,
  url: eduDemoUrl,
  data: [
    {
      question: 'What does Albert Einstein believe is the most important method of education?',
      options: [
        {
          id: 1,
          text: 'Inspiring and captivating people through speaking about higher educational ideals.',
        },
        { id: 2, text: 'The interpretation and translation of a text.' },
        { id: 3, text: 'Memorizing a large body of facts and knowledge.' },
        { id: 4, text: 'Urging the pupil to actual performance.' },
      ],
      correct_option: 4,
    },
    {
      question: 'What does Einstein suggest about the role of fear and authority in education?',
      options: [
        {
          id: 1,
          text: 'Einstein suggests that fear and authority are necessary components of a successful education system.',
        },
        {
          id: 2,
          text: 'Einstein suggests that fear and authority have no impact on the educational process.',
        },
        {
          id: 3,
          text: 'Einstein suggests that fear and authority in education produce submissive subjects.',
        },
        {
          id: 4,
          text: 'There was no mention of fear and authority in the given text.',
        },
      ],
      correct_option: 3,
    },
    {
      question:
        'According to Einstein, what is the most important motive for work in school and in life?',
      options: [
        { id: 1, text: 'External pressures and societal expectations for material wealth.' },
        {
          id: 2,
          text: 'Individual ambition for distinction and the spirit of competition.',
        },
        {
          id: 3,
          text: 'Desire for approval and recognition, which is one of the most important binding powers of society.',
        },
        {
          id: 4,
          text: 'Pleasure in work, pleasure in its results, and the knowledge of the value of the result to the community.',
        },
      ],
      correct_option: 4,
    },
    {
      question: 'What does Einstein believe about the importance of individuality in education?',
      options: [
        {
          id: 1,
          text: 'That the aim in education should be the training of independently thinking and acting individuals.',
        },
        {
          id: 2,
          text: 'That the question of individuality is not relevant to education–schools are simply instruments for transferring knowledge to the growing generation.',
        },
        {
          id: 3,
          text: 'That education should focus on the value of community service over personal aims and desires.',
        },
        {
          id: 4,
          text: 'That education should be as standardized as possible for maximum efficiency.',
        },
      ],
      correct_option: 1,
    },
    {
      question: 'How does Einstein propose that the spirit of education be gained in schools?',
      options: [
        {
          id: 1,
          text: 'Imposing strict regulations and standardized curricula overseen by experts.',
        },
        {
          id: 2,
          text: 'Employing creative teachers and allowing them extensive liberty in selecting teaching material and methods.',
        },
        {
          id: 3,
          text: 'Prioritizing technical education in sciences over classical humanities.',
        },
        {
          id: 4,
          text: 'Teaching directly the special knowledge and accomplishments that one has to use later in life.',
        },
      ],
      correct_option: 2,
    },
  ],
};
const demo2: Demo = {
  title: 'Test demo 2',
  url: '',
  data: [
    {
      question: 'What is 1+1?',
      options: [
        { id: 1, text: '2' },
        { id: 2, text: '1' },
        { id: 3, text: '3' },
        { id: 4, text: '4' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the capital of France?',
      options: [
        { id: 1, text: 'Paris' },
        { id: 2, text: 'London' },
        { id: 3, text: 'Berlin' },
        { id: 4, text: 'Madrid' },
      ],
      correct_option: 1,
    },
    {
      question: 'When is the Independence Day in the USA?',
      options: [
        { id: 1, text: 'July 4' },
        { id: 2, text: 'July 14' },
        { id: 3, text: 'June 4' },
        { id: 4, text: 'June 14' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest planet in the Solar System?',
      options: [
        { id: 1, text: 'Jupiter' },
        { id: 2, text: 'Earth' },
        { id: 3, text: 'Mars' },
        { id: 4, text: 'Saturn' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest mammal?',
      options: [
        { id: 1, text: 'Blue whale' },
        { id: 2, text: 'Elephant' },
        { id: 3, text: 'Giraffe' },
        { id: 4, text: 'Hippopotamus' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest ocean?',
      options: [
        { id: 1, text: 'Pacific' },
        { id: 2, text: 'Atlantic' },
        { id: 3, text: 'Indian' },
        { id: 4, text: 'Arctic' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest desert?',
      options: [
        { id: 1, text: 'Antarctica' },
        { id: 2, text: 'Sahara' },
        { id: 3, text: 'Arabian' },
        { id: 4, text: 'Gobi' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest mountain?',
      options: [
        { id: 1, text: 'Mount Everest' },
        { id: 2, text: 'K2' },
        { id: 3, text: 'Kangchenjunga' },
        { id: 4, text: 'Lhotse' },
      ],
      correct_option: 1,
    },
  ],
};
const demo3: Demo = {
  title: 'Test demo 3',
  url: '',
  data: [
    {
      question: 'What is 1+1?',
      options: [
        { id: 1, text: '2' },
        { id: 2, text: '1' },
        { id: 3, text: '3' },
        { id: 4, text: '4' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the capital of France?',
      options: [
        { id: 1, text: 'Paris' },
        { id: 2, text: 'London' },
        { id: 3, text: 'Berlin' },
        { id: 4, text: 'Madrid' },
      ],
      correct_option: 1,
    },
    {
      question: 'When is the Independence Day in the USA?',
      options: [
        { id: 1, text: 'July 4' },
        { id: 2, text: 'July 14' },
        { id: 3, text: 'June 4' },
        { id: 4, text: 'June 14' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest planet in the Solar System?',
      options: [
        { id: 1, text: 'Jupiter' },
        { id: 2, text: 'Earth' },
        { id: 3, text: 'Mars' },
        { id: 4, text: 'Saturn' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest mammal?',
      options: [
        { id: 1, text: 'Blue whale' },
        { id: 2, text: 'Elephant' },
        { id: 3, text: 'Giraffe' },
        { id: 4, text: 'Hippopotamus' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest ocean?',
      options: [
        { id: 1, text: 'Pacific' },
        { id: 2, text: 'Atlantic' },
        { id: 3, text: 'Indian' },
        { id: 4, text: 'Arctic' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest desert?',
      options: [
        { id: 1, text: 'Antarctica' },
        { id: 2, text: 'Sahara' },
        { id: 3, text: 'Arabian' },
        { id: 4, text: 'Gobi' },
      ],
      correct_option: 1,
    },
    {
      question: 'What is the largest mountain?',
      options: [
        { id: 1, text: 'Mount Everest' },
        { id: 2, text: 'K2' },
        { id: 3, text: 'Kangchenjunga' },
        { id: 4, text: 'Lhotse' },
      ],
      correct_option: 1,
    },
  ],
};

export default [demo1, demo2, demo3];
