// assign relevant ui to variables
// enemy
let enemyName = document.querySelector(".enemyName");
let enemyLevel = document.querySelector(".enemyLevel");
let enemyHP = document.querySelector(".enemyHPBar");
let enemyImage = document.querySelector(".enemyImage");
let enemyDialogue = document.querySelector(".enemyDialogue");
// player
let playerName = document.querySelector(".playerName");
let playerLevel = document.querySelector(".playerLevel");
let playerHP = document.querySelector(".playerHPBar");
let playerImage = document.querySelector(".playerImage");
let playerDialogue = document.querySelector(".playerDialogue");

// Create base pokemon constructor
function Pokemon(name = "", hp = 0, attackDamage = 0, frontImg = "", backImg = "") {
    this.name = name;
    this.level = 1;
    this.hp = hp;
    this.attackDamage = attackDamage;
    this.critRate = .2;
    this.critMultiplier = 1.5;
    this.healStrength = attackDamage;
    this.accuracy = .8;
    this.frontImg = frontImg;
    this.backImg = backImg;
}

// create the 2 pokemon from the pokemon constructor
const enemyPokemon = new Pokemon();
const playerPokemon = new Pokemon();

// create a ui update function
function updateUI() {
    //enemy
    enemyName.innerText = enemyPokemon.name;
    enemyLevel.innerText = enemyPokemon.level;
    enemyHP.max = enemyPokemon.hp;
    enemyHP.value = enemyPokemon.hp;
    enemyImage.src = enemyPokemon.frontImg;
    enemyDialogue.innerText = `Enemy's ${enemyPokemon.name} is ready to go!`;
    // player
    playerName.innerText = playerPokemon.name;
    playerLevel.innerText = playerPokemon.level;
    playerHP.max = playerPokemon.hp;
    playerHP.value = playerPokemon.hp;
    playerImage.src = playerPokemon.backImg;
    playerDialogue.innerText = `Player's ${playerPokemon.name} is ready to go!`;
}

// create constant variable holding the max pokemon ID
const MAX_POKEMON_ID = 898;

// create random num generator between 1 and MAX_POKEMON_ID
const rand = () => Math.ceil(Math.random() * MAX_POKEMON_ID);

// assign 2 pokemon variables to hold pokemon data
let pokemon1 = pokemon2 = {};
fetch(`https://pokeapi.co/api/v2/pokemon/${rand()}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            pokemon1 = data;
            // fill in the enemyPokemon object
            enemyPokemon.name = pokemon1.name;
            enemyPokemon.hp = pokemon1.stats[0].base_stat;
            enemyPokemon.attackDamage = Math.ceil(pokemon1.stats[1].base_stat / 7);
            enemyPokemon.frontImg = pokemon1.sprites.front_default;
            enemyPokemon.backImg = pokemon1.sprites.back_default || pokemon1.sprites.front_default;
            enemyPokemon.healStrength = Math.ceil(pokemon1.stats[1].base_stat / 10);

            // update the ui
            updateUI();
        })
        .catch(err => console.log(err));
fetch(`https://pokeapi.co/api/v2/pokemon/${rand()}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            pokemon2 = data;
            // fill in the playerPokemon object
            playerPokemon.name = pokemon2.name;
            playerPokemon.hp = pokemon2.stats[0].base_stat;
            playerPokemon.attackDamage = Math.ceil(pokemon2.stats[1].base_stat / 7);
            playerPokemon.frontImg = pokemon2.sprites.front_default;
            playerPokemon.backImg = pokemon2.sprites.back_default || pokemon2.sprites.front_default;
            playerPokemon.healStrength = Math.ceil(pokemon2.stats[1].base_stat / 10);

            // update the ui
            updateUI();
        })
        .catch(err => console.log(err));

// Add event listeners
document.querySelector(".attack").addEventListener("click", attack);
document.querySelector(".heal").addEventListener("click", heal);
document.querySelector(".skip").addEventListener("click", skip);
document.querySelector(".giveUp").addEventListener("click", giveUp);

// Menu functions
// attack
function attack() {
    let dialogue = "";
    // if hit succeeds
    if (willSucceed(playerPokemon)) {
        let dmg = 0;
        // if crit succeeds
        if (willCrit(playerPokemon)) {
            dmg = playerPokemon.attackDamage * playerPokemon.critMultiplier;
            dialogue = `Player's ${playerPokemon.name} crits for ${dmg}`;
        } else {
            dmg = playerPokemon.attackDamage;
            dialogue = `Player's ${playerPokemon.name} hits for ${dmg}`;
        }
        enemyHP.value -= dmg;
        
    } else { // if hit misses
        dialogue = `Player's ${playerPokemon.name}'s attack missed...`;
    }
    playerDialogue.innerText = dialogue;
    if (!hasFainted(enemyHP.value)) {
        enemyTurn();
    } else {
        endGame("enemy");
    }
}

