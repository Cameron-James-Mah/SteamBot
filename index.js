const puppeteer = require("puppeteer");
let fs = require('fs-extra');
const {Client, IntentsBitField, AttachmentBuilder, EmbedBuilder} = require('discord.js')
require('dotenv').config()
const client = new Client({
    intents: [ 
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.GuildMessageReactions
    ]
})
client.on('ready', (c)=>{
    console.log(`${c.user.username} is online`)
})

let golRef = null //used as message ref for game of life instance
let genCnt = 0

let snakeRef = null //used as message ref for snake game

client.on('messageReactionAdd', (reaction, user)=>{
    if(!user.bot){
        //console.log(reaction._emoji.name)
        if(reaction._emoji.name == '⬆️'){
            dir = 'u'
        }
        if(reaction._emoji.name == '⬇️'){
            dir = 'd'
        }
        if(reaction._emoji.name == '⬅️'){
            dir = 'l'
        }
        if(reaction._emoji.name == '➡️'){
            dir = 'r'
        }
        reaction.users.remove(user)
    }
})

client.on('messageCreate', (message)=>{
    //console.log(message.content)
    if(message.author.bot){ //Dont look at messages sent from other bots
        return;
    }
    //commands
    if(message.content == '!sale'){ //wishlist games
        message.reply('Scraping Steam please wait...')
        scrapeProduct('https://store.steampowered.com/app/1184370/Pathfinder_Wrath_of_the_Righteous__Enhanced_Edition/', message)
        scrapeProduct('https://store.steampowered.com/app/1245620/ELDEN_RING/', message)
        scrapeProduct('https://store.steampowered.com/app/1940340/Darkest_Dungeon_II/', message)
        scrapeProduct('https://store.steampowered.com/app/644930/They_Are_Billions/', message)
        scrapeProduct('https://store.steampowered.com/app/1169040/Necesse/', message)
        scrapeProduct('https://store.steampowered.com/app/1374840/Dark_Deity/', message)
        scrapeProduct('https://store.steampowered.com/app/1581770/SpellForce_Conquest_of_Eo/', message)
        scrapeProduct('https://store.steampowered.com/app/1687950/Persona_5_Royal/', message)
        scrapeProduct('https://store.steampowered.com/app/1336490/Against_the_Storm/', message)
        scrapeProduct('https://store.steampowered.com/app/526870/Satisfactory/', message)
    }
    else if(message.content == '!commands'){
        message.reply('!commands, to see a list of all commands\n!sale, to see steam wishlist games on sale\n!coinflip, to flip a coin\n!gameoflife, to start a simulation of the game of life\n!snake, to play a game of snake')
    }
    else if(message.content == '!coinflip'){
        const res = Math.floor(Math.random() * 2)
        if(res == 0){
            const img = new AttachmentBuilder('https://static.thenounproject.com/png/607426-200.png')
            message.reply({content: "Heads", files: [img]})
        }
        else if(res == 1){
            const img = new AttachmentBuilder('https://static.thenounproject.com/png/365781-200.png')
            message.reply({content: "Tails", files: [img]})
        }
    }
    
    else if(message.content == '!emoji'){
        const emb = new EmbedBuilder()
            .setDescription(':white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square::white_large_square:\n:white_large_square:')
        message.channel.send({embeds: [emb]})

    }
    else if(message.content == '!gameoflife'){
        if(!golRef){ //only one instance of game of life at a time
            golHelper(message)
        }
        else{
            message.reply("Already running Game of Life instance")
        }
    }
    else if(message.content == '!test'){
        client.users.cache.get(process.env.myID).send('hello')
    }
    else if(message.content == '!snake'){
        if(!snakeRef){
            snakeHelper(message)
        }
        else{
            message.reply("Already running snake instance")
        }
    }
})

