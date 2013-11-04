# Methods to parse list and split it to array
list =

  # Split string to array by separator symbols with function and inside strings
  # cheching
  split: (string, separators, last) ->
    array   = []
    current = ''
    split   = false

    func    = 0
    quote   = false
    escape  = false

    for letter in string

      if quote
        if escape
          escape = false
        else if letter == '\\'
          escape = true
        else if letter == quote
          quote = false
      else if letter == '"' or letter == "'"
        quote = letter
      else if letter == '('
        func += 1
      else if letter == ')'
        func -= 1 if func > 0
      else if func == 0
        for separator in separators
          split = true if letter == separator

      if split
        array.push(current.trim()) if current != ''
        current = ''
        split   = false
      else
        current += letter

    array.push(current.trim()) if last or current != ''
    array

  # Split list devided by space:
  #
  #   list.space('a b') #=> ['a', 'b']
  #
  # It check for fuction and strings:
  #
  #   list.space('calc(1px + 1em) "b c"') #=> ['calc(1px + 1em)', '"b c"']
  space: (string) ->
    @split(string, [' ', "\n", "\t"])

  # Split list devided by comma
  #
  #   list.comma('a, b') #=> ['a', 'b']
  #
  # It check for fuction and strings:
  #
  #   list.comma('rgba(0, 0, 0, 0) white') #=> ['rgba(0, 0, 0, 0)', '"white"']
  comma: (string) ->
    @split(string, [','], true)

module.exports = list
