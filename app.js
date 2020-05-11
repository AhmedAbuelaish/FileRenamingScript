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
		fs.readdir(fp, { withFileTypes: true }, (err, files) => {
			if (err || !files) reject(err)
			// console.log(files)
			resolve(files.filter((dirent) => dirent.isFile()).map((dirent) => dirent.name))
		})
	})
}

const renameFilesPromise = (allFiles) => {
	console.log('in rename files promise')
	let fp = allFiles[0]
	let currFiles = allFiles[1]
	let newFiles = allFiles[2]
	return new Promise((resolve, reject) => {
		for (const file of currFiles) {
			for (var i = 0; i < newFiles.length; i++) {
				if (newFiles[i].Document.indexOf(file) != -1) {
					console.log('matched file:', file)
					console.log(colors.red('renaming', file), colors.green('to', newFiles[i].NewFileName))
					fs.rename(fp + '\\' + file, fp + '\\' + newFiles[i].NewFileName, (err) => {
						if (err) {
							console.log(err)
							reject(err)
						}
						resolve()
					})
				}
			}
		}
	})
}

const compareFileLists = (fp) => {
	return Promise.all([fp, countFilesPromise(fp), readCSV(fp)])
}

const fileCountCheck = (allLists) => {
	console.log('checking file count...')
	return new Promise((resolve, reject) => {
		if (!allLists[1] || !allLists[2]) {
			reject('missing files or missing 000FileNames000.csv. Check the directory and try again')
		}
		if (allLists[1].length - 1 != allLists[2].length) {
			console.log(
				colors.yellow(
					'Warning: \n' +
						(allLists[1].length - 1) +
						' files in the current directory' +
						' do not match ' +
						allLists[2].length +
						' the number of entries in 000FileNames000.csv'
				)
			)
		} else {
			console.log(
				colors.yellow(
					'Everything looks good:/n',
					allLists[1].length - 1,
					' files in the current directory, and /n',
					allLists[2].length,
					'files in the new file list'
				)
			)
		}
		resolve(allLists)
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

var schema = {
	properties: {
		path: {
			description: colors.yellow('enter folder path:'),
			pattern: /^(?:[\w]\:|\\)(\\[a-zA-Z_\-\s0-9\.\/\\]+)$/,
			message: colors.red('File path must only contain valid characters'),
			required: true,
		},
	},
}

// Start the prompt
console.clear()
prompt.start()

// Get folder from user
prompt.get(schema, function (err, result) {
	compareFileLists(result.path)
		.then((allLists) => fileCountCheck(allLists))
		.then((allLists) => renameFilesPromise(allLists))
	// 	})
	// 	.then((allFileLists) => fileCountCheck(allFileLists))
	// 	.then((result) =>
	// 		renameFilesPromise(directory, '\\file title 1.txt', '\\FileTitle1.txt').then((result) =>
	// 			console.log('renamed file', colors.red(result[0]), 'to', colors.green(result[1]))
	// 		)
	// 	)
	// .catch((err) => console.log(colors.red('all catch' + err)))
})

// prompt.start()
// prompt.get({
// 	name: 'path',
// 	description: colors.yellow('enter folder path:'),
// 	pattern: /^(?:[\w]\:|\\)(\\[a-zA-Z_\-\s0-9\.\/\\]+)$/,
// 	message: colors.red('File path must only contain valid characters'),
// 	required: true,
// },function(err,result){console.log(result)})

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
