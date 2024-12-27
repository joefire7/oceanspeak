Ocean Speak - Speech Therapy Game Assessment

Game Concept

Create "Ocean Speak," an interactive underwater world where children's speech creates beautiful interactions with sea life. Fish and underwater plants respond to different speech sounds, creating a living, breathing ecosystem that encourages practice through peaceful play.

## Phaser Game Documentation

### Overview
This document explains the functionality of the OceanSpeakGame implemented in Phaser with TypeScript. The game involves interactive fishes, environmental animations, and a plant growth system, all synchronized with a WebSocket server.

### Code Breakdown

#### 1. Initialization and Preloading

The `preload` method loads all necessary assets for the game:
- **Fish sprite**: Used for displaying fishes.
- **Background assets**: Includes water, sand layers, and obstacles.
- **Button sprites**: Includes reset and speak buttons.
- **Other assets**: Includes bubbles, seaweed, and plant growth states.

Example:
```typescript
this.load.image('fish', 'assets/fishTile_078.png');
this.load.image('waterBackground', 'assets/water.png');
this.load.image('bubble', 'assets/bubble.png');
```

#### 2. Game Setup

The `create` method sets up the game environment:
- **FPS Counter**: Displays the current frames per second.
- **Fish Group**: Initializes a group to manage fish entities.
- **WebSocket Connection**: Connects to the WebSocket server.
- **SceneManager**: Manages background and UI components like buttons and obstacles.

Example FPS Counter setup:
```typescript
this.fpsText = this.add.text(10, 10, 'FPS: 0', {
    font: '16px Arial',
    color: '#000000',
});
```

The `create` method also includes setting up interactive buttons and initializing the Plant Growth System. These components provide functionality for resetting fishes, activating speech recognition, and animating environmental elements like seaweed.

#### 3. WebSocket Integration

##### Events:
- **`onopen`**: Logs successful connection.
- **`onmessage`**: Handles messages from the server:
  - `initial`: Syncs fish states.
  - `update`: Updates fish positions.

Example WebSocket setup:
```typescript
this.socket = new WebSocket('ws://localhost:8081');
this.socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'initial') {
        this.syncFish(data.fishes);
    } else if (data.type === 'update') {
        this.syncFish(data.fishes);
    }
};
```

#### 4. Fish Management

##### Fish Group:
Fishes are managed using a `Phaser.Physics.Arcade.Group`. Each fish has:
- **Position (`x`, `y`)**.
- **BaseY**: For sine wave movement.
- **Interactive Events**: Allow fish to respond to user clicks.

##### Sine Wave Animation:
Applies a smooth sine wave to fish movements in the `update` method:
```typescript
fishSprite.y = baseY + Math.sin((this.time.now + fishSprite.x * 100) / 3000) * 10;
```

##### Interaction:
Fishes can be destroyed by user clicks:
```typescript
fish.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
    fish.disableInteractive();
    this.destroyFish(fish, pointer);
});
```

#### 5. Destroying Fishes

When a fish is clicked:
1. A tween scales the fish up and down.
2. Bubble particles are emitted.
3. The fish is destroyed, and a `fishDestroyed` message is sent to the server.

Example:
```typescript
this.socket.send(
    JSON.stringify({ type: 'fishDestroyed', id: parseInt(fish.name) })
);
```

#### 6. Plant Growth System

The plant growth system is managed using a `PlantGrowthComponent`. States include:
- Seed
- Growth1
- Growth2
- Growth3
- FullyGrown

State transitions are triggered by speech commands or game events.

Example state change:
```typescript
this.plantGrowthSystem.changeState(nextState);
```

#### 7. Collision Detection

Fish collision with obstacles is handled in `checkFishCollision`. Fishes avoid obstacles by adjusting their position.

Example:
```typescript
if (Phaser.Math.Distance.Between(fish.x, fish.y, obstacle.x, obstacle.y) < 100) {
    // Adjust fish position
}
```

#### 8. Game Loop (`update` Method)

The `update` method in Phaser is the main game loop that runs continuously. It is responsible for updating the game state, managing animations, and ensuring smooth interactions.

##### Purpose of the `update` Method
1. **Track Time**:
   - The method accumulates time using `delta` for precise control over animations and calculations.
   ```typescript
   this.timeElapsed += delta;
   ```

2. **Update FPS Counter**:
   - Tracks and displays the current frames per second.
   ```typescript
   const fps = Math.round(this.game.loop.actualFps);
   this.fpsText.setText(`FPS: ${fps}`);
   ```

