import Phaser from "phaser";
class OceanSpeakGame extends Phaser.Scene {
    constructor() {
        super({ key: 'FishGame' });
    }
    preload() {
        this.load.image('fish', 'assets/fishTile_078.png'); // Replace with your fish asset
        this.load.image('waterBackground', 'assets/water.png');
        this.load.image('sandTop', 'assets/sandTile.png'); // / Top sand tile
        this.load.image('sandBottom', 'assets/sandTile2.png'); // Bottom sand tile
        this.load.image('resetButton', 'assets/resetButton.png');
    }
    create() {
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
    }
    update() {
        // Update the FPS counter
        const fps = Math.round(this.game.loop.actualFps);
        this.fpsText.setText(`FPS: ${fps}`);
        // Animate smooth swimming for all fish
        this.fishGroup.children.iterate((fish) => {
            const fishSprite = fish;
            fishSprite.y += Math.sin((this.time.now + fishSprite.x * 100) / 3000) * 5; // Slow and smooth sine wave
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
                // Interpolate positions for existing fish
                const fishSprite = existingFish.get(fishName);
                this.tweens.add({
                    targets: fishSprite,
                    x: fishData.x,
                    y: fishData.y,
                    duration: 500,
                    ease: 'Linear',
                });
                existingFish.delete(fishName);
            }
            else {
                // Add new fish
                const fish = this.fishGroup.create(fishData.x, fishData.y, 'fish').setInteractive();
                fish.name = fishName;
                fish.setScale(0.5);
                fish.on('pointerdown', () => {
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
            this.fishGroup.remove(fish, true, true);
        });
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
};
const game = new Phaser.Game(config);
