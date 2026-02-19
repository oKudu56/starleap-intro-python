import random
import turtle
import math

# ============ HOLLOW KNIGHT GAME ============

class Knight:
    def __init__(self, screen_width, screen_height):
        self.turtle = turtle.Turtle()
        self.turtle.shape("triangle")
        self.turtle.color("white")
        self.turtle.penup()
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.speed = 8
        self.x = 0
        self.y = 0
        self.health = 5  # Soul vessels
        self.max_health = 5
        self.soul = 3
        self.max_soul = 3
        self.is_attacking = False
        self.attack_cooldown = 0
        
    def move_up(self):
        self.y += self.speed
        if self.y > self.screen_height / 2 - 20:
            self.y = self.screen_height / 2 - 20
        self.turtle.goto(self.x, self.y)
    
    def move_down(self):
        self.y -= self.speed
        if self.y < -self.screen_height / 2 + 20:
            self.y = -self.screen_height / 2 + 20
        self.turtle.goto(self.x, self.y)
    
    def move_left(self):
        self.x -= self.speed
        if self.x < -self.screen_width / 2 + 20:
            self.x = -self.screen_width / 2 + 20
        self.turtle.setheading(180)
        self.turtle.goto(self.x, self.y)
    
    def move_right(self):
        self.x += self.speed
        if self.x > self.screen_width / 2 - 20:
            self.x = self.screen_width / 2 - 20
        self.turtle.setheading(0)
        self.turtle.goto(self.x, self.y)
    
    def attack(self):
        if self.attack_cooldown <= 0:
            self.is_attacking = True
            self.attack_cooldown = 15
            return True
        return False
    
    def take_damage(self, amount):
        self.health -= amount
        if self.health < 0:
            self.health = 0
    
    def heal(self):
        if self.health < self.max_health:
            self.health += 1
            return True
        return False
    
    def use_soul(self):
        if self.soul > 0:
            self.soul -= 1
            return True
        return False
    
    def update_cooldown(self):
        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1
        if self.is_attacking and self.attack_cooldown <= 10:
            self.is_attacking = False
    
    def get_position(self):
        return (self.x, self.y)


class Enemy:
    def __init__(self, x, y, enemy_type="Husk"):
        self.turtle = turtle.Turtle()
        self.turtle.penup()
        self.x = x
        self.y = y
        self.health = 2
        self.speed = 3
        self.direction = random.choice([-1, 1])
        self.enemy_type = enemy_type
        
        if enemy_type == "Husk":
            self.turtle.shape("circle")
            self.turtle.color("red")
            self.health = 2
        elif enemy_type == "Vengefly":
            self.turtle.shape("circle")
            self.turtle.color("orange")
            self.health = 1
            self.speed = 5
        
        self.turtle.goto(self.x, self.y)
    
    def move(self, screen_width, screen_height):
        self.x += self.speed * self.direction
        
        # Bounce off walls
        if self.x > screen_width / 2 - 20 or self.x < -screen_width / 2 + 20:
            self.direction *= -1
        
        self.turtle.goto(self.x, self.y)
    
    def take_damage(self):
        self.health -= 1
    
    def is_alive(self):
        return self.health > 0
    
    def get_position(self):
        return (self.x, self.y)
    
    def remove(self):
        self.turtle.hideturtle()


