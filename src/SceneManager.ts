export class SceneManager {
    private scene: Phaser.Scene;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    // Create Background
    createBackground(key: string): Phaser.GameObjects.Image {
        const background = this.scene.add.image(0, 0, key);
        background.setOrigin(0, 0).setDisplaySize(
            this.scene.cameras.main.width,
            this.scene.cameras.main.height
        );
        background.setDepth(-2);
        return background;
    }

    // Create Sand Layers
    createSandLayer(key: string, y: number): Phaser.GameObjects.TileSprite {
        const sandLayer = this.scene.add.tileSprite(
            0,
            y,
            this.scene.cameras.main.width,
            64, // Tile height
            key
        );
        sandLayer.setOrigin(0, 0);
        sandLayer.setDepth(0);
        return sandLayer;
    }

    // General Image Creator
    createImage(
        key: string,
        x: number,
        y: number,
        origin: number[] = [0.5, 0.5],
        scale: number = 1,
        depth: number = 0
    ): Phaser.GameObjects.Image {
        const image = this.scene.add.image(x, y, key);
        image.setOrigin(origin[0], origin[1]);
        image.setScale(scale);
        image.setDepth(depth);
        return image;
    }

    // Create Waving Seaweed
    createAnimatedSeaweed(
        key: string,
        x: number,
        y: number,
        swayRange: number = 5,
        duration: number = 3000,
        origin: number[] = [0.5, 1],
        scale: number = 1
    ): Phaser.GameObjects.Image {
        const seaweed = this.scene.add.image(x, y, key);
        seaweed.setOrigin(origin[0], origin[1]);
        seaweed.setScale(scale);
        seaweed.setDepth(-1); // Ensure it appears behind the fish
        seaweed.setCrop(0, 1, seaweed.width, seaweed.height - 1); // Fix top pixel
    
        // Add waving animation
        this.scene.tweens.add({
            targets: seaweed,
            angle: { from: -swayRange, to: swayRange },
            duration: duration,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
        });
    
        return seaweed;
    }
    // Create Rock Obstacle with Animation
    createRockObstacle(
        key: string,
        x: number,
        y: number,
        scaleRange: number[] = [0.8, 1.2],
        duration: number = 1000
    ): Phaser.GameObjects.Image {
        const obstacle = this.createImage(key, x, y, [0.5, 0.5], 1, -1);
        obstacle.setName('rockObstacle');
        obstacle.setCrop(0, 1, obstacle.width, obstacle.height - 1); // Fix top pixel

        // Add animation: scale up and down
        this.scene.tweens.add({
            targets: obstacle,
            scale: { from: scaleRange[0], to: scaleRange[1] },
            duration: duration,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        });

        return obstacle;
    }

    // Create Buttons
    createButton(
        key: string,
        x: number,
        y: number,
        scale: number,
        callback: () => void
    ): Phaser.GameObjects.Image {
        const button = this.createImage(key, x, y, [0.5, 0.5], scale);
        button.setInteractive().on('pointerdown', callback);
        return button;
    }
}
