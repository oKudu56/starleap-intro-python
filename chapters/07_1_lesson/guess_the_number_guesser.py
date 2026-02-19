# Number Guessing Game - Guesser
# The user thinks of a number between 1 and 100 and the program tries to guess it.
# The user should tell the program if the guess is too high, too low, or correct.
# The program should tell the user how many guesses it took to guess the number.

import random
MIN_NUMBER = 1
MAX_NUMBER = 10

def get_number_feedback():
    # TODO: Implement this function
    answer = ''
    while answer != 'h' and answer != 'l' and answer != 'c':
        answer = input("Enter 'h' if the guess is high, 'l' if the guess is low, and 'c' if it's correct: ")
    return answer
    

def get_number():
    # TODO: Implement this function
    return (MIN_NUMBER + MAX_NUMBER) // 2
    
    

def play_guesser():
    global MIN_NUMBER
    global MAX_NUMBER
    print('-' * 60)
    print()
    print(f"Think of a number between {MIN_NUMBER} and {MAX_NUMBER} (inclusive).")
    input("Press Enter when you have thought of a number.")
    print()
    guess_count = 0
    # TODO: Implement the rest of this function
    while True:
        guess_count += 1
        guess = get_number()
        print(f"I'm guessing {guess}")
        feedback = get_number_feedback()
        
       
        if feedback == '':
            print(f"I guessed it in {guess_count} guesses")
            return guess_count
        elif feedback =='l':
            MIN_NUMBER = guess + 1
        elif feedback == 'h':
            MAX_NUMBER = guess- 1
    

        # Computer decides guess
        # Computer asks user for feedback on guess(high low/correct)
        #if correct exit function. if incorrect decide next guess.

    

def main():
    print('-' * 60)
    print()
    print("Welcome to the Number Guessing Game!")
    print()
    while True:
        guess_count = play_guesser()
        answer = input("Do you want to play again? (y/n) ").lower()
        if answer == "n":
            print("Thanks for playing!")
            break

if __name__ == "__main__":
    main()