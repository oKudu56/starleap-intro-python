
    
prefixes = 'JKLMNOPQ'
suffix = 'ack'
for letter in prefixes:
    print(letter + suffix)

s = 'Monty Python'
print(s[0:5])
print(s[5:11])
print(s[:5])

for i in range (len(s)):
    print(i, s[i])



def find_first(word, letter):
    index = 0
    while index < len(word):
        if word[index] == letter:
            return index
        index += 1

print( 'found at:', find_first('bob', 'o'))

def count_letters(word, letter):
    count = 0 
    for l in word:
        if l == letter:
            count += 1
    return count

print('count: ', count_letters('bob', 'b'))

name = 'rocco'
print(name.title())
print(name.format())
print(name.find('c'))

n1 = 'rocco'
n2 = 'Rocco'
n1c = n1.casefold()
n2c = n2.casefold()
if n1c == n2c:
    print('same')
elif n1c < n2c:
    print('less than')
elif n1c > n2c:
    print('greater than')


def is_reverse(word1, word2):
    flip1 = ''
    index = len(word1) -1
    while index >= 0:
        l = word1[index]
        flip1 = flip1 + l
        index -= 1 
    print('flip1', flip1)
    return flip1 == word2

print(is_reverse('rocco', 'occor'))
