"""
Simple single-player Pong game (two paddles controlled by the player) with two balls.

Controls:
- Left paddle: W (up), S (down)
- Right paddle: Up Arrow, Down Arrow

Run: python pong.py
This uses only the Python standard library (Tkinter).
"""

import tkinter as tk
import random

# Game configuration
WIDTH = 800
HEIGHT = 500
PADDLE_WIDTH = 10
PADDLE_HEIGHT = 80
PADDLE_SPEED = 10
BALL_SIZE = 16
BALL_SPEED_MIN = 5
BALL_SPEED_MAX = 9

class Paddle:
    def __init__(self, canvas, x, y):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.width = PADDLE_WIDTH
        self.height = PADDLE_HEIGHT
        self.rect = canvas.create_rectangle(x, y, x + self.width, y + self.height, fill="white")

    def move(self, dy):
        new_y = self.y + dy
        # keep inside arena
        new_y = max(0, min(HEIGHT - self.height, new_y))
        dy = new_y - self.y
        self.y = new_y
        self.canvas.move(self.rect, 0, dy)

    def coords(self):
        return (self.x, self.y, self.x + self.width, self.y + self.height)

class Ball:
    def __init__(self, canvas, x, y):
        self.canvas = canvas
        self.x = x
        self.y = y
        self.size = BALL_SIZE
        self.oval = canvas.create_oval(x, y, x + self.size, y + self.size, fill="yellow")
        self.vx = random.choice([-1, 1]) * random.uniform(BALL_SPEED_MIN, BALL_SPEED_MAX)
        self.vy = random.uniform(-BALL_SPEED_MAX, BALL_SPEED_MAX)

    def reset(self, x, y):
        self.canvas.coords(self.oval, x, y, x + self.size, y + self.size)
        self.x = x
        self.y = y
        self.vx = random.choice([-1, 1]) * random.uniform(BALL_SPEED_MIN, BALL_SPEED_MAX)
        self.vy = random.uniform(-BALL_SPEED_MAX, BALL_SPEED_MAX)

    def move(self):
        self.x += self.vx
        self.y += self.vy
        self.canvas.move(self.oval, self.vx, self.vy)

    def coords(self):
        return (self.x, self.y, self.x + self.size, self.y + self.size)

class PongGame:
    def __init__(self, root):
        self.root = root
        self.root.title("Pong - Single Player (2 paddles) with 2 balls")
        self.canvas = tk.Canvas(root, width=WIDTH, height=HEIGHT, bg="black")
        self.canvas.pack()

        # paddles
        left_x = 20
        right_x = WIDTH - 20 - PADDLE_WIDTH
        start_y = (HEIGHT - PADDLE_HEIGHT) // 2
        self.left_paddle = Paddle(self.canvas, left_x, start_y)
        self.right_paddle = Paddle(self.canvas, right_x, start_y)

        # balls
        mid_x = (WIDTH - BALL_SIZE) / 2
        mid_y = (HEIGHT - BALL_SIZE) / 2
        self.balls = [Ball(self.canvas, mid_x - 60, mid_y), Ball(self.canvas, mid_x + 60, mid_y)]

        # score / misses
        self.left_misses = 0
        self.right_misses = 0
        self.status_text = self.canvas.create_text(WIDTH/2, 20, fill="white", font=("Arial", 14), text=self._status())

        # key state
        self.keys = set()
        root.bind("<KeyPress>", self.on_key_down)
        root.bind("<KeyRelease>", self.on_key_up)

        self.running = True
        self.loop()

    def _status(self):
        return f"Left misses: {self.left_misses}    Right misses: {self.right_misses}"

    def on_key_down(self, event):
        key = event.keysym
        self.keys.add(key)

    def on_key_up(self, event):
        key = event.keysym
        self.keys.discard(key)

    def handle_input(self):
        # left paddle controls: W/S
        if 'w' in self.keys or 'W' in self.keys:
            self.left_paddle.move(-PADDLE_SPEED)
        if 's' in self.keys or 'S' in self.keys:
            self.left_paddle.move(PADDLE_SPEED)
        # right paddle controls: Up/Down arrows
        if 'Up' in self.keys:
            self.right_paddle.move(-PADDLE_SPEED)
        if 'Down' in self.keys:
            self.right_paddle.move(PADDLE_SPEED)

    def loop(self):
        if not self.running:
            return
        self.handle_input()

        for ball in self.balls:
            ball.move()
            bx1, by1, bx2, by2 = ball.coords()

            # top/bottom wall bounce
            if by1 <= 0:
                ball.vy = abs(ball.vy)
            if by2 >= HEIGHT:
                ball.vy = -abs(ball.vy)

            # left paddle collision
            lx1, ly1, lx2, ly2 = self.left_paddle.coords()
            if bx1 <= lx2 and by2 >= ly1 and by1 <= ly2 and ball.vx < 0:
                ball.vx = abs(ball.vx)
                # add slight random y change
                ball.vy += random.uniform(-2.5, 2.5)

            # right paddle collision
            rx1, ry1, rx2, ry2 = self.right_paddle.coords()
            if bx2 >= rx1 and by2 >= ry1 and by1 <= ry2 and ball.vx > 0:
                ball.vx = -abs(ball.vx)
                ball.vy += random.uniform(-2.5, 2.5)

            # left miss
            if bx2 < 0:
                self.left_misses += 1
                ball.reset((WIDTH - ball.size)/2, (HEIGHT - ball.size)/2)

            # right miss
            if bx1 > WIDTH:
                self.right_misses += 1
                ball.reset((WIDTH - ball.size)/2, (HEIGHT - ball.size)/2)

        self.canvas.itemconfig(self.status_text, text=self._status())

        # schedule next frame
        self.root.after(16, self.loop)


def main():
    root = tk.Tk()
    game = PongGame(root)
    root.mainloop()

if __name__ == '__main__':
    main()