// heal
function heal() {
    let dialogue = "";
    // if heal succeeds
    if (willSucceed(playerPokemon)) {
        let heal = 0;
        // if crit succeeds
        if (willCrit(playerPokemon)) {
            heal = playerPokemon.healStrength * playerPokemon.critMultiplier;
            dialogue = `Player's ${playerPokemon.name} heals a lot for ${heal}`;
        } else {
            heal = playerPokemon.healStrength;
            dialogue = `Player's ${playerPokemon.name} heals for ${heal}`;
        }
        playerHP.value += heal;
        
    } else { // if heal misses
        dialogue = `Player's ${playerPokemon.name}'s heal failed...`;
    }
    playerDialogue.innerText = dialogue;
    enemyTurn();
}

// skip
function skip() {
    playerDialogue.innerText = `Player's ${playerPokemon.name} skipped their turn.`;
    enemyTurn();
}

// give up
function giveUp() {
    endGame("oh noooooo!!!");
}

// Other Functions

// check if player or enemy hp is 0 or less
function hasFainted(doerHPValue) {
    return doerHPValue <= 0;
}

// end game function
function endGame(loserText) {
    // hide battle menu choices
    document.querySelector(".menuChoicesContainer").style.display = "none";
    // change the layout of battleMenuContainer
    const battleMenu = document.querySelector(".battleMenuContainer");
    battleMenu.style.flexDirection = "column";
    battleMenu.style.justifyContent = "space-evenly";
    battleMenu.style.alignItems = "center";
    // change the layout of dialogueContainer
    const dialogue = document.querySelector(".dialogueContainer");
    dialogue.style.flexDirection = "row";
    dialogue.style.alignItems = "center";
    dialogue.style.flexGrow = 0;
    // make the playAgainContainer visible
    document.querySelector(".playAgainButton").style.display = "inherit";
    document.querySelector(".playAgainButton").style.alignSelf = "center";
    // hide enemyDialogue
    document.querySelector(".enemyDialogue").style.display = "none";
    // check to see who won, then change player dialogue to win or lose
    const playerDialogue = document.querySelector(".playerDialogue");
    if (loserText === "enemy") {
        playerDialogue.innerText = "You win!";
    } else {
        playerDialogue.innerText = "You lose...";
    }
}

// check if action will go through
function willSucceed(doer) {
    return Math.random() <= doer.accuracy;
}

// check if an action will crit
function willCrit(doer) {
    return Math.random() <= doer.critRate;
}

// enemy AI function
function enemyTurn() {
    // if enemy hp is below 50%
    if(enemyHP.value < 50) {
        // 50% change to attack or heal
        if (Math.random() < .5) {
            enemyAttack();
        } else {
            enemyHeal();
        }
    } else {
        enemyAttack();
    }
}

// enemy attack function
function enemyAttack() {
    let dialogue = "";
    // if hit succeeds
    if (willSucceed(enemyPokemon)) {
        let dmg = 0;
        // if crit succeeds
        if (willCrit(enemyPokemon)) {
            dmg = enemyPokemon.attackDamage * enemyPokemon.critMultiplier;
            dialogue = `Enemy ${enemyPokemon.name} crits for ${dmg}`;
        } else {
            dmg = enemyPokemon.attackDamage;
            dialogue = `Enemy ${enemyPokemon.name} hits for ${dmg}`;
        }
        playerHP.value -= dmg;
        
    } else { // if hit misses
        dialogue = `Enemy ${enemyPokemon.name}'s attack missed...`;
    }
    enemyDialogue.innerText = dialogue;
    if (hasFainted(playerHP.value)) {
        endGame("He he I win!");
    }
}

// enemy heal function
function enemyHeal() {
    let dialogue = "";
    // if heal succeeds
    if (willSucceed(enemyPokemon)) {
        let heal = 0;
        // if crit succeeds
        if (willCrit(enemyPokemon)) {
            heal = enemyPokemon.healStrength * enemyPokemon.critMultiplier;
            dialogue = `Enemy ${enemyPokemon.name} heals a lot for ${heal}`;
        } else {
            heal = enemyPokemon.healStrength;
            dialogue = `Enemy ${enemyPokemon.name} heals for ${heal}`;
        }
        enemyHP.value += heal;
        
    } else { // if heal misses
        dialogue = `Enemy ${enemyPokemon.name}'s heal failed...`;
    }
    enemyDialogue.innerText = dialogue;
}