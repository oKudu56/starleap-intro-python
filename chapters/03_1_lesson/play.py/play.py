def print_lyrics():
    print('Boots')
    print('Cats')

def repeat_lyrics():
    print_lyrics()
    print_lyrics()
    print_lyrics()
    print_lyrics()

# repeat_lyrics()
def print_twice(input):
    print(input)
    print(input)

print_twice('sigma')
# print_twice('sigma'*67)
def is_it_even(input):
    if input % 2 == 0:
        print(str(input) + ' is even')
    else:
        print(str(input) +' is odd')

is_it_even(4)
is_it_even(5)
is_it_even(67)

x = 6
y = 7
if x < y:
    print('x is less than y')
elif x > y:
    print('x is greater than y')
else:
    print(' x must equal y')


