import { customAlphabet } from 'nanoid'
import { nolookalikesSafe } from 'nanoid-dictionary'

export const generateId = customAlphabet(nolookalikesSafe, 32)
