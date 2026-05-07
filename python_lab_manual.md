# 🐍 Lab Manual: Python Programming Basics

**Subject:** Programming Fundamentals  
**Prepared by:** Ali Hunain  
**Roll No:** 2023-AG-9918  

---

## 📌 What's This Lab About?

Alright, so in this lab we're going to learn the very basics of Python — from scratch. No fancy stuff, no overwhelming jargon. Just you, your computer, and some simple code. By the end of this manual, you'll be comfortable writing small Python programs on your own. Trust me, it's easier than you think!

---

## Lab 1: Getting Started — Your First Python Program

### What is Python?

Python is one of the most popular programming languages out there. People use it for web development, data science, AI, automation — you name it. The best part? It reads almost like English, so you won't feel like you're decoding alien signals.

### Step 1: Check if Python is Installed

Open your **Command Prompt** (just search "cmd" in the Start menu) and type:

```
python --version
```

If you see something like `Python 3.12.0`, you're good to go. If not, download it from [python.org](https://www.python.org/downloads/) and install it (make sure to check **"Add Python to PATH"** during installation — don't skip this!).

### Step 2: Open the Python Shell

In the same command prompt, just type:

```
python
```

You'll see the `>>>` prompt. This is Python's interactive mode — you can type code here and it runs instantly. Pretty cool, right?

### Step 3: Write Your First Code!

Type this in the Python shell:

```python
print("Hello, World!")
```

Hit Enter. Boom 💥 — you just wrote your first Python program!

Let's also try some quick math:

```python
2 + 3
```

**Output Screenshot:**

![Python Hello World - Interactive Shell](C:\Users\ACS\.gemini\antigravity\brain\2f8bb8f1-5626-49a3-89c2-3376f204ad82\python_hello_world_1777905860391.png)

