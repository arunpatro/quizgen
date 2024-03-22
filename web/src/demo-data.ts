import type { QuizData } from './components/Quiz';
import eduDemoUrl from '@assets/AlbertEinstein_OnEducation.pdf';
import chemDemoUrl from '@assets/Chemistry-X-1.pdf';
import paulDemoUrl from '@assets/paulgraham-cities.pdf';

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
  title: "Chemistry for X - Chapter 1: Chemical Reactions and Equations",
  url: chemDemoUrl,
  data: [
    {
      question: 'What is a combination reaction?',
      options: [
        { id: 1, text: 'A reaction in which a single reactant breaks down to give simpler products' },
        { id: 2, text: 'A reaction in which two or more substances combine to form multiple products' },
        { id: 3, text: 'A reaction in which a single product is formed from two or more reactants' },
        { id: 4, text: 'A reaction in which heat is released along with the formation of products' },
      ],
      correct_option: 3,
    },
    {
      question: 'What is an exothermic reaction?',
      options: [
        { id: 1, text: 'Reactions in which heat is absorbed' },
        { id: 2, text: 'Reactions in which a single product is formed from two or more reactants' },
        { id: 3, text: 'Reactions in which heat is released along with the formation of products' },
        { id: 4, text: 'Reactions in which a single reactant breaks down to give simpler products' },
      ],
      correct_option: 3,
    },
    {
      question: 'What is a decomposition reaction?',
      options: [
        { id: 1, text: 'A reaction where two or more substances combine to form a single product' },
        { id: 2, text: 'A reaction where a single reactant breaks down to give simpler products' },
        { id: 3, text: 'A reaction where heat is released along with the formation of products' },
        { id: 4, text: 'A reaction where atoms of one element change into those of another element' },
      ],
      correct_option: 2,
    },
    {
      question: 'What happens when calcium oxide reacts with water?',
      options: [
        { id: 1, text: 'It forms calcium sulphate and releases heat' },
        { id: 2, text: 'It forms calcium chloride and absorbs heat' },
        { id: 3, text: 'It forms calcium hydroxide and releases heat' },
        { id: 4, text: 'It forms calcium carbonate and releases heat' },
      ],
      correct_option: 3,
    },
    {
      question: 'What is the result of the reaction between iron and copper sulphate solution?',
      options: [
        { id: 1, text: 'Iron and copper combine to form a new element' },
        { id: 2, text: 'Iron replaces copper' },
        { id: 3, text: 'No reaction occurs' },
        { id: 4, text: 'Copper replaces iron' },
      ],
      correct_option: 2,
    },
  ],
};
const demo3: Demo = {
  title: "Paul Graham - Cities and Ambition",
  url: paulDemoUrl,
  data: [
    {
      question: 'What does the author suggest is the reason why Cambridge is considered the intellectual capital?',
      options: [
        { id: 1, text: 'Cambridge has a high population of professors.' },
        { id: 2, text: 'Cambridge has the most prestigious universities.' },
        { id: 3, text: "There's a concentration of smart people there and there's nothing else people there care about more." },
        { id: 4, text: 'Cambridge has a strong focus on wealth and fame.' },
      ],
      correct_option: 3,
    },
    {
      question: 'Why does the author believe New York is unlikely to grow into a startup hub to rival Silicon Valley?',
      options: [
        { id: 1, text: 'People in New York admire something else more' },
        { id: 2, text: 'New York lacks technological resources' },
        { id: 3, text: 'People in New York admire something else more' },
        { id: 4, text: 'New York has a poor economy' },
      ],
      correct_option: 3,
    },
    {
      question: 'What does the author suggest is the main ambition in LA and how does it compare to New York\'s?',
      options: [
        { id: 1, text: 'The main ambition in LA is fame, which is similar to New York\'s ambition but with more emphasis on physical attractiveness.' },
        { id: 2, text: 'The main ambition in LA is intelligence, which is the opposite of New York\'s focus on fame.' },
        { id: 3, text: 'The main ambition in LA is political power, which contrasts with New York\'s focus on economic power.' },
        { id: 4, text: 'The main ambition in LA is wealth, which is completely different from New York\'s focus on fame.' },
      ],
      correct_option: 1,
    },
    {
      question: 'What does the author suggest is the message that Paris sends now and how does it differ from its past?',
      options: [
        { id: 1, text: 'The message Paris sends now is to "do things with style", differing from its past message of intellectual ambition.' },
        { id: 2, text: 'Paris sends the message of wealth and fame, differing from its past message of intellectual ambition.' },
        { id: 3, text: 'Paris sends the message of political power, differing from its past message of intellectual ambition.' },
        { id: 4, text: 'The message Paris sends now is to "do things with intelligence", differing from its past message of style and art.' },
      ],
      correct_option: 1,
    },
    {
      question: 'According to the author, what are the advantages of living in a great city for certain kinds of work?',
      options: [
        { id: 1, text: 'Cities offer better weather conditions and recreational activities.' },
        {
          id: 2,
          text: 'Cities provide an audience and a funnel for peers, especially in fields like the arts, writing, or technology. They offer the encouragement of feeling that people around you care about the kind of work you do, and a larger intake mechanism for finding peers.',
        },
        { id: 3, text: 'Cities provide cheaper living costs and better infrastructure.' },
        { id: 4, text: 'Cities provide better healthcare facilities and educational institutions.' },
      ],
      correct_option: 2,
    },
  ],
};

export default [demo1, demo2, demo3];