async function snakeHelper(message){//helper function to grab reference for my message so i can edit it
    snakeRef = await message.channel.send("Loading")
    snakeRef.react('⬆️')
    snakeRef.react('⬇️')
    snakeRef.react('⬅️')
    snakeRef.react('➡️')
    //any snake cell can either be the head, body, or tail
    snakeBody = [{y: 4, x: 4}]
    dir = 'r'
    snake()
}
let snakeBody = [{y: 4, x: 4}]
let apple = {y: 8, x: 8}
let dir = 'r'
let ateApple = false
function snake(){
    //reset board
    //update snakeBody
    //update grid
    //build emote res
    //output
    
    snakeBoard = [//reset board
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ] 

    let prevHead = {...snakeBody[0]}
    let temp = {x: snakeBody[0].x, y: snakeBody[0].y}
    let temp2 = {x: snakeBody[0].x, y: snakeBody[0].y}
    if(dir == 'r'){
        snakeBody[0].x += 1
    }
    else if(dir == 'l'){
        snakeBody[0].x -= 1
    }
    else if(dir == 'u'){
        snakeBody[0].y -= 1
    }
    else if(dir == 'd'){
        snakeBody[0].y += 1
    }
    
    if(snakeBody[0].y < 0 || snakeBody[0].y >= snakeBoard.length || snakeBody[0].x < 0 || snakeBody[0].x >= snakeBoard[0].length || snakeBoard[snakeBody[0].y][snakeBody[0].x] == 1){ //out of bounds or ate itself
        const emb = new EmbedBuilder()
            .setImage('https://assetsio.reedpopcdn.com/five-of-the-best-game-over-screens-1590748640300.jpg?width=1600&height=900&fit=crop&quality=100&format=png&enable=upscale&auto=webp')
        snakeRef.edit({embeds: [emb]})
        snakeRef = null
        return
    }
    snakeBoard[snakeBody[0].y][snakeBody[0].x] = 1
    
    
    if(snakeBody[0].y == apple.y && snakeBody[0].x == apple.x){//ate apple
        snakeBody[0] = {...prevHead}
        snakeBoard[snakeBody[0].y][snakeBody[0].x] = 1
        snakeBody.unshift({x: apple.x, y: apple.y})
        for(s of snakeBody){
            snakeBoard[s.y][s.x] = 1
        }
        spawnApple()
    }
    else{
        for(let i = 1; i < snakeBody.length; i++){
            temp2 = {...snakeBody[i]}
            snakeBody[i] = {...temp}
            temp = {...temp2}
            snakeBoard[snakeBody[i].y][snakeBody[i].x] = 1
        }
        
    }
    
    
    snakeBoard[apple.y][apple.x] = 2
    
    
    let res = ""
    for(let i = 0; i < snakeBoard.length; i++){
        for(let j = 0; j < snakeBoard[0].length; j++){
            if(snakeBoard[i][j] == 1){
                res += ':green_square:'
            }
            else if(snakeBoard[i][j] == 2){
                res += ':red_square:'
            }
            else{
                res += ':white_large_square:'
            }
        }
        res += '\n'
    }
    
    const emb = new EmbedBuilder()
        .setTitle(`Snake Score: ${snakeBody.length-1}`)
        .setDescription(res)
        .addFields(
            {name: 'Eat all the apples!', value: 'Controls below'}
        )
    snakeRef.edit({embeds: [emb]})
    setTimeout(snake, 1000)
}

async function golHelper(message){ //helper function to grab reference for my message so i can edit it
    golRef = await message.channel.send("Loading...")
    gol()
}

function spawnApple(){
    for(let i = 0; i < 50; i++){
        let y = Math.floor(Math.random() * snakeBoard.length)
        let x = Math.floor(Math.random() * snakeBoard[0].length)
        if(snakeBoard[y][x] == 0){
            apple.y = y
            apple.x = x
        }
        snakeBoard[y][x] = 2
        break
    }
    

}

let snakeBoard = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
] 

