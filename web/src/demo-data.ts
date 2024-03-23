import type { QuizData } from './components/Quiz';
import eduDemoUrl from '@assets/AlbertEinstein_OnEducation.pdf';
import chemDemoUrl from '@assets/Chemistry-X-1.pdf';
import mctsDemoUrl from '@assets/llm-mcts-codegen.pdf';

interface Demo {
  title: string;
  url: string;
  data: QuizData;
}

const demo1: Demo = {
  title: 'Albert Einstein - On Education',
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
  title: 'Chemistry for X - Chapter 1: Chemical Reactions and Equations',
  url: chemDemoUrl,
  data: [
    {
      question: 'What is a combination reaction?',
      options: [
        {
          id: 1,
          text: 'A reaction in which a single reactant breaks down to give simpler products.',
        },
        {
          id: 2,
          text: 'A reaction in which two or more substances combine to form multiple products.',
        },
        {
          id: 3,
          text: 'A reaction in which a single product is formed from two or more reactants.',
        },
        {
          id: 4,
          text: 'A reaction in which heat is released along with the formation of products.',
        },
      ],
      correct_option: 3,
    },
    {
      question: 'What is an exothermic reaction?',
      options: [
        { id: 1, text: 'Reactions in which heat is absorbed.' },
        {
          id: 2,
          text: 'Reactions in which a single product is formed from two or more reactants.',
        },
        {
          id: 3,
          text: 'Reactions in which heat is released along with the formation of products.',
        },
        {
          id: 4,
          text: 'Reactions in which a single reactant breaks down to give simpler products.',
        },
      ],
      correct_option: 3,
    },
    {
      question: 'What is a decomposition reaction?',
      options: [
        {
          id: 1,
          text: 'A reaction where two or more substances combine to form a single product.',
        },
        { id: 2, text: 'A reaction where a single reactant breaks down to give simpler products.' },
        { id: 3, text: 'A reaction where heat is released along with the formation of products.' },
        {
          id: 4,
          text: 'A reaction where atoms of one element change into those of another element.',
        },
      ],
      correct_option: 2,
    },
    {
      question: 'What happens when calcium oxide reacts with water?',
      options: [
        { id: 1, text: 'It forms calcium sulphate and releases heat.' },
        { id: 2, text: 'It forms calcium chloride and absorbs heat.' },
        { id: 3, text: 'It forms calcium hydroxide and releases heat.' },
        { id: 4, text: 'It forms calcium carbonate and releases heat.' },
      ],
      correct_option: 3,
    },
    {
      question: 'What is the result of the reaction between iron and copper sulphate solution?',
      options: [
        { id: 1, text: 'Iron and copper combine to form a new element.' },
        { id: 2, text: 'Iron replaces copper.' },
        { id: 3, text: 'No reaction occurs.' },
        { id: 4, text: 'Copper replaces iron.' },
      ],
      correct_option: 2,
    },
  ],
};
const demo3: Demo = {
  title: 'Planning with LLMs for Code Generation',
  url: mctsDemoUrl,
  data: [
    {
      question:
        'What is the main issue with existing large language model-based code generation pipelines?',
      options: [
        { id: 4, text: 'They often generate outputs that fail to compile or are incorrect.' },
        {
          id: 2,
          text: 'They are too inefficient and computationally expensive despite their high accuracy.',
        },
        { id: 3, text: 'They can only work with a specific Transformer model.' },
        {
          id: 1,
          text: 'There is no issue with existing large language models and code generation.',
        },
      ],
      correct_option: 4,
    },
    {
      question: 'What is the proposed solution to improve the quality of generated programs?',
      options: [
        { id: 2, text: 'Sampling + Filtering algorithms (S+F).' },
        { id: 3, text: 'Highly specialized Transformer models like AlphaCode.' },
        { id: 4, text: 'Planning-Guided Transformer Decoding (PG-TD).' },
        { id: 1, text: 'Beam search-based generation methods.' },
      ],
      correct_option: 4,
    },
    {
      question:
        'What is the purpose of the S+F and SMCG-TD algorithms in the context of the document?',
      options: [
        { id: 1, text: 'They are used to fine-tune the Transformer.' },
        { id: 3, text: 'They use test cases to filter programs generated by the Transformer.' },
        { id: 2, text: 'They are used to calculate the pass rates of the programs.' },
        { id: 4, text: 'They generate test cases for the Transformer.' },
      ],
      correct_option: 3,
    },
    {
      question: 'How does Planning-Guided Transformer Decoding (PG-TD) work?',
      options: [
        {
          id: 4,
          text: 'PG-TD uses the Transformer to generate codes and then the planning algorithm optimizes computational efficiency.',
        },
        {
          id: 2,
          text: 'PG-TD uses the Transformer to generate codes and then the planning algorithm evaluates the quality of these codes.',
        },
        {
          id: 3,
          text: 'PG-TD uses a planning algorithm for lookahead search and guide the Transformer to generate better code.',
        },
        {
          id: 1,
          text: 'PG-TD uses a planning algorithm to generate code independently and then have the Transformer evaluate the quality.',
        },
      ],
      correct_option: 3,
    },
    {
      question: 'What is the effect of not having sequence caching in the PG-TD algorithm?',
      options: [
        { id: 2, text: 'The algorithm becomes faster thanks to requiring less memory to run.' },
        {
          id: 4,
          text: 'The algorithm needs to regenerate whole sequences, consuming much more time.',
        },
        {
          id: 3,
          text: "The algorithm can't generate longer programs because it loses context.",
        },
        {
          id: 1,
          text: "The algorithm generates programs with lower pass rates as it doesn't learn from previous programs.",
        },
      ],
      correct_option: 4,
    },
    // {
    //   correct_option: 2,
    //   options: [
    //     {
    //       id: 3,
    //       text: 'PG-TD ignores the pass rates of the generated programs during the generation process.',
    //     },
    //     {
    //       id: 4,
    //       text: 'PG-TD considers the pass rates of the generated programs after the generation process.',
    //     },
    //     {
    //       id: 1,
    //       text: 'PG-TD only considers the pass rates of the generated programs if they are above a certain threshold.',
    //     },
    //     {
    //       id: 2,
    //       text: 'PG-TD actively considers the pass rates of the generated programs during the generation process.',
    //     },
    //   ],
    //   question:
    //     'How does the PG-TD algorithm consider the pass rates of the generated programs during the generation process?',
    // },
  ],
};

export default [demo1, demo2, demo3];