> [!TIP]
> You can use the Python shell like a calculator! Try `10 * 5`, `100 / 4`, or `2 ** 10` (that's 2 to the power of 10).

---

## Lab 2: Variables and Data Types

### What are Variables?

Think of variables as **labeled boxes** where you store stuff. You give the box a name, put something inside it, and whenever you need that thing — you just call the box by its name.

### Code Example: variables.py

Create a new file called `variables.py` and write this:

```python
# Variables and Data Types in Python
# Let's store some info about a student

name = "Ali"           # This is a string (text)
age = 20               # This is an integer (whole number)
cgpa = 3.75            # This is a float (decimal number)
is_student = True      # This is a boolean (True or False)

# Now let's print everything out
print("Name:", name)
print("Age:", age)
print("CGPA:", cgpa)
print("Is Student:", is_student)
```

Run it:

```
python variables.py
```

**Output Screenshot:**

![Variables Output](C:\Users\ACS\.gemini\antigravity\brain\2f8bb8f1-5626-49a3-89c2-3376f204ad82\python_variables_output_1777907227295.png)

### Quick Summary of Data Types

| Data Type | What It Stores        | Example           |
|-----------|-----------------------|-------------------|
| `str`     | Text                  | `"Hello"`         |
| `int`     | Whole numbers         | `42`              |
| `float`   | Decimal numbers       | `3.14`            |
| `bool`    | True or False         | `True`, `False`   |
| `list`    | Collection of items   | `[1, 2, 3]`      |

> [!NOTE]
> Python figures out the data type automatically — you don't have to declare it like in C or Java. This is called **dynamic typing**.

---

## Lab 3: Taking Input from the User

### Why Input?

So far we've been hardcoding values. But what if you want the user to type something? That's where `input()` comes in.

### Code Example: input_demo.py

```python
# Taking input from the user

name = input("What is your name? ")
age = input("How old are you? ")

# input() always returns a string, so we convert age to int
age = int(age)

print("Hello " + name + "! You are " + str(age) + " years old.")
print("You will turn " + str(age + 1) + " next year!")
```

Run it:

```
python input_demo.py
```

**Expected Output:**

```
What is your name? Ali
How old are you? 20
Hello Ali! You are 20 years old.
You will turn 21 next year!
```

> [!IMPORTANT]
> `input()` always gives you a **string**. If you need a number, wrap it with `int()` for whole numbers or `float()` for decimals. Forgetting this is one of the most common beginner mistakes!

---

## Lab 4: Arithmetic Operators

Python can do all the math you need. Here's a quick overview:

### Code Example: operators.py

```python
# Arithmetic Operators

a = 15
b = 4

print("a + b =", a + b)     # Addition
print("a - b =", a - b)     # Subtraction
print("a * b =", a * b)     # Multiplication
print("a / b =", a / b)     # Division (gives float)
print("a // b =", a // b)   # Floor Division (removes decimal)
print("a % b =", a % b)     # Modulus (remainder)
print("a ** b =", a ** b)   # Exponent (a to the power b)
```

**Expected Output:**

```
a + b = 19
a - b = 11
a * b = 60
a / b = 3.75
a // b = 3
a % b = 3
a ** b = 50625
```

> [!TIP]
> The `%` (modulus) operator is super useful when you want to check if a number is even or odd. If `num % 2 == 0`, it's even!

---

## Lab 5: Strings — Playing with Text

Strings are everywhere in Python. Let's learn some handy tricks.

### Code Example: strings.py

```python
# String Operations

message = "Hello, Python!"

# Basic operations
print(message.upper())         # HELLO, PYTHON!
print(message.lower())         # hello, python!
print(message.replace("Python", "World"))  # Hello, World!
print(len(message))            # 14 (length of string)

# String slicing — grabbing parts of a string
print(message[0:5])            # Hello (index 0 to 4)
print(message[7:])             # Python!
print(message[-1])             # ! (last character)

# f-strings — the modern way to format strings
name = "Ali"
age = 20
print(f"My name is {name} and I am {age} years old.")
```

**Expected Output:**

```
HELLO, PYTHON!
hello, python!
Hello, World!
14
Hello
Python!
!
My name is Ali and I am 20 years old.
```

> [!NOTE]
> **f-strings** (formatted string literals) are the cleanest way to insert variables into strings. Just put `f` before the quotes and use `{variable}` inside. Way better than concatenating with `+`.

---

## Lab 6: Lists — Storing Multiple Items

### What's a List?

A list is like a shopping bag — you can throw multiple items into it, access them by their position, add new ones, or remove old ones.

### Code Example: lists.py

```python
# Lists in Python

fruits = ["apple", "banana", "cherry", "mango"]

# Accessing items (index starts from 0)
print(fruits[0])          # apple
print(fruits[2])          # cherry
print(fruits[-1])         # mango (last item)

# Adding items
fruits.append("orange")
print(fruits)             # ['apple', 'banana', 'cherry', 'mango', 'orange']

# Removing items
fruits.remove("banana")
print(fruits)             # ['apple', 'cherry', 'mango', 'orange']

# Length of list
print("Total fruits:", len(fruits))   # 4

# Check if item exists
if "mango" in fruits:
    print("Yes, mango is in the list!")
```

**Expected Output:**

```
apple
cherry
mango
['apple', 'banana', 'cherry', 'mango', 'orange']
['apple', 'cherry', 'mango', 'orange']
Total fruits: 4
Yes, mango is in the list!
```

---

## Lab 7: Conditional Statements (if / elif / else)

### Making Decisions in Code

Sometimes your program needs to make choices — "if this happens, do that; otherwise, do something else." That's exactly what `if` statements are for.

### Code Example: conditions.py

```python
# Conditional Statements

marks = int(input("Enter your marks: "))

if marks >= 90:
    print("Grade: A+ — Outstanding! 🎉")
elif marks >= 80:
    print("Grade: A — Great job!")
elif marks >= 70:
    print("Grade: B — Good work!")
elif marks >= 60:
    print("Grade: C — You passed, keep it up!")
else:
    print("Grade: F — Don't worry, try harder next time! 💪")
```

**Example Run:**

```
Enter your marks: 85
Grade: A — Great job!
```

> [!IMPORTANT]
> Indentation matters in Python! The code inside `if`, `elif`, and `else` blocks **must** be indented (usually 4 spaces). If you mess up the indentation, Python will throw an `IndentationError`.

---

## Lab 8: Loops — For Loop & While Loop

Alright, here's the big one. Loops let you **repeat** a block of code multiple times without writing it over and over again. Imagine you want to print numbers 1 to 100 — you're not going to write 100 `print()` statements, right? That's where loops save your life.

Python gives you two types of loops:

### 🔁 The `for` Loop

The `for` loop is used when you **know in advance** how many times you want to repeat something. It goes through a sequence (like a list, a range of numbers, or a string) one item at a time.

**Basic Syntax:**

```python
for variable in sequence:
    # do something with variable
```

#### Example 1: Print numbers 1 to 5

```python
for i in range(1, 6):
    print(i)
```

**Output:**
```
1
2
3
4
5
```

> `range(1, 6)` gives you numbers from 1 to 5 (it stops **before** 6 — yeah, it's a bit weird at first, but you'll get used to it).

#### Example 2: Loop through a list

```python
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print("I like", fruit)
```

**Output:**
```
I like apple
I like banana
I like cherry
```

#### Example 3: Sum of numbers from 1 to 10

```python
total = 0

for num in range(1, 11):
    total = total + num

print("Sum of 1 to 10 is:", total)
```

**Output:**
```
Sum of 1 to 10 is: 55
```

#### Example 4: Multiplication table

```python
number = int(input("Enter a number: "))

print(f"\nMultiplication Table of {number}:")
for i in range(1, 11):
    print(f"{number} x {i} = {number * i}")
```

**Output (if user enters 5):**
```
Multiplication Table of 5:
5 x 1 = 5
5 x 2 = 10
5 x 3 = 15
5 x 4 = 20
5 x 5 = 25
5 x 6 = 30
5 x 7 = 35
5 x 8 = 40
5 x 9 = 45
5 x 10 = 50
```

---

### 🔄 The `while` Loop

The `while` loop is used when you **don't know** exactly how many times you need to repeat — you just keep going **as long as a condition is true**.

**Basic Syntax:**

```python
while condition:
    # do something
    # make sure the condition eventually becomes False!
```

> [!CAUTION]
> If you forget to change the condition inside the loop, it'll run **forever** (infinite loop). If that happens, press `Ctrl + C` in the terminal to stop it. We've all been there 😅

#### Example 1: Print numbers 1 to 5

```python
count = 1

while count <= 5:
    print("Count is:", count)
    count = count + 1     # Don't forget this line!

print("Done!")
```

**Output:**
```
Count is: 1
Count is: 2
Count is: 3
Count is: 4
Count is: 5
Done!
```

#### Example 2: Keep asking until user says "quit"

```python
while True:
    user_input = input("Type something (or 'quit' to exit): ")
    
    if user_input == "quit":
        print("Goodbye! 👋")
        break    # break exits the loop immediately
    
    print("You typed:", user_input)
```

**Example Run:**
```
Type something (or 'quit' to exit): hello
You typed: hello
Type something (or 'quit' to exit): python is fun
You typed: python is fun
Type something (or 'quit' to exit): quit
Goodbye! 👋
```

#### Example 3: Guessing game

```python
secret = 7
guess = 0

print("Guess the number (between 1 and 10)!")

while guess != secret:
    guess = int(input("Your guess: "))
    
    if guess < secret:
        print("Too low! Try again.")
    elif guess > secret:
        print("Too high! Try again.")
    else:
        print("🎉 Correct! You got it!")
```

**Output Screenshot (Loops):**

![For Loop and While Loop Output](C:\Users\ACS\.gemini\antigravity\brain\2f8bb8f1-5626-49a3-89c2-3376f204ad82\python_loops_output_1777906608760.png)

---

### For Loop vs While Loop — When to Use What?

| Feature          | `for` Loop                          | `while` Loop                       |
|------------------|--------------------------------------|-------------------------------------|
| **Use when**     | You know how many times to repeat   | You don't know, depends on a condition |
| **Iterates over**| A sequence (range, list, string)    | Runs while condition is `True`     |
| **Risk**         | Low (it stops on its own)           | Can cause infinite loop if careless |
| **Common use**   | Looping through lists, counting     | User input, waiting for events     |

---

## 🧠 Quick Revision Checklist

Before you close this manual, make sure you understand these:

- [  ] How to run Python and use the interactive shell
- [  ] Variables and the 4 main data types (`str`, `int`, `float`, `bool`)
- [  ] Taking user input with `input()` and converting types
- [  ] Arithmetic operators (`+`, `-`, `*`, `/`, `//`, `%`, `**`)
- [  ] String operations and f-strings
- [  ] Lists — creating, accessing, adding, removing items
- [  ] `if / elif / else` for decision making
- [  ] `for` loop — looping through sequences
- [  ] `while` loop — looping based on conditions
- [  ] The difference between `for` and `while` loops

---

## 💡 Final Tips

1. **Practice daily** — even 15 minutes a day makes a huge difference.
2. **Type the code yourself** — don't just copy-paste. Your fingers need to learn too.
3. **Break things on purpose** — remove a line, change a value, see what happens. That's how you learn.
4. **Google is your friend** — every programmer Googles stuff. It's not cheating, it's being smart.
5. **Don't be afraid of errors** — Python's error messages are actually pretty helpful once you learn to read them.

---

> *"The best way to learn programming is by programming."* — That's not a famous quote, I just made it up. But it's true. 😄

**Happy Coding! 🚀**
