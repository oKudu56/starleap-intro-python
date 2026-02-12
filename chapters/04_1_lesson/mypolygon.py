import turtle

bob = turtle.Turtle()
bob.pd
bob.speed(0)
bob.pensize(1)
bob.write("67")
bob.shapesize(1)

for i in range(50):
    bob.rt(10)
    bob.fd(90)
    bob.circle(2)
    bob.lt(90)
    bob.rt(45)
    bob.fd(32)
    bob.lt(27)
    bob.rt(41)
turtle.mainloop()

