const discord = require("discord.js");
const client = new discord.Client();
const request = require("request").defaults({
    timeout: 15000
});

var config = {
    prefix: "!",
    token: "BOT_TOKEN"
}
var api = {};
var val = 0.88;
api.stockXEU = {};
api.stockXUS = {};

client.on("ready", () => {
    console.log("Bot ready!");
    client.user.setActivity("!eu <item> or !us <item>");
});

client.on("message", message => {
    if(message.author.bot) return;

    if(message.content.indexOf(config.prefix) !== 0) return;

    var args = message.content.slice(config.prefix.length).trim().split(/ +/g);
    var command = args.shift().toLowerCase();

    if (command == "eu") 
    {
        if (args[0].includes("stockx.com"))   //STOCKX EU
        {         
            api.stockXEU.url("https://stockx.com/api/products/" + args[0].split("/")[3] + "?includes=market,360", (data) => {
                if (data.s) 
                {
                    //success
                    api.Notification(data.data, message);
                } else 
                {
                    //failure
                    message.channel.send("Sorry, I can't find your keywords!");
                }
            });
        } else if(command == "us")   //STOCKX US
        {
            if (args[0].includes("stockx.com"))
            api.stockXUS.url("https://stockx.com/api/products/" + args[0].split("/")[3] + "?includes=market,360", (data) => {
                if (data.s) 
                {
                    //success
                    api.Notification(data.data, message);
                } 
                else {
                    //failure
                    message.channel.send("Sorry, I can't find your keywords!");
                }
        });        
        /*else 
        {
            api.stockX.keywords(args, (data) => {
                if (data.s) 
                {
                    //success
                    api.Notification(data.data, message);
                } else 
                {
                    //failure
                    message.channel.send("Sorry, I can't find your keywords!");
                }
            });
        }*/
    } else 
    {
        message.channel.send("Invalid command. Use '!us <item name> or !eu <item name>'");
    }

}});

client.login(config.token);

api.Notification = (data, message) => {
    message.channel.send({
        embed: {
            color: 0x43ab49,
            author: {
                name: "StockX",
                icon_url: "https://pbs.twimg.com/profile_images/880500140984946689/YLtBaLZS_400x400.jpg"
            },
            title: data.product.name,
            url: data.product.url,
            thumbnail: {
                url: data.product.image
            },
            fields: data.discord,
            timestamp: new Date(),
            footer: {
                icon_url: client.user.avatarURL,
                text: "TESTING TEXT"
            }
        }
    });
}

api.stockXEU.url = (url, cb) => {                       //STOCKX EUROPE
    request({
        url: url,
        method: "GET"
    }, (err, response) => {
        if (!err && response.statusCode == 200) {
            let tempBody = JSON.parse(response.body).Product;
           

            let productObj = {};
            productObj.market = {};
            productObj.market.sizes = [];

            productObj.name = tempBody.title;
            productObj.currency = tempBody.priceCurrency;
            productObj.sku = tempBody.styleId;
            productObj.url = "https://stockx.com/eu" + tempBody.urlKey;
            productObj.date = tempBody.releaseDate;
            productObj.price = "€" + tempBody.retailPrice;
            productObj.image = tempBody.media.imageUrl;
            productObj.brand = tempBody.brand;

            productObj.market.lowestAsk = "€" + (tempBody.market.lowestAsk)*val;
            productObj.market.highestBid = "€" + (tempBody.market.highestBid)*val;
            productObj.market.totalSold = tempBody.market.deadstockSold;
            productObj.market.averagePrice = "€" +(tempBody.market.averageDeadstockPrice)*val;

            let discordFields = [{
                name: "Retail Price",
                value: `${productObj.price}`,
                inline: true
            },
 

            {
                name: "SKU",
                value: `${productObj.sku}`,
                inline: true
            },
            {
                name: "Release Date",
                value: `${productObj.date}`,
                inline: true
            },
            {
                name: "Brand",
                value: `${productObj.brand}`,
                inline: true
            },
            {
                name: "Lowest Ask",
                value: `${productObj.market.lowestAsk}`,
                inline: true
            },
            {
                name: "Highest Bid",
                value: `${productObj.market.highestBid}`,
                inline: true
            },
            {
                name: "Total Sold",
                value: `${productObj.market.totalSold}`,
                inline: true
            },
            {
                name: "Average Price",
                value: `${productObj.market.averagePrice}`,
                inline: true
            },
            /*{
                name: "Medium Prices",
                value: "________________ ",
                inline: true
            }*/];

            for (let size in tempBody.children) {
                productObj.market.sizes.push({
                    size: tempBody.children[size].shoeSize,
                    highestBid: "€" + tempBody.children[size].market.highestBid
                });

                discordFields.push({
                    name: "US " + tempBody.children[size].shoeSize,
                    value: "€" + (((tempBody.children[size].market.highestBid) +(tempBody.children[size].market.lowestAsk))/2) *val,
                    inline: true
                });
            }

            cb({
                s: true,
                data: {
                    product: productObj,
                    discord: discordFields
                }
            });
            
        } else {
            cb({
                s: false,
                data: "Request failed."
            });
        }
    });
}


