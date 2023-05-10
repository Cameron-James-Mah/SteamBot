const puppeteer = require("puppeteer");
const {Client, IntentsBitField} = require('discord.js')
require('dotenv').config()
const client = new Client({
    intents: [ 
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.DirectMessages
    ]
})
client.on('ready', (c)=>{
    console.log(`${c.user.username} is online`)
})

client.on('messageCreate', (message)=>{
    //console.log(message.content)
    if(message.author.bot){ //Dont look at messages sent from other bots
        return;
    }
    //commands
    if(message.content == '!sale'){
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
        message.reply('!commands, to see a list of all commands\n!sale, to see steam wishlist games on sale')
    }
    
    
})

client.login(process.env.TOKEN)

async function scrapeProduct(url, message){
    const browser = await puppeteer.launch({ headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
    const page = await browser.newPage()
    await page.goto(url)
    
    try{
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
        await page.waitForSelector(`#game_area_purchase_section_add_to_cart_${id} > div.game_purchase_action > div > div.discount_block.game_purchase_discount > div.discount_prices > div.discount_final_price`, {timeout: 5000})
        const el = await page.$(`#game_area_purchase_section_add_to_cart_${id} > div.game_purchase_action > div > div.discount_block.game_purchase_discount > div.discount_prices > div.discount_final_price`)
        const price = await page.evaluate(element => element.innerText, el);
        const title = await page.evaluate(()=>
            document.title
        )
        console.log(`${title}: ${price}`)
        message.reply(`${title}: ${price}`)
    }catch(e){
        const title = await page.evaluate(()=>
            document.title
        )
        console.log(`No sale for ${title}`)
    }
    await browser.close()
}

/*
scrapeProduct('https://store.steampowered.com/app/1245620/ELDEN_RING/')
scrapeProduct('https://store.steampowered.com/app/1940340/Darkest_Dungeon_II/')
scrapeProduct('https://store.steampowered.com/app/1184370/Pathfinder_Wrath_of_the_Righteous__Enhanced_Edition/')
*/

