import random
import turtle
import math

# ============ HOLLOW KNIGHT - STORY MODE ============

class Knight:
    def __init__(self, screen_width, screen_height):
        self.turtle = turtle.Turtle()
        self.turtle.shape("triangle")
        self.turtle.color("white")
        self.turtle.penup()
        self.screen_width = screen_width
        self.screen_height = screen_height
        self.speed = 15
        self.x = 0
        self.y = 0
        self.health = 5
        self.max_health = 5
        self.soul = 3
        self.max_soul = 3
        self.is_attacking = False
        self.attack_cooldown = 0
        self.attack_power = 2
        
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
    
    def heal(self, amount=1):
        self.health += amount
        if self.health > self.max_health:
            self.health = self.max_health
    
    def use_soul(self):
        if self.soul > 0:
            self.soul -= 1
            return True
        return False
    
    def restore_soul(self, amount=1):
        self.soul += amount
        if self.soul > self.max_soul:
            self.soul = self.max_soul
    
    def update_cooldown(self):
        if self.attack_cooldown > 0:
            self.attack_cooldown -= 1
        if self.is_attacking and self.attack_cooldown <= 10:
            self.is_attacking = False
    
    def get_position(self):
        return (self.x, self.y)


class Boss:
    def __init__(self, x, y, boss_name, health, attack, speed=2):
        self.turtle = turtle.Turtle()
        self.turtle.penup()
        self.x = x
        self.y = y
        self.name = boss_name
        self.health = health
        self.max_health = health
        self.attack_power = attack
        self.speed = speed
        self.direction = random.choice([-1, 1])
        self.attack_timer = 0
        self.pattern = 0
        
        # Customize boss appearance
        self.turtle.shape("square")
        self.turtle.shapesize(2, 2)
        self.turtle.color("darkred")
        self.turtle.goto(self.x, self.y)
    
    def move_pattern(self, screen_width, screen_height):
        # Boss movement pattern
        self.pattern += 1
        
        if self.pattern % 3 == 0:
            self.x += self.speed * self.direction
        else:
            self.y += random.randint(-2, 2)
        
        # Keep in bounds
        if self.x > screen_width / 2 - 40 or self.x < -screen_width / 2 + 40:
            self.direction *= -1
        if self.y > screen_height / 2 - 40:
            self.y = screen_height / 2 - 40
        if self.y < -screen_height / 2 + 40:
            self.y = -screen_height / 2 + 40
        
        self.turtle.goto(self.x, self.y)
    
    def take_damage(self, amount):
        self.health -= amount
    
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
        self.screen.title("⚔️ HOLLOW KNIGHT - STORY MODE ⚔️")
        self.screen.bgcolor("#1a1a1a")
        self.screen.tracer(0)
        
        # Game state
        self.knight = Knight(1000, 700)
        self.boss = None
        self.current_chapter = 0
        self.chapters_completed = 0
        self.game_over = False
        self.victory = False
        self.boss_defeated = False
        self.battle_timer = 0
        
        # Story presentation
        self.chapter_title = turtle.Turtle()
        self.chapter_title.hideturtle()
        self.chapter_title.penup()
        self.chapter_title.color("gold")
        self.chapter_title.goto(0, 320)
        
        self.chapter_text = turtle.Turtle()
        self.chapter_text.hideturtle()
        self.chapter_text.penup()
        self.chapter_text.color("white")
        self.chapter_text.goto(0, 280)
        
        self.health_display = turtle.Turtle()
        self.health_display.hideturtle()
        self.health_display.penup()
        self.health_display.color("lime")
        self.health_display.goto(-420, 320)
        
        self.boss_health_display = turtle.Turtle()
        self.boss_health_display.hideturtle()
        self.boss_health_display.penup()
        self.boss_health_display.color("red")
        self.boss_health_display.goto(200, 320)
        
        # Setup controls
        self.setup_controls()
        
        # Story chapters
        self.chapters = [
            {
                "title": "Chapter 1: The Gate",
                "dialogue": "The infection spreads... You must find the King.",
                "boss_name": "Husk Guard Captain",
                "boss_health": 5,
                "boss_attack": 1
            },
            {
                "title": "Chapter 2: Royal Waterways",
                "dialogue": "The waterways are corrupted. A greater threat awaits...",
                "boss_name": "Vengefly King",
                "boss_health": 8,
                "boss_attack": 2
            },
            {
                "title": "Chapter 3: The Abyss",
                "dialogue": "You descend deeper into darkness...",
                "boss_name": "The Infected Knight",
                "boss_health": 12,
                "boss_attack": 3
            },
            {
                "title": "Chapter 4: The Source of Infection",
                "dialogue": "Face the source of all corruption!",
                "boss_name": "The Radiance",
                "boss_health": 15,
                "boss_attack": 4
            }
        ]
    
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
        self.screen.listen()
    
    def show_chapter_intro(self):
        if self.current_chapter >= len(self.chapters):
            self.victory = True
            return
        
        chapter = self.chapters[self.current_chapter]
        self.chapter_title.clear()
        self.chapter_text.clear()
        
        self.chapter_title.write(chapter["title"], align="center", font=("Arial", 20, "bold"))
        self.chapter_text.write(chapter["dialogue"], align="center", font=("Arial", 12, "normal"))
        
        # Create boss for this chapter
        self.boss = Boss(200, 100, chapter["boss_name"], chapter["boss_health"], chapter["boss_attack"])
        self.boss_defeated = False
    
    def attack(self):
        if self.boss and self.knight.attack():
            knight_pos = self.knight.get_position()
            boss_pos = self.boss.get_position()
            distance = math.sqrt((knight_pos[0] - boss_pos[0])**2 + (knight_pos[1] - boss_pos[1])**2)
            
            if distance < 50:
                damage = self.knight.attack_power + random.randint(0, 2)
                self.boss.take_damage(damage)
                
                if not self.boss.is_alive():
                    self.boss_defeated = True
                    self.chapters_completed += 1
                    self.knight.heal(2)
                    self.knight.restore_soul(2)
    
    def update_boss_battle(self):
        if not self.boss or not self.boss.is_alive():
            return
        
        self.boss.move_pattern(1000, 700)
        self.battle_timer += 1
        
        # Boss attacks back
        if self.battle_timer % 60 == 0:
            boss_pos = self.boss.get_position()
            knight_pos = self.knight.get_position()
            distance = math.sqrt((knight_pos[0] - boss_pos[0])**2 + (knight_pos[1] - boss_pos[1])**2)
            
            if distance < 100:
                damage = self.boss.attack_power + random.randint(0, 2)
                self.knight.take_damage(damage)
                
                if self.knight.health <= 0:
                    self.game_over = True
    
    def update_display(self):
        self.health_display.clear()
        health_bar = "[" + "█" * self.knight.health + "░" * (self.knight.max_health - self.knight.health) + "]"
        self.health_display.write(f"HP: {health_bar}", font=("Arial", 10, "normal"))
        
        if self.boss and self.boss.is_alive():
            self.boss_health_display.clear()
            boss_bar = "[" + "█" * self.boss.health + "░" * (self.boss.max_health - self.boss.health) + "]"
            self.boss_health_display.write(f"Boss: {boss_bar}", font=("Arial", 10, "normal"))
    
    def progress_chapter(self):
        if self.boss_defeated:
            self.current_chapter += 1
            self.chapter_title.clear()
            self.chapter_text.clear()
            
            if self.current_chapter < len(self.chapters):
                victory_msg = f"✓ {self.chapters[self.current_chapter - 1]['boss_name']} defeated!"
                self.chapter_text.color("lightgreen")
                self.chapter_text.write(victory_msg, align="center", font=("Arial", 12, "normal"))
                self.battle_timer = 0
            else:
                self.victory = True
    
    def run(self):
        print("\n" + "="*60)
        print("⚔️  HOLLOW KNIGHT - STORY MODE ⚔️")
        print("="*60)
        print("\n📖 STORY:")
        print("   Hallownest is infected. The Radiance spreads corruption.")
        print("   As the Knight, you must fight through the infection,")
        print("   defeat powerful bosses, and restore peace to the kingdom.")
        print("\n🎮 CONTROLS:")
        print("   W/A/S/D or Arrow Keys - Move")
        print("   SPACE - Attack boss")
        print("   Close window to end game\n")
        print("="*60 + "\n")
        
        # Start first chapter
        self.show_chapter_intro()
        
        while not self.game_over and not self.victory:
            # Update game state
            self.knight.update_cooldown()
            self.update_boss_battle()
            self.update_display()
            
            # Check for chapter progression
            if self.boss_defeated:
                self.progress_chapter()
                if self.current_chapter < len(self.chapters):
                    self.show_chapter_intro()
            
            self.screen.update()
        
        # End screen
        self.chapter_title.clear()
        self.chapter_text.clear()
        
        if self.victory:
            self.chapter_title.color("gold")
            self.chapter_title.write("VICTORY", align="center", font=("Arial", 40, "bold"))
            self.chapter_text.color("lightgreen")
            self.chapter_text.write(f"You defeated all bosses and restored Hallownest!", 
                              align="center", font=("Arial", 14, "normal"))
        else:
            self.chapter_title.color("red")
            self.chapter_title.write("GAME OVER", align="center", font=("Arial", 40, "bold"))
            self.chapter_text.color("gray")
            self.chapter_text.write(f"You completed {self.chapters_completed} chapters...", 
                              align="center", font=("Arial", 14, "normal"))
        
        self.screen.update()
        self.screen.mainloop()


# ============ RUN THE GAME ============
if __name__ == "__main__":
    game = Game()
    game.run()
