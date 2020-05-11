const fs = require('fs')
const prompt = require('prompt')
const colors = require('colors/safe')
const csv = require('csvtojson')

var directory
var folderFileList
var jsonFileList

const countFilesPromise = (fp) => {
	console.log('in count files promise')
	return new Promise((resolve, reject) => {
		fs.readdir(fp, (err, files) => {
			if (err || !files) reject(err)
			resolve(files) // return the total number of files
		})
	})
}

const renameFilesPromise = (fp, fnOld, fnNew) => {
	console.log('in rename files promise')
	return new Promise((resolve, reject) => {
		// fs.rename(fp + fnOld, fp + fnNew, (err) => {
		// 	if (err) reject(err)
		// 	resolve([fnOld, fnNew])
		// })
		for (const file of folderFileList) {
			console.log(file)
			if (file) {
				fs.rename(fp + fnOld, fp + fnNew, (err) => {
					if (err) {
						console.log(err)
						reject(err)
					}
					resolve([fnOld, fnNew])
				})
			}
		}
	})
}

const compareFileLists = (fp) => {
	return Promise.all([countFilesPromise(fp), readCSV(fp)])
}

const fileCountCheck = (allLists) => {
	console.log('checking file count', allLists)
	return new Promise((resolve, reject) => {
		if (allLists[0].length - 1 != allLists[1].length)
			reject(
				'the number of entries in 000FileNames.csv do not match the current directory ' +
					(allLists[0].length - 1) +
					' vs ' +
					allLists[1].length
			)
		resolve()
	})
}

const readCSV = (fp) => {
	return new Promise((resolve, reject) => {
		csv()
			.fromFile(fp + '\\000FileNames000.csv')
			.then((jsonObj) => {
				jsonFileList = jsonObj
				resolve(jsonObj)
			})
	})
}

// Start the prompt
console.clear()
prompt.start()

// Get folder from user
prompt.get(
	{
		name: 'path',
		description: colors.yellow('enter folder path:'),
		pattern: /^(?:[\w]\:|\\)(\\[a-zA-Z_\-\s0-9\.\/\\]+)$/,
		message: colors.red('File path must only contain valid characters'),
		required: true,
	},
	function (err, result) {
		directory = result.path
		compareFileLists(directory)
			.then((result) => fileCountCheck(result))
			// countFilesPromise(directory)
			// 	.then((currFiles) => {
			// 		console.log(colors.yellow(currFiles.length + ' currFiles in the directory: '))
			// 		return currFiles
			// 	})
			// 	.then((currFiles) => {
			// 		readCSV(directory).then((csvResult) => console.log([csvResult, currFiles]))
			// 	})
			// 	.then((allFileLists) => fileCountCheck(allFileLists))
			// 	.then((result) =>
			// 		renameFilesPromise(directory, '\\file title 1.txt', '\\FileTitle1.txt').then((result) =>
			// 			console.log('renamed file', colors.red(result[0]), 'to', colors.green(result[1]))
			// 		)
			// 	)
			.catch((err) => console.log(colors.red('all catch' + err)))
	}
)

// prompt.get(
// 	{
// 		name: 'confirmation',
// 		type: 'confirm',
// 		description: colors.green('\ndoes this look right? (Y/N)'),
// 		message: colors.red('Y/N'),
// 		initial: true,
// 	},
// 	function (err, result) {
// 		console.log('   Confimation: ' + result.confirm)
// 	}
// )

// renameFiles(directory, '\\file title 1.txt', '\\FileTitle1.txt')