3. **Animate Fishes**:
   - Iterates through all fish in the `fishGroup` and updates their positions using a sine wave animation for a smooth swimming effect.
   ```typescript
   this.fishGroup.children.iterate((fish) => {
       const fishSprite = fish as Phaser.Physics.Arcade.Sprite;
       this.checkFishCollision(fishSprite);
       if (fishSprite.getData('sineWaveDisabled') !== 'true') {
           const baseY = fishSprite.getData('baseY') || fishSprite.y;
           fishSprite.y = baseY + Math.sin((this.time.now + fishSprite.x * 100) / 3000) * 10;
       }
       return true;
   });
   ```

4. **Check Collisions**:
   - Ensures fishes avoid obstacles dynamically by modifying their `x` and `y` positions.
   ```typescript
   this.checkFishCollision(fishSprite);
   ```

##### Key Features in the `update` Method

1. **Sine Wave Animation**:
   - Smoothly animates the vertical position (`y`) of fishes based on a sine function.
   - This creates a natural swimming motion.
   ```typescript
   fishSprite.y = baseY + Math.sin((this.time.now + fishSprite.x * 100) / 3000) * 10;
   ```

2. **Collision Detection**:
   - Ensures fishes avoid obstacles dynamically by modifying their `x` and `y` positions.
   ```typescript
   if (Phaser.Math.Distance.Between(fish.x, fish.y, obstacle.x, obstacle.y) < 100) {
       // Adjust position to avoid the obstacle
   }
   ```

3. **Optimization with Flags**:
   - Prevents unnecessary calculations using flags like `sineWaveDisabled` for fishes not currently animated.

4. **Real-time Interaction**:
   - Ensures that any interactive changes (like clicks or collisions) are immediately reflected in the game state.

#### 9. Utility Functions

##### Sending Commands
The `sendMoveCommand` method sends a message to the WebSocket server to update a fish's position:
```typescript
private sendMoveCommand(fishId: number, targetX: number, targetY: number): void {
    this.socket.send(
        JSON.stringify({
            type: 'moveFish',
            id: fishId,
            targetX: targetX,
            targetY: targetY,
        })
    );
}
```

##### Creating Bubble Effect
Generates a bubble effect when a fish is destroyed:
```typescript
private createBubbleEffect(x: number, y: number, pointer: Phaser.Input.Pointer): void {
    const particles = this.add.particles(x, y, 'bubble', {
        x: pointer.deltaX,
        y: pointer.deltaY,
        speed: { min: 50, max: 100 },
        scale: { start: 2.5, end: 0 },
        lifespan: 1000,
        quantity: 20,
        frequency: -1,
    });

    particles.explode(10, pointer.deltaX, pointer.deltaY);

    this.time.delayedCall(1000, () => {
        particles.destroy();
    });
}
```

##### Syncing Fish States
The `syncFish` method synchronizes fish states received from the server:
```typescript
private syncFish(fishes: { id: number; x: number; y: number }[] | undefined): void {
    if (!fishes || !Array.isArray(fishes)) {
        console.error('Invalid fishes data:', fishes);
        return;
    }

    const existingFish = new Map<string, Phaser.Physics.Arcade.Sprite>();

    this.fishGroup.children.iterate((fish) => {
        const fishSprite = fish as Phaser.Physics.Arcade.Sprite;
        existingFish.set(fishSprite.name, fishSprite);
        return true;
    });

    fishes.forEach((fishData) => {
        const fishName = fishData.id.toString();
        if (existingFish.has(fishName)) {
            const fishSprite = existingFish.get(fishName) as Phaser.Physics.Arcade.Sprite;
            fishSprite.setPosition(fishData.x, fishData.y);
            fishSprite.setData('baseY', fishData.y);
            existingFish.delete(fishName);
        } else {
            const fish = this.fishGroup.create(fishData.x, fishData.y, 'fish');
            fish.setInteractive();
            fish.name = fishName;
            fish.setScale(0.5);
            fish.setData('baseY', fishData.y);

            fish.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                fish.disableInteractive();
                this.destroyFish(fish, pointer);
            });
        }
    });

    existingFish.forEach((fish) => {
        this.fishGroup.remove(fish, true, true);
    });
}
```

#### 10. UI Elements

##### Buttons:
- **Reset Button**: Resets all fishes.
- **Speak Button**: Activates speech recognition for plant growth.

##### Seaweed Animations:
Seaweed assets have smooth animations created using tweens.

#### 11. Speech Recognition

Speech commands are processed to grow the plant. Uses the browser's SpeechRecognition API:
```typescript
private initSpeechRecognition(): void {
    const SpeechRecognition = window.SpeechRecognition || (

