# Simulation Audio Files

This directory contains the audio files that will be played when the robot reaches each base during the simulation.

## Required Files

Place the following audio files in this directory:

1. **base1.mp3** - Audio to play when the robot reaches Base 1
2. **base2.mp3** - Audio to play when the robot reaches Base 2
3. **base3.mp3** - Audio to play when the robot reaches Base 3

## Audio File Guidelines

- **Format**: MP3 (recommended for web compatibility)
- **Duration**: Keep files between 5-30 seconds for optimal user experience
- **Content**: These should be informative messages about the museum exhibit at each base
- **Quality**: Use clear audio with minimal background noise

## Example Content

### Base 1 (base1.mp3)
"Welcome to the Yamaha Motor Company exhibition. Here you can learn about our history and innovation in motorcycle manufacturing."

### Base 2 (base2.mp3)
"This section showcases our latest technology and engineering achievements in electric mobility and sustainable transportation."

### Base 3 (base3.mp3)
"Thank you for visiting our exhibition. Feel free to ask me any questions about Yamaha Motor Company's products and history."

## How It Works

When the simulation runs:
1. The robot moves to a base
2. The corresponding audio file plays automatically
3. After the audio finishes, the bot waits for questions (5 seconds of silence or manual skip)
4. The bot moves to the next base and repeats the cycle
