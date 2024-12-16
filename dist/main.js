import Phaser from "phaser";
import { PlantGrowthComponent } from "./PlantGrowthComponent";
import { PlantGrowthState } from "./PlantGrowthComponent";
class OceanSpeakGame extends Phaser.Scene {
    constructor() {
        super({ key: 'FishGame' });
        this.timeElapsed = 0;
        this.currentPlantStateIndex = 0;
        this.plantStates = [
            PlantGrowthState.Seed,
            PlantGrowthState.Growth1,
            PlantGrowthState.Growth2,
            PlantGrowthState.Growth3,
            PlantGrowthState.FullyGrown,
        ];
    }
    preload() {
        this.load.image('fish', 'assets/fishTile_078.png'); // Replace with your fish asset
        this.load.image('waterBackground', 'assets/water.png');
        this.load.image('sandTop', 'assets/sandTile.png'); // / Top sand tile
        this.load.image('sandBottom', 'assets/sandTile2.png'); // Bottom sand tile
        this.load.image('resetButton', 'assets/resetButton.png');
        this.load.image('speakButton', 'assets/speakButton.png');
        this.load.image('bubble', 'assets/bubble.png'); // Ensure this path is correct
        this.load.image('seaweed', 'assets/fishTile_052.png'); // Load the seaweed asset
        this.load.image('seaweed2', 'assets/fishTile_032.png'); // Load the seaweed asset
        this.load.image('seaweed3', 'assets/fishTile_033.png'); // Load the seaweed asset
        // Load images for all growth states
        this.load.image('seed', 'assets/seed.png');
        this.load.image('growth1', 'assets/growth1.png');
        this.load.image('growth2', 'assets/growth2.png');
        this.load.image('growth3', 'assets/growth3.png');
        this.load.image('fullyGrown', 'assets/fullyGrown.png');
        // Load Image for Rock obstacle
        this.load.image('rockObstacle', 'assets/rockObstacle.png');
    }
    create() {
        // Add the water background
        const background = this.add.image(0, 0, 'waterBackground');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);
        background.setDepth(-2);
        // Create the FPS text
        this.fpsText = this.add.text(10, 10, 'FPS: 0', {
            font: '16px Arial',
            color: '#000000',
        });
        this.fpsText.setDepth(1);
        this.cameras.main.setRoundPixels(true);
        // Add the tiled sand texture at the bottom using TileSprite
        /*   const tileHeight = 128;
          const startY = this.cameras.main.height - tileHeight; // Position at the bottom */
        // Add the sand tiles at the bottom using TileSprites
        const tileHeight = 64;
        const startYBottom = this.cameras.main.height - tileHeight; // Position at the bottom
        const startYAboveBottom = this.cameras.main.height - 2 * tileHeight; // Position right above the bottom tile
        // Bottom sand
        const sandBottomSprite = this.add.tileSprite(0, startYBottom, this.cameras.main.width, tileHeight, 'sandBottom');
        sandBottomSprite.setOrigin(0, 0);
        // Top sand (above bottom sand)
        const sandTopSprite = this.add.tileSprite(0, startYAboveBottom, this.cameras.main.width, tileHeight, 'sandTop');
        sandTopSprite.setOrigin(0, 0);
        // Add Reset Button
        const resetButton = this.add.image(this.cameras.main.width / 2, 30, 'resetButton');
        resetButton.setInteractive();
        resetButton.setScale(0.1); // Adjust Button size
        resetButton.on('pointerdown', () => {
            this.socket.send(JSON.stringify({ type: 'resetFish' }));
            console.log('Reset button clicked. Sent resetFish to server.');
        });
        // Add Speak Button
        const speakButton = this.add.image(this.cameras.main.width / 3, 30, 'speakButton');
        speakButton.setInteractive();
        speakButton.setScale(0.1); // Adjust Button size
        speakButton.on('pointerdown', () => {
            this.initSpeechRecognition();
            console.log('Speak button clicked. Now the child need to speak.');
        });
        // Initialize the fish group
        this.fishGroup = this.physics.add.group();
        console.log('Fish group initialized.');
        // Connect to the WebSocket server
        this.socket = new WebSocket('ws://localhost:8081');
        this.socket.onopen = () => {
            console.log('Connected to server');
        };
        this.socket.onmessage = (event) => {
            const data = JSON.parse(event.data);
            //console.log('Message received:', data);
            if (data.type === 'initial') {
                this.syncFish(data.fishes);
            }
            else if (data.type === 'update') {
                this.syncFish(data.fishes);
            }
        };
        // Add the seaweed to the scene
        const seaweed_1 = this.add.image(400, 300, 'seaweed');
        seaweed_1.setOrigin(0.5, -0.5); // Set the origin at the bottom center to pivot correctly
        seaweed_1.setCrop(0, 1, seaweed_1.width, seaweed_1.height - 1);
        seaweed_1.setScale(1); // Adjust scale if needed
        seaweed_1.setDepth(-1);
        // Create a waving animation using a tween
        this.tweens.add({
            targets: seaweed_1,
            angle: { from: -5, to: 5 },
            duration: 5000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // Repeat infinitely
        });
        const seaweed_2 = this.add.image(400, 300, 'seaweed');
        seaweed_2.setOrigin(-1, -0.6); // Set the origin at the bottom center to pivot correctly
        seaweed_2.setCrop(0, 1, seaweed_2.width, seaweed_2.height - 1);
        seaweed_2.setScale(1); // Adjust scale if needed
        seaweed_2.setDepth(-1);
        // Create a waving animation using a tween
        this.tweens.add({
            targets: seaweed_2,
            angle: { from: -6, to: 6 },
            duration: 4200,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // Repeat infinitely
        });
        const seaweed_3 = this.add.image(400, 300, 'seaweed2');
        seaweed_3.setOrigin(2, -1); // Set the origin at the bottom center to pivot correctly
        seaweed_3.setCrop(0, 1, seaweed_3.width, seaweed_3.height - 1);
        seaweed_3.setScale(0.8); // Adjust scale if needed
        seaweed_3.setDepth(-1);
        // Create a waving animation using a tween
        this.tweens.add({
            targets: seaweed_3,
            angle: { from: -4, to: 4 },
            duration: 1700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // Repeat infinitely
        });
        const seaweed_4 = this.add.image(400, 300, 'seaweed3');
        seaweed_4.setOrigin(3, -0.70); // Set the origin at the bottom center to pivot correctly
        seaweed_4.setCrop(0, 1, seaweed_4.width, seaweed_4.height - 1);
        seaweed_4.setScale(1); // Adjust scale if needed
        seaweed_4.setDepth(-1);
        // Create a waving animation using a tween
        this.tweens.add({
            targets: seaweed_4,
            angle: { from: -4, to: 4 },
            duration: 1700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // Repeat infinitely
        });
        // Create Rocks Obstacle
        const rockObstacle = this.add.image(400, 300, 'rockObstacle');
        rockObstacle.setName('rockObstacle');
        rockObstacle.setOrigin(0.5, 0.5);
        rockObstacle.setCrop(0, 1, rockObstacle.width, rockObstacle.height - 1);
        rockObstacle.setDepth(-1);
        // Add a tween to scale the rock up and down
        this.tweens.add({
            targets: rockObstacle,
            scale: { from: 0.8, to: 1.2 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut', // Smooth easing for the scale animation
        });
        // Initialize the Plant Growth System
        this.plantGrowthSystem = new PlantGrowthComponent(this, 0, 0);
        this.plantGrowthSystem.changeState(PlantGrowthState.Seed);
    }
    update(time, delta) {
        // Accumulate time smoothly using delta
        this.timeElapsed += delta;
        // Update the FPS counter
        const fps = Math.round(this.game.loop.actualFps);
        this.fpsText.setText(`FPS: ${fps}`);
        // Animate smooth swimming for all fish
        this.fishGroup.children.iterate((fish) => {
            const fishSprite = fish;
            // Skip sine wave logic if disabled
            this.checkFishCollision(fishSprite);
            if (fishSprite.getData('sineWaveDisabled') == 'true') {
            }
            else if (fishSprite.getData('sineWaveDisabled') == 'false') {
                const baseY = fishSprite.getData('baseY') || fishSprite.y; // Retrieve or default to current Y
                fishSprite.y = baseY + Math.sin((this.time.now + fishSprite.x * 100) / 3000) * 10; // Smooth sine wave
                return true; // Explicitly return true to satisfy TypeScript
            }
            return true; // Explicitly return true to satisfy TypeScript
        });
    }
    syncFish(fishes) {
        const existingFish = new Map();
        // Keep track of existing fish
        this.fishGroup.children.iterate((fish) => {
            const fishSprite = fish;
            existingFish.set(fishSprite.name, fishSprite);
            return true; // Explicitly return true to satisfy TypeScript
        });
        // Update or create new fish
        fishes.forEach((fishData) => {
            const fishName = fishData.id.toString();
            if (existingFish.has(fishName)) {
                // Update position for existing fish
                const fishSprite = existingFish.get(fishName);
                fishSprite.setData('baseY', /*fishSprite.getData('baseY') ||*/ fishData.y); // Ensure baseY is set
                fishSprite.setPosition(fishData.x, fishData.y);
                existingFish.delete(fishName);
            }
            else {
                // Add new fish
                const fish = this.fishGroup.create(fishData.x, fishData.y, 'fish').setInteractive();
                fish.name = fishName;
                fish.setScale(0.5);
                fish.setData('baseY', fishData.y); // Set baseY for sine wave animation
                fish.on('pointerdown', (pointer) => {
                    // Use current client-side position
                    // const fishX = fish.x;
                    // const fishY = fish.y;
                    fish.disableInteractive();
                    this.tweens.add({
                        targets: fish,
                        scaleX: { from: 0.5, to: 1.2 },
                        scaleY: { from: 0.5, to: 0.8 },
                        duration: 100,
                        yoyo: true,
                        onYoyo: () => {
                            this.tweens.add({
                                targets: fish,
                                scaleX: 0,
                                scaleY: 0,
                                alpha: 0,
                                duration: 100,
                                onComplete: () => {
                                    // Use the pointer's x and y for the bubble effect
                                    this.createBubbleEffect(pointer.x, pointer.y, pointer);
                                    console.log("Pointer x: " + pointer.x + " " + "Pointer y: " + pointer.y);
                                    fish.destroy();
                                    this.socket.send(JSON.stringify({ type: 'fishDestroyed', id: parseInt(fish.name) }));
                                },
                            });
                        },
                    });
                });
            }
        });
        // Remove leftover fish
        existingFish.forEach((fish) => {
            const fishSprite = fish;
            console.log(`Removing fish and creating bubbles at (${fishSprite.x}, ${fishSprite.y})`); // Debugging log
            //this.createBubbleEffect(fishSprite.x, fishSprite.y); // Create bubble effect before removing
            this.fishGroup.remove(fishSprite, true, true);
        });
    }
    createBubbleEffect(x, y, pointer) {
        const particles = this.add.particles(x, y, 'bubble', {
            x: pointer.deltaX,
            y: pointer.deltaY,
            speed: { min: 50, max: 100 },
            scale: { start: 2.5, end: 0 },
            lifespan: 1000,
            quantity: 20,
            frequency: -1, // Emit all particles at once
        }); // Updated to pass position directly
        // Set the emitter's position to the fish's position
        //particles.setPosition(x,y);
        // Trigger the burst effect
        particles.explode(10, pointer.deltaX, pointer.deltaY);
        // Destroy the particle system after a short time
        this.time.delayedCall(1000, () => {
            particles.destroy();
        });
    }
    initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.error('SpeechRecognition API is not supported in this browser.');
            return;
        }
        // Initialize SpeechRecognition
        this.speechRecognition = new SpeechRecognition();
        this.speechRecognition.continuous = true; // Keep listening continuously
        this.speechRecognition.interimResults = false; // Only final results
        this.speechRecognition.lang = 'en'; // Set to English (United States)
        // Start the recognition process
        this.speechRecognition.start();
        // Handle the result event
        this.speechRecognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log(`You said: ${transcript}`);
            if (transcript.includes('grow') || transcript.includes('go')) {
                console.log('Grow command detected!');
                this.growPlant(); // Trigger the plant growth system
            }
        };
        // Handle errors
        this.speechRecognition.onerror = (event) => {
            console.error(`Speech recognition error: ${event.error}`);
            if (event.error === 'language-not-supported') {
                console.log('The selected language is not supported. Stopping recognition.');
                this.speechRecognition.stop();
            }
        };
        // Restart on end
        this.speechRecognition.onend = () => {
            console.log('Speech recognition ended. Restarting...');
            this.speechRecognition.start();
        };
    }
    growPlant() {
        // Check if there is a next growth state
        if (this.currentPlantStateIndex < this.plantStates.length) {
            const nextState = this.plantStates[this.currentPlantStateIndex];
            this.plantGrowthSystem.changeState(nextState);
            this.currentPlantStateIndex++;
        }
        else {
            console.log('Plant is fully grown!');
        }
    }
    checkFishCollision(fish) {
        // Example check the collision with Obstacle
        const obstacle = this.children.getByName('rockObstacle');
        if (obstacle && Phaser.Math.Distance.Between(fish.x, fish.y, obstacle.x, obstacle.y) < 100) {
            console.log("Fish close to OBSTACLE, deciding avoidance direction.");
            // Disable sine wave updates temporarily
            fish.setData('sineWaveDisabled', true);
            let targetY;
            // Decide whether to move up or down
            if (fish.y < obstacle.y) {
                // Fish is above the obstacle, move up
                targetY = Math.max(50, fish.y - 150); // Avoid moving beyond the top
                console.log("Moving fish up to avoid obstacle.");
            }
            else {
                // Fish is below the obstacle, move down
                targetY = Math.min(this.cameras.main.height - 50, fish.y + 150); // Avoid moving beyond the bottom
                console.log("Moving fish down to avoid obstacle.");
            }
            const targetX = fish.x + 150; // Move forward horizontally
            // Smoothly move the fish to the target position
            this.tweens.add({
                targets: fish,
                x: targetX,
                y: targetY,
                duration: 1000,
                ease: 'Power2',
                onUpdate: (tween, target) => {
                    // Calculate and sync current Y position during tween
                    const progress = tween.progress; // Progress of the tween (0 to 1)
                    const currentY = Phaser.Math.Linear(fish.y, targetY, progress); // Linear interpolation
                    fish.setData('baseY', currentY); // Update baseY during tween
                },
                onComplete: () => {
                    // Ensure the sine wave logic starts from the new position
                    fish.setData('baseY', targetY); // Finalize baseY after tween
                    fish.setData('sineWaveDisabled', false); // Re-enable sine wave logic
                    console.log(`Tween complete. Fish moved to (${targetX}, ${targetY}). BaseY set to: ${targetY}`);
                    // Notify the server about the new position
                    this.socket.send(JSON.stringify({
                        type: 'updateFishPosition',
                        id: parseInt(fish.name),
                        x: targetX,
                        y: targetY,
                    }));
                },
            });
        }
    }
}
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0, x: 0 },
            debug: false,
        },
    },
    scene: OceanSpeakGame,
    pixelArt: false,
    antialias: true, // Disable anti-aliasing
};
const game = new Phaser.Game(config);
