import { euclideanPattern } from './euclideanPattern.ts'

test.each`
  steps | fill | rotate | expected
  ${4}  | ${1} | ${0}   | ${[1, 0, 0, 0]}
  ${4}  | ${2} | ${0}   | ${[1, 0, 1, 0]}
  ${4}  | ${3} | ${0}   | ${[1, 0, 1, 1]}
  ${4}  | ${4} | ${0}   | ${[1, 1, 1, 1]}
  ${5}  | ${3} | ${0}   | ${[1, 0, 1, 0, 1]}
  ${8}  | ${3} | ${0}   | ${[1, 0, 0, 1, 0, 0, 1, 0]}
  ${8}  | ${3} | ${1}   | ${[0, 1, 0, 0, 1, 0, 0, 1]}
  ${8}  | ${3} | ${4}   | ${[0, 0, 1, 0, 1, 0, 0, 1]}
  ${8}  | ${5} | ${0}   | ${[1, 0, 1, 0, 1, 1, 0, 1]}
`('pattern($steps, $fill, $rotate)', ({ steps, fill, rotate, expected }) => {
  expect(euclideanPattern(steps, fill, rotate)).toEqual(expected)
})