api.stockXUS.url = (url, cb) => {                //STOCKX USA 
    request({
        url: url,
        method: "GET"
    }, (err, response) => {
        if (!err && response.statusCode == 200) {
            let tempBody = JSON.parse(response.body).Product;
           

            let productObj = {};
            productObj.market = {};
            productObj.market.sizes = [];

            productObj.name = tempBody.title;
            productObj.currency = tempBody.priceCurrency;
            productObj.sku = tempBody.styleId;
            productObj.url = "https://stockx.com/us" + tempBody.urlKey;
            productObj.date = tempBody.releaseDate;
            productObj.price = "€" + tempBody.retailPrice;
            productObj.image = tempBody.media.imageUrl;
            productObj.brand = tempBody.brand;

            productObj.market.lowestAsk = "$" + (tempBody.market.lowestAsk)*val;
            productObj.market.highestBid = "$" + (tempBody.market.highestBid)*val;
            productObj.market.totalSold = tempBody.market.deadstockSold;
            productObj.market.averagePrice = "$" +(tempBody.market.averageDeadstockPrice)*val;

            let discordFields = [{
                name: "Retail Price",
                value: `${productObj.price}`,
                inline: true
            },
 

            {
                name: "SKU",
                value: `${productObj.sku}`,
                inline: true
            },
            {
                name: "Release Date",
                value: `${productObj.date}`,
                inline: true
            },
            {
                name: "Brand",
                value: `${productObj.brand}`,
                inline: true
            },
            {
                name: "Lowest Ask",
                value: `${productObj.market.lowestAsk}`,
                inline: true
            },
            {
                name: "Highest Bid",
                value: `${productObj.market.highestBid}`,
                inline: true
            },
            {
                name: "Total Sold",
                value: `${productObj.market.totalSold}`,
                inline: true
            },
            {
                name: "Average Price",
                value: `${productObj.market.averagePrice}`,
                inline: true           
            }];

            for (let size in tempBody.children) {
                productObj.market.sizes.push({
                    size: tempBody.children[size].shoeSize,
                    highestBid: "$" + tempBody.children[size].market.highestBid
                });

                discordFields.push({
                    name: "US " + tempBody.children[size].shoeSize,
                    value: "$" + (((tempBody.children[size].market.highestBid) +(tempBody.children[size].market.lowestAsk))/2) *val,
                    inline: true
                });
            }

            cb({
                s: true,
                data: {
                    product: productObj,
                    discord: discordFields
                }
            });
            
        } else {
            cb({
                s: false,
                data: "Request failed."
            });
        }
    });
}

api.stockXEU.keywords = (keywords, callback) => {
    request({
        url: "https://xw7sbct9v6-dsn.algolia.net/1/indexes/products/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.29.0&x-algolia-application-id=XW7SBCT9V6&x-algolia-api-key=6bfb5abee4dcd8cea8f0ca1ca085c2b3",
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `{"params":"query=${keywords}&hitsPerPage=20&facets=*"}`
    }, (err, response) => {
        if (!err && response.statusCode == 200) {
            try {
                let x = JSON.parse(response.body);

                api.stockX.url("https://stockx.com/api/products/" + x.hits[0].url + "?includes=market,360", (data) => {
                    if (data.s) {
                        //success
                        callback({
                            s: true,
                            data: data.data
                        });
                    } else {
                        //failure
                        callback({
                            s: false,
                            data: "Opssss! No products found."
                        });
                    }
                });
            } catch (err) {
                callback({
                    s: false,
                    data: "Opssss! No products found."
                });
            }
        } else {
            callback({
                s: false,
                data: "Request failed."
            });
        }
    });
}

api.stockXUS.keywords = (keywords, callback) => {
    request({
        url: "https://xw7sbct9v6-dsn.algolia.net/1/indexes/products/query?x-algolia-agent=Algolia%20for%20vanilla%20JavaScript%203.29.0&x-algolia-application-id=XW7SBCT9V6&x-algolia-api-key=6bfb5abee4dcd8cea8f0ca1ca085c2b3",
        method: "POST",
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36",
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: `{"params":"query=${keywords}&hitsPerPage=20&facets=*"}`
    }, (err, response) => {
        if (!err && response.statusCode == 200) {
            try {
                let x = JSON.parse(response.body);

                api.stockX.url("https://stockx.com/api/products/" + x.hits[0].url + "?includes=market,360", (data) => {
                    if (data.s) {
                        //success
                        callback({
                            s: true,
                            data: data.data
                        });
                    } else {
                        //failure
                        callback({
                            s: false,
                            data: "Opssss! No products found."
                        });
                    }
                });
            } catch (err) {
                callback({
                    s: false,
                    data: "Opssss! No products found."
                });
            }
        } else {
            callback({
                s: false,
                data: "Request failed."
            });
        }
    });
}

client.login(process.env.BOT_TOKEN);


