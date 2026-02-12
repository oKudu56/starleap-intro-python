# Number Guessing Game - Picker
# The program thinks of a number between 1 and 100 and the user tries to guess it.
# The program should tell the user if the guess is too high or too low.
# The program should also tell the user how many guesses it took to guess the number.
import turtle
import random
MIN_NUMBER = 1
MAX_NUMBER = 10

def get_valid_guess():
    while True:
        guess_text = (input("I'm thinking of a number, guess it: "))
        try:
            guess= int(guess_text)
            if guess > MAX_NUMBER or guess < MIN_NUMBER:
                raise ValueError()
            return guess
        except:
            print("Invalid Guess, try again.")

  
    # TODO: Implement this function
    pass

def play_picker():
    number = random.randint(MIN_NUMBER, MAX_NUMBER)
    # print(f"Computer picked {number}. Shhh.")
    while True:
        guess= get_valid_guess()
        if guess == number:
            print("Congratulations! you got it right!")
            break
        elif guess > number:
            print("Too High")
        else:
            print("Too Low")
        pass
    # TODO: Implement this function
def main():
    print('-' * 60)
    print()
    print("Welcome to the Number Guessing Game!")
    print()
    while True:
        guess_count = play_picker()
        answer = input("Do you want to play again? (yes/no)").lower()
        if answer == "no":
            print(":(")
            break
        

if __name__ == "__main__":
    main()