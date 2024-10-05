/* global Phaser */

// Configuracion inicial del juego
const config = {
    type: Phaser.AUTO,
    width: 256,
    height: 244,
    backgroundColor: '#849cd8',
    parent: 'game',
    physics: {
        default: 'arcade',
        arcade:{
            gravity:{y: 300},
            debug: false
        }
    },
    scene: {
        preload,
        create,
        update
    }

}

// Ejecucion del juego
new Phaser.Game(config)

// Funcion para Pre-cargar los recursos
function preload(){
    this.load.image(
        'cloud1',
        'assets/scenery/overworld/cloud1.png'
    )

    this.load.image(
        'floorbricks',
        'assets/scenery/overworld/floorbricks.png'
    )

    this.load.spritesheet(
        'miku',
        'assets/entities/miku.png',
        { frameWidth: 16, frameHeight: 16 }
    )

    this.load.audio('gameover', 'assets/sound/music/gameover.mp3')
}

// Funcion para crear el escenario
function create(){
    this.add.image(50, 50, 'cloud1')
        .setOrigin(0, 0)
        .setScale(0.15)

    this.floor = this.physics.add.staticGroup()

    this.floor
        .create(0, config.height - 16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()
    
    this.floor
        .create(128, config.height - 16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()

    this.floor
        .create(256, config.height - 16, 'floorbricks')
        .setOrigin(0, 0.5)
        .refreshBody()

    this.miku = this.physics.add.sprite(30, 100, 'miku')
        .setOrigin(0, 1)
        .setCollideWorldBounds(true)
        .setGravityY(600)

    // Fisicas
    this.physics.world.setBounds(0, 0, 3000, config.height)
    this.physics.add.collider(this.miku, this.floor)

    // Camara
    this.cameras.main.setBounds(0, 0, 3000  , config.height)
    this.cameras.main.startFollow(this.miku)

    // Animaciones
    this.anims.create({
        key: 'miku-walk',
        frames: this.anims.generateFrameNumbers(
            'miku',
            { start: 1, end: 3}
        ),
        frameRate: 12,
        repeat: -1
    })

    this.anims.create({
        key: 'miku-idle',
        frames: [{ key: 'miku', frame: '0'}]
    })

    this.anims.create({
        key: 'miku-jump',
        frames: [{ key: 'miku', frame: '5'}]
    })

    this.anims.create({
        key: 'miku-dead',
        frames: [{ key: 'miku', frame: '6'}]
    })

    this.keys = this.input.keyboard.createCursorKeys()
}

// Funcion para actualizar el estado del juego cada frame
function update(){
    
    const { keys, miku} = this

    const isMikuTouchingFloor = miku.body.touching.down

    const isLeftKeyDown = keys.left.isDown
    const isRightKeyDown = keys.right.isDown
    const isUpKeyDown = keys.up.isDown

    // Movimiento
    if(miku.isDead) return

    if(isLeftKeyDown){
        isMikuTouchingFloor && miku.anims.play('miku-walk', true)
        miku.x -=2
        miku.flipX = true
    } else if(isRightKeyDown){
        isMikuTouchingFloor && miku.anims.play('miku-walk', true)
        miku.x +=2
        miku.flipX = false
    } else if(isMikuTouchingFloor) {
        miku.anims.play('miku-idle', true)
    }

    // Salto
    if (isUpKeyDown && isMikuTouchingFloor) {
        miku.setVelocityY(-300)
        miku.anims.play('miku-jump', true)
    }

    // Muerte
    if (miku.y >= config.height) {
        this.sound.add('gameover', { volume:0.2 }).play()
        miku.isDead = true
        miku.anims.play('miku-dead', true)
        miku.setCollideWorldBounds(false)

        setTimeout(() => {
            miku.setVelocityY(-350)
        }, 100)

        setTimeout(() => {
            this.scene.restart()
        }, 3000)
    }
}

