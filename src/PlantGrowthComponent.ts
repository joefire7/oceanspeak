import Phaser from "phaser";
// Enum for plant growth state
 export enum PlantGrowthState{
    Seed = 'Seed',
    Growth1 = 'Growth1',
    Growth2 = 'Growth2',
    Growth3 = 'Growth3',
    FullyGrown = 'FullyGrown'
}

// PlantGrowthComponent class to handle the growth system 

export class PlantGrowthComponent {
    private plantImage!: Phaser.GameObjects.Image; // Plant Image
    private growthState: PlantGrowthState; // Current Growth State
    private scene: Phaser.Scene; // Reference to the scene
    private growthImages: {[key in PlantGrowthState]: string}; // Images for each growth state

    constructor(scene: Phaser.Scene, x: number, y: number){
        this.scene = scene;
        this.growthState = PlantGrowthState.Seed;

        // Define the images for each growth state
        this.growthImages = {
            [PlantGrowthState.Seed]: 'seed',
            [PlantGrowthState.Growth1]: 'growth1',
            [PlantGrowthState.Growth2]: 'growth2',
            [PlantGrowthState.Growth3]: 'growth3',
            [PlantGrowthState.FullyGrown]: 'fullyGrown',
        };

        // Add the initial plant image to the scene at the bottom-right corner
        this.plantImage = this.scene.add.image(0, 0, this.growthImages[this.growthState]);
        this.plantImage.setOrigin(1, 1); // Align origin to the bottom-right corner
        this.plantImage.setCrop(0, 1, this.plantImage.width, this.plantImage.height - 1);
        this.plantImage.setScale(0.5); // Initial Scale
        this.updatePlantPosition();
    }

    // Method to change the  plant's growth state
    public changeState(newState: PlantGrowthState): void {
        // Check if the new state is valid
        if(!this.growthImages[newState]){
            console.warn(`Invalid state: ${newState}`);
            return;
        }

        // Update the growth state
        this.growthState = newState;

        // Change the plant's image and scale based on the new state
        this.plantImage.setTexture(this.growthImages[newState]);

        // Adjust the scale based on the growth stage
        const newScale = this.getScaleForState(newState);

        this.scene.tweens.add({
            targets: this.plantImage,
            scaleX: newScale,
            scaleY: newScale,
            duration: 500, // Smooth transition
            ease: 'Power2',
        });

        this.scene.tweens.add({
            targets: this.plantImage,
            angle: { from: -2, to: 2 }, // Oscillate the angle for the sway effect
            duration: 1700, // Time for a complete wave (in ms)
            ease: 'Sine.easeInOut', // Smooth wave motion
            yoyo: true, // Reverse the animation back and forth
            repeat: -1, // Repeat infinitely
        });

    }

    // Get the scale based on the growth state
    private getScaleForState(state: PlantGrowthState) : number{
        switch(state){
            case PlantGrowthState.Seed:
                return 0.5;
            case PlantGrowthState.Growth1:
                return 0.7;
            case PlantGrowthState.Growth2:
                return 1.0;
            case PlantGrowthState.Growth3:
                return 1.3;
            case PlantGrowthState.FullyGrown:
                return 1.5;
            default:
                    return 1.0;
        }
    }

    private updatePlantPosition(): void {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;

        // Position the plant at the bottom-right corner with some padding
        const paddingX = 20;
        const paddingY = 0;
        this.plantImage.setPosition(screenWidth - paddingX, screenHeight - paddingY);
    }

}