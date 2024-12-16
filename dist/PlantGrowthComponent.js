// Enum for plant growth state
export var PlantGrowthState;
(function (PlantGrowthState) {
    PlantGrowthState["Seed"] = "Seed";
    PlantGrowthState["Growth1"] = "Growth1";
    PlantGrowthState["Growth2"] = "Growth2";
    PlantGrowthState["Growth3"] = "Growth3";
    PlantGrowthState["FullyGrown"] = "FullyGrown";
})(PlantGrowthState || (PlantGrowthState = {}));
// PlantGrowthComponent class to handle the growth system 
export class PlantGrowthComponent {
    constructor(scene, x, y) {
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
    changeState(newState) {
        // Check if the new state is valid
        if (!this.growthImages[newState]) {
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
            duration: 500,
            ease: 'Power2',
        });
        this.scene.tweens.add({
            targets: this.plantImage,
            angle: { from: -2, to: 2 },
            duration: 1700,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1, // Repeat infinitely
        });
    }
    // Get the scale based on the growth state
    getScaleForState(state) {
        switch (state) {
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
    updatePlantPosition() {
        const screenWidth = this.scene.scale.width;
        const screenHeight = this.scene.scale.height;
        // Position the plant at the bottom-right corner with some padding
        const paddingX = 20;
        const paddingY = 0;
        this.plantImage.setPosition(screenWidth - paddingX, screenHeight - paddingY);
    }
}
