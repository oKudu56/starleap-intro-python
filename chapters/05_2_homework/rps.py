print("Welcome to Rock, Paper, Scissors, dog, bird, ")
import getpass



player1 = getpass.getpass(prompt="Player 1, enter your choice: ").lower()
player2 = getpass.getpass(prompt="Player 2, enter your choice: ").lower()







#rock paper scissors dog bird 



if (player1 == 'rock' and player2 == 'paper'):
        print("Player 2 wins")
elif (player1 == 'rock' and player2 == 'scissors'):
        print("Player 1 wins")
elif (player1 == 'rock' and player2 == 'rock'):
        print("Tie")
elif(player1 == 'rock' and player2 == 'bird'):
        print("Player 1 wins")
elif(player1 == 'rock' and player2 == 'dog'):
        print("Player 1 wins")


elif (player1 == 'paper' and player2 == 'rock'):
        print("Player 2 wins")
elif (player1 == 'paper' and player2 == 'scissors'):
        print("Player 2 wins")
elif (player1 == 'paper' and player2 == 'paper'):
        print("Tie")
elif(player1 == 'paper' and player2 == 'bird'):
        print("Tie")
elif(player1 == 'paper' and player2 == 'dog'):
        print("Player 2 wins")


elif (player1 == 'scissors' and player2 == 'rock'):
        print("Player 2 wins")
elif (player1 == 'scissors' and player2 == 'paper'):
        print("Player 1 wins")
elif (player1 == 'scissors' and player2 == 'scissors'):
        print("Tie")
elif(player1 == 'scissors' and player2 == 'bird'):
        print("Player 1 wins")
elif(player1 == 'scissors' and player2 == 'dog'):
        print("Tie")



elif (player1 == 'dog' and player2 == 'bird'):
        print("Tie")
elif (player1 == 'dog' and player2 == 'rock'):
        print("Player 2 wins ")
elif (player1 == 'dog' and player2 == 'paper'):
        print("Player 1 wins")
elif (player1 == 'dog' and player2 == 'scissors'):
        print("Tie")
elif (player1 == 'dog' and player2 == 'dog'):
        print("Tie")



elif (player1 == 'bird' and player2 == 'rock'):
        print("Player 2 wins ")
elif (player1 == 'bird' and player2 == 'paper'):
        print("Player 1 wins")
elif (player1 == 'bird' and player2 == 'scissors'):
        print("Player 2 wins")
elif (player1 == 'bird' and player2 == 'dog'):
        print("Tie")
elif (player1 == 'bird' and player2 == 'bird'):
        print("Tie")

elif (player1 == 'cat' and player2 == 'rock'):
        print("Player 2 wins ")
elif (player1 == 'cat' and player2 == 'paper'):
        print("Player 1 wins")
elif (player1 == 'cat' and player2 == 'scissors'):
        print("Tie")
elif (player1 == 'cat' and player2 == 'dog'):
        print("Player 1 wins")
elif (player1 == 'cat' and player2 == 'bird'):
        print("Player 1 wins")
elif (player1 == 'cat' and player2 == 'cat'):
        print("Tie")



else:
    print("Invalid input")
 


