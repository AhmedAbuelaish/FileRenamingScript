const fs = require('fs')
const prompt = require('prompt')
const colors = require('colors/safe')
const csv = require('csvtojson')
const path = require('path')

var modFilesLocation = 'RenamedDocuments\\'
// var modFilesLocation = ''

// Node Command Line Inputs
var confirmRename
if (process.argv[2] == '--rename') {
	confirmRename = true
} else {
	confirmRename = false // default value
}

// 'walk' through every file, then drill down through every directory to create a list of all the files including their filepaths
var walk = function (dir, done) {
	var results = []
	fs.readdir(dir, function (err, list) {
		if (err) return done(err)
		var i = 0
		;(function next() {
			var file = list[i++]
			if (!file) return done(null, results)
			file = path.resolve(dir, file)
			fs.stat(file, function (err, stat) {
				if (stat && stat.isDirectory()) {
					walk(file, function (err, res) {
						results = results.concat(res)
						next()
					})
				} else {
					results.push(file)
					next()
				}
			})
		})()
	})
}

const readCSV = (fp) => {
	return new Promise((resolve, reject) => {
		csv()
			.fromFile(fp + '\\000FileNames000.csv')
			.then((jsonObj) => {
				resolve(jsonObj)
			})
	})
}

const countFilesPromise = (fp) => {
	console.log(colors.grey('counting files...'))
	return new Promise((resolve, reject) => {
		walk(fp, function (err, results) {
			if (err) throw err
			results = results.map((file) => {
				return file.replace(fp + '\\', '')
			})
			resolve(results)
		})
	})
}

const fileCountCheck = (allLists) => {
	console.log('checking file count...')
	return new Promise((resolve, reject) => {
		if (!allLists[1] || !allLists[2]) {
			reject('missing files or missing 000FileNames000.csv. Check the directory and try again')
		}
		if (allLists[1].length - 1 < allLists[2].length) {
			console.log(
				colors.yellow(
					'Warning: \n' +
						(allLists[1].length - 1) +
						' files in the current directory' +
						' are fewer than ' +
						allLists[2].length +
						' entries in 000FileNames000.csv'
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

const compareFileLists = (fp) => {
	return Promise.all([fp, countFilesPromise(fp), readCSV(fp)])
}

const renameFilesPromise = (allFiles) => {
	console.log(colors.grey('searching for matches...'))
	let fp = allFiles[0]
	let currFiles = allFiles[1]
	let newFiles = allFiles[2]
	let fileCount = newFiles.length
	let matched = []
	let renamed = []
	let unmatched = []

	return new Promise((resolve, reject) => {
		for (var i = 0; i < fileCount; i++) {
			for (const file of currFiles) {
				if (newFiles[i].Document.indexOf(file) != -1) {
					if (!modFilesLocation) {
						let currPath = file.substring(0, file.lastIndexOf('\\') + 1)
						modFilesLocation = currPath
						console.log(currPath)
					}
					if (matched.length + unmatched.length !== i) {
						// this checks if the previous file is unaccounted for.
						// if it is then push it into unmatched and notify the user
						for (var j = i - matched.length; j > 0; j--) {
							unmatched.push(newFiles[i - j].NewFileName)
							console.log('-------------------------')
							console.log(colors.red('Missing file:', newFiles[i - j].Document))
						}
					}

					// Match files from CSV in directory
					console.log('-------------------------')
					console.log('Found file:', file)
					matched.push(file)

					// Check if new file name is unique and warn user
					if (renamed.indexOf(newFiles[i].NewFileName) !== -1) {
						console.log(
							colors.red(
								newFiles[i].NewFileName +
									' is a duplicate file name. Modify new file name in CSV file or file will be skipped'
							)
						)
					} else {
						renamed.push(newFiles[i].NewFileName)
					}

					// Check if user wants to rename files or is just checking for errors
					if (confirmRename) {
						// Rename file and log file name before & after
						console.log('renaming', colors.green(file), 'to', colors.green(newFiles[i].NewFileName))
						fs.rename(fp + '\\' + file, fp + '\\' + modFilesLocation + newFiles[i].NewFileName, (err) => {
							if (err) {
								console.log(err)
								reject(err)
							}
							resolve(renamed)
						})
					} else {
						// Confirm that file can be renamed. log file name before & after
						console.log(colors.green(file), 'can be renamed to', colors.green(newFiles[i].NewFileName))
					}
					// Log full process status
					console.log(
						colors.yellow(
							'Successfully found',
							matched.length,
							'of',
							fileCount,
							'. \n',
							renamed.length,
							'Successfully renamed.',
							unmatched.length,
							'Unmatched renamed.',
							Math.abs(matched.length - renamed.length),
							'Potential errors.'
						)
					)
				}
			}
		}
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
if (!confirmRename) {
	console.log(
		colors.grey('Note: Running in error-checking mode. Use "node fileRenaming.js --rename" to rename the files')
	)
}
prompt.start()

// Get folder from user
prompt.get(schema, function (err, result) {
	compareFileLists(result.path)
		.then((allLists) => fileCountCheck(allLists))
		.then((allLists) => renameFilesPromise(allLists))
		.then((matches) => console.log(colors.green('renamed', matches.length, 'files')))
		.catch((err) => console.log(colors.red('all catch' + err)))
})