class Game:
    def __init__(self):
        # Screen setup
        self.screen = turtle.Screen()
        self.screen.setup(width=1000, height=700)
        self.screen.title("⚔️ HOLLOW KNIGHT ⚔️")
        self.screen.bgcolor("#1a1a1a")  # Dark background
        self.screen.tracer(0)  # Manual update for better control
        
        # Game objects
        self.knight = Knight(1000, 700)
        self.enemies = []
        self.spawn_timer = 0
        self.score = 0
        self.game_over = False
        self.paused = False
        
        # UI
        self.score_display = turtle.Turtle()
        self.score_display.hideturtle()
        self.score_display.penup()
        self.score_display.color("white")
        self.score_display.goto(-450, 300)
        
        self.health_display = turtle.Turtle()
        self.health_display.hideturtle()
        self.health_display.penup()
        self.health_display.color("red")
        self.health_display.goto(-450, 270)
        
        self.soul_display = turtle.Turtle()
        self.soul_display.hideturtle()
        self.soul_display.penup()
        self.soul_display.color("cyan")
        self.soul_display.goto(-450, 240)
        
        # Setup keyboard controls
        self.setup_controls()
        
        # Draw borders
        self.draw_borders()
    
    def draw_borders(self):
        border = turtle.Turtle()
        border.hideturtle()
        border.penup()
        border.color("gray")
        border.speed(0)
        
        # Draw rectangle border
        border.pendown()
        border.goto(-480, 330)
        border.goto(480, 330)
        border.goto(480, -330)
        border.goto(-480, -330)
        border.goto(-480, 330)
    
    def setup_controls(self):
        self.screen.onkey(self.knight.move_up, "w")
        self.screen.onkey(self.knight.move_down, "s")
        self.screen.onkey(self.knight.move_left, "a")
        self.screen.onkey(self.knight.move_right, "d")
        self.screen.onkey(self.knight.move_up, "Up")
        self.screen.onkey(self.knight.move_down, "Down")
        self.screen.onkey(self.knight.move_left, "Left")
        self.screen.onkey(self.knight.move_right, "Right")
        self.screen.onkey(self.attack, "space")
        self.screen.onkey(self.toggle_pause, "p")
        self.screen.listen()
    
    def attack(self):
        if self.knight.attack():
            # Check collision with enemies
            knight_pos = self.knight.get_position()
            for enemy in self.enemies[:]:
                enemy_pos = enemy.get_position()
                distance = math.sqrt((knight_pos[0] - enemy_pos[0])**2 + (knight_pos[1] - enemy_pos[1])**2)
                
                if distance < 30:  # Attack range
                    enemy.take_damage()
                    if not enemy.is_alive():
                        enemy.remove()
                        self.enemies.remove(enemy)
                        self.score += 10
    
    def toggle_pause(self):
        self.paused = not self.paused
    
    def spawn_enemy(self):
        if self.spawn_timer <= 0:
            x = random.randint(-400, 400)
            y = random.randint(-250, 250)
            enemy_type = random.choice(["Husk", "Vengefly"])
            self.enemies.append(Enemy(x, y, enemy_type))
            self.spawn_timer = 80  # Spawn every 80 frames
        else:
            self.spawn_timer -= 1
    
    def update_enemies(self):
        for enemy in self.enemies[:]:
            enemy.move(1000, 700)
            
            # Check collision with knight
            knight_pos = self.knight.get_position()
            enemy_pos = enemy.get_position()
            distance = math.sqrt((knight_pos[0] - enemy_pos[0])**2 + (knight_pos[1] - enemy_pos[1])**2)
            
            if distance < 20:
                self.knight.take_damage(1)
                if self.knight.health <= 0:
                    self.game_over = True
    
    def update_display(self):
        self.score_display.clear()
        self.score_display.write(f"Score: {self.score}", font=("Arial", 16, "normal"))
        
        self.health_display.clear()
        health_bar = "❤️ " * self.knight.health + "🖤 " * (self.knight.max_health - self.knight.health)
        self.health_display.write(f"{health_bar}", font=("Arial", 12, "normal"))
        
        self.soul_display.clear()
        soul_bar = "💫 " * self.knight.soul + "⭕ " * (self.knight.max_soul - self.knight.soul)
        self.soul_display.write(f"{soul_bar}", font=("Arial", 12, "normal"))
    
    def run(self):
        print("\n" + "="*50)
        print("⚔️  HOLLOW KNIGHT ⚔️")
        print("="*50)
        print("\n🎮 CONTROLS:")
        print("   W/A/S/D or Arrow Keys - Move")
        print("   SPACE - Attack enemies")
        print("   P - Pause/Resume")
        print("   Close window to exit\n")
        
        while not self.game_over:
            if not self.paused:
                self.spawn_enemy()
                self.update_enemies()
                self.knight.update_cooldown()
            
            self.update_display()
            self.screen.update()
        
        # Game Over
        game_over_text = turtle.Turtle()
        game_over_text.hideturtle()
        game_over_text.color("white")
        game_over_text.write("GAME OVER", align="center", font=("Arial", 40, "bold"))
        
        final_score = turtle.Turtle()
        final_score.hideturtle()
        final_score.color("yellow")
        final_score.goto(0, -50)
        final_score.write(f"Final Score: {self.score}", align="center", font=("Arial", 20, "normal"))
        
        self.screen.update()
        self.screen.mainloop()


# ============ RUN THE GAME ============
if __name__ == "__main__":
    game = Game()
    game.run()



# ============ RUN THE GAME ============
if __name__ == "__main__":
    game = Game()
    game.run()
