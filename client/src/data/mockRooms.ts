export type MockRoom = {
  id: string
  name: string
  code: string
}

/** Comment this array out / set to [] to preview the empty state. */
export const mockRooms: MockRoom[] = [
  { id: '1', name: 'Payments service refactor', code: 'K7P2QX' },
  { id: '2', name: 'Pairing: auth middleware', code: 'M3X9TD' },
  { id: '3', name: 'Interview prep', code: 'R8WB4N' },
]
