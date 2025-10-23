player1 = input("What does player 1 choose? ")
player2 = input("What does player 2 choose? ")



if (player1 == 'rock' and player2 == 'paper'):
        print("Player 2 wins")
elif (player1 == 'rock' and player2 == 'scissors'):
        print("Player 1 wins")
elif (player1 == 'rock' and player2 == 'rock'):
        print("Tie")
elif (player1 == 'paper' and player2 == 'rock'):
        print("Player 2 wins")
elif (player1 == 'paper' and player2 == 'scissors'):
        print("Player 2 wins")
elif (player1 == 'paper' and player2 == 'paper'):
        print("Tie")
elif (player1 == 'scissors' and player2 == 'rock'):
        print("Player 2 wins")
elif (player1 == 'scissors' and player2 == 'paper'):
        print("Player 1 wins")
elif (player1 == 'scissors' and player2 == 'scissors'):
        print("Tie")
else:
    print("Stop cheating")


      




