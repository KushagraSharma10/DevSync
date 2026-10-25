export type MockChatMessage = {
  id: string
  author: string
  time: string
  text: string
}

/** Chat stays mock until RT3; participants come from Socket.IO presence. */
export const mockRoom = {
  messages: [
    {
      id: '1',
      author: 'Rohan Iyer',
      time: '10:42',
      text: 'Binary search is passing. Moving on to twoSum with a Map.',
    },
    {
      id: '2',
      author: 'You',
      time: '10:43',
      text: 'Nice. Does it handle duplicates, like [3, 3] with target 6?',
    },
    {
      id: '3',
      author: 'Sam Okafor',
      time: '10:43',
      text: 'It should, since we check seen before we set the current value.',
    },
    {
      id: '4',
      author: 'Rohan Iyer',
      time: '10:44',
      text: 'Right. I will add that case once the loop is done.',
    },
    {
      id: '5',
      author: 'You',
      time: '10:45',
      text: 'Sounds good. I am reading through the mid calculation again.',
    },
  ] as MockChatMessage[],
}
