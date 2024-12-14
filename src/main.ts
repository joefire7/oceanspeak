import Phaser from "phaser";

class OceanSpeakGame extends Phaser.Scene {
    private fishGroup!: Phaser.Physics.Arcade.Group;
    private socket!: WebSocket;
    private fpsText!: Phaser.GameObjects.Text;
    private timeElapsed: number = 0;

    constructor() {
        super({ key: 'FishGame' });
    }

    preload(): void {
        this.load.image('fish', 'assets/fishTile_078.png'); // Replace with your fish asset
        this.load.image('waterBackground', 'assets/water.png');
        this.load.image('sandTop', 'assets/sandTile.png'); // / Top sand tile
        this.load.image('sandBottom', 'assets/sandTile2.png'); // Bottom sand tile
        this.load.image('resetButton', 'assets/resetButton.png');
        this.load.image('bubble', 'assets/bubble.png'); // Ensure this path is correct
    }

    create(): void {
        // Add the water background
        const background = this.add.image(0, 0, 'waterBackground');
        background.setOrigin(0, 0);
        background.setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // Create the FPS text
        this.fpsText = this.add.text(10, 10, 'FPS: 0', {
            font: '16px Arial',
            color: '#000000',
        });
        this.fpsText.setDepth(1);

        // Add the tiled sand texture at the bottom using TileSprite
      /*   const tileHeight = 128;
        const startY = this.cameras.main.height - tileHeight; // Position at the bottom */

         // Add the sand tiles at the bottom using TileSprites
        const tileHeight = 64;
        const startYBottom = this.cameras.main.height - tileHeight; // Position at the bottom
        const startYAboveBottom = this.cameras.main.height - 2 * tileHeight; // Position right above the bottom tile

        // Bottom sand
        const sandBottomSprite = this.add.tileSprite(
            0,
            startYBottom,
            this.cameras.main.width,
            tileHeight,
            'sandBottom'
        );
        sandBottomSprite.setOrigin(0, 0);

        // Top sand (above bottom sand)
        const sandTopSprite = this.add.tileSprite(
            0,
            startYAboveBottom,
            this.cameras.main.width,
            tileHeight,
            'sandTop'
        );
        sandTopSprite.setOrigin(0, 0);

        // Add Reset Button
        const resetButton = this.add.image(this.cameras.main.width / 2, 30, 'resetButton')
        resetButton.setInteractive();
        resetButton.setScale(0.1); // Adjust Button size

        resetButton.on('pointerdown', () => {
            this.socket.send(JSON.stringify({type: 'resetFish'}));
            console.log('Reset button clicked. Sent resetFish to server.');
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
            } else if (data.type === 'update') {
                this.syncFish(data.fishes);
            }
        };
    }

    update(time: number, delta: number): void {
        // Accumulate time smoothly using delta
        this.timeElapsed += delta;
    
        // Update the FPS counter
        const fps = Math.round(this.game.loop.actualFps);
        this.fpsText.setText(`FPS: ${fps}`);
    
         // Animate smooth swimming for all fish
        this.fishGroup.children.iterate((fish) => {
        const fishSprite = fish as Phaser.Physics.Arcade.Sprite;
        const baseY = fishSprite.getData('baseY') || fishSprite.y; // Retrieve or default to current Y
        fishSprite.y = baseY + Math.sin((this.time.now + fishSprite.x * 100) / 3000) * 10; // Smooth sine wave
        return true; // Explicitly return true to satisfy TypeScript
    });
    }

    private syncFish(fishes: { id: number; x: number; y: number }[]): void {
        const existingFish = new Map<string, Phaser.Physics.Arcade.Sprite>();
    
        // Keep track of existing fish
        this.fishGroup.children.iterate((fish) => {
            const fishSprite = fish as Phaser.Physics.Arcade.Sprite;
            existingFish.set(fishSprite.name, fishSprite);
            return true; // Explicitly return true to satisfy TypeScript
        });
    
        // Update or create new fish
        fishes.forEach((fishData) => {
            const fishName = fishData.id.toString();
            if (existingFish.has(fishName)) {
                // Update position for existing fish
                const fishSprite = existingFish.get(fishName) as Phaser.Physics.Arcade.Sprite;
                fishSprite.setData('baseY', fishSprite.getData('baseY') || fishData.y); // Ensure baseY is set
                fishSprite.setPosition(fishData.x, fishData.y);
                existingFish.delete(fishName);
            } else {
                // Add new fish
                const fish = this.fishGroup.create(fishData.x, fishData.y, 'fish').setInteractive();
                fish.name = fishName;
                fish.setScale(0.5);
                fish.setData('baseY', fishData.y); // Set baseY for sine wave animation
    
                fish.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
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
                                    console.log("Pointer x: " + pointer.x + " " + "Pointer y: " + pointer.y)
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
            const fishSprite = fish as Phaser.Physics.Arcade.Sprite;
            console.log(`Removing fish and creating bubbles at (${fishSprite.x}, ${fishSprite.y})`); // Debugging log
            //this.createBubbleEffect(fishSprite.x, fishSprite.y); // Create bubble effect before removing
            this.fishGroup.remove(fishSprite, true, true);
        });
    }
    
    private createBubbleEffect(x: number, y: number, pointer: Phaser.Input.Pointer): void {
        const particles = this.add.particles(x, y, 'bubble', {
            x: pointer.deltaX,
            y: pointer.deltaY,
            speed: { min: 50, max: 100 }, // Bubble speed
            scale: { start: 2.5, end: 0 }, // Shrink bubbles as they move
            lifespan: 1000, // Duration of bubbles
            quantity: 20, // Number of bubbles per burst
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
}

const config: Phaser.Types.Core.GameConfig = {
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
};

const game = new Phaser.Game(config);