const golPreset1 = [
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
    [0, 1, 0, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
]

const golPreset2 = [
    [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
]

let golArray = [
    [1, 0, 0, 0, 1, 1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 0],
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 1, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 1, 0, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
]

let golArrayCopy = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
]


function gol(){ //game of life main function
    if(genCnt >= 100){
        golRef = null;
        genCnt = 0
        golArray = copyBoard(golPreset2)
        return;
    }
    let res = ""
    for(let i = 0; i < golArray.length; i++){
        for(let j = 0; j < golArray[0].length; j++){
            let cnt = 0
            if(j < golArray[0].length-1 && golArray[i][j+1] == 1){//lright
                cnt++
            }
            if(j > 0 && golArray[i][j-1] == 1){//left
                cnt++
            }
            if(i > 0 && golArray[i-1][j] == 1){ //up
                cnt++
            }
            if(i < golArray.length-1 && golArray[i+1][j] == 1){//down
                cnt++
            }
            if(j < golArray[0].length-1 && i < golArray.length-1 && golArray[i+1][j+1] == 1){//right down
                cnt++
            }
            if(j < golArray[0].length-1 && i > 0 && golArray[i-1][j+1] == 1){//right up
                cnt++
            }
            if(j > 0 && i > 0 && golArray[i-1][j-1] == 1){//left up
                cnt++
            }
            if(j > 0 && i < golArray.length-1 && golArray[i+1][j-1] == 1){//left down
                cnt++
            }
            if((golArray[i][j] == 1 && (cnt == 2 || cnt == 3)) || (golArray[i][j] == 0 && cnt == 3)){
              golArrayCopy[i][j] = 1
              res += ':black_medium_square:'
            }
            else{
                golArrayCopy[i][j] = 0
                res += ':white_medium_square:'
            }
            //console.log(res)
        }
        res += '\n'
    }
    if(genStuck()){ //if current generation is stagnant
        golRef = null;
        genCnt = 0
        golArray = copyBoard(golPreset2)
        console.log('GOL done')
        return;
    }
    golArray = copyBoard(golArrayCopy)
    const emb = new EmbedBuilder()
        .setTitle(`Generation: ${genCnt}`)
        .setDescription(res)
    golRef.edit({embeds: [emb]})
    genCnt++
    setTimeout(gol, 1000)
}

function genStuck(){ //Check if game of life iteration is stagnant
    for(let i = 0; i < golArray.length; i++){ 
        for(let j = 0; j < golArray[0].length; j++){
            if(golArray[i][j] != golArrayCopy[i][j]){//checking for any differences
                return false
            }
        }
    }
    return true
}

function copyBoard(arr){//for game of life copy by value
    let temp = [[]]
    for(let i = 0; i < arr.length; i++){
      for(let j = 0; j < arr[0].length; j++){
        if(!temp[i]){
          temp[i] = []
        }
        temp[i][j] = arr[i][j]
      }
    }
    return temp
  }

client.login(process.env.TOKEN)



async function scrapeProduct(url, message){ //Scrape steam game page for given url
    const browser = await puppeteer.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
    const page = await browser.newPage()
    await page.goto(url)

    
    
    try{ //If game page has age restriction, pass this page first
        await page.waitForSelector(".btnv6_blue_hoverfade.btn_medium", {timeout: 5000})
        await page.waitForSelector('select[name="ageYear"]', {timeout: 1000})
        await page.select('select[name="ageYear"]', '1989')
        await page.click(".btnv6_blue_hoverfade.btn_medium")
    }catch(e){
        //console.log("No age restriction")
    }
    /*
    await page.waitForSelector("div.game_purchase_price.price")
    const el = await page.$('div.game_purchase_price.price')
    const price = await page.evaluate(element => element.innerText, el);
    const title = await page.evaluate(()=>
        document.title
    )
    console.log(`${title}: ${price}`)*/

    try{
        await page.waitForSelector('input[name="subid"]', {timeout: 5000}) 
        const idEl = await page.$('input[name="subid"]') //some type of product id? only way I could distinguish between sales on base game and other sales
        const id = await page.evaluate(element => element.value, idEl);
        //console.log("id: "+id)
        await page.waitForSelector(`#game_area_purchase_section_add_to_cart_${id} > div.game_purchase_action > div > div.discount_block.game_purchase_discount > div.discount_prices > div.discount_final_price`, {timeout: 5000})//Base game price is the only one that has this id attached

        const el = await page.$(`#game_area_purchase_section_add_to_cart_${id} > div.game_purchase_action > div > div.discount_block.game_purchase_discount > div.discount_prices > div.discount_final_price`)
        const price = await page.evaluate(element => element.innerText, el);
        const title = await page.evaluate(()=>
            document.title
        )
        const imgEl = await page.$('#gameHeaderImageCtn > img')
        const imgSrc = await page.evaluate(element => element.src, imgEl)
        //console.log(imgSrc)
        //console.log(`${title}: ${price}`)
        
        const emb = new EmbedBuilder()
            .setTitle(title)
            .setImage(imgSrc)
            .setDescription(price)
        //message.reply(`${title}: ${price}`)
        message.reply({embeds: [emb]})
    }catch(e){
        /*
        const title = await page.evaluate(()=>
            document.title
        )
        console.log(`No sale for ${title}`)*/
    }


    let chromeTmpDataDir = null;

    // find chrome user data dir (puppeteer_dev_profile-XXXXX) to delete it after it had been used
    let chromeSpawnArgs = browser.process().spawnargs;
    for (let i = 0; i < chromeSpawnArgs.length; i++) {
        if (chromeSpawnArgs[i].indexOf("--user-data-dir=") === 0) {
            chromeTmpDataDir = chromeSpawnArgs[i].replace("--user-data-dir=", "");
        }
    }//I think if it crashes before it gets here, the files will not be deleted 

    await browser.close()

    if (chromeTmpDataDir !== null) {
        fs.removeSync(chromeTmpDataDir);
    }
}



