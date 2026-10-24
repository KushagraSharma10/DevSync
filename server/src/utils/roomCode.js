const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const CODE_LENGTH = 6

/** Short join codes — skips ambiguous I/O/0/1 characters. */
export function generateRoomCode() {
  let code = ''
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    const index = Math.floor(Math.random() * CODE_ALPHABET.length)
    code += CODE_ALPHABET[index]
  }
  return code
}
