# FileRenamingScript

The purpose of this script is to mass-rename files based on a csv file. The files can be renamed in-place (without changing the folder structure) or renamed and moved to a specified directory.

# Folder Structure

The basic folder structure needed is as follows:
>- **Main Directory/** (no name requirement)
	>-- **000FileNames000.csv**
	>-- **RenamedDocuments/** Directory *(optional)*
	>-- Source files or directories/

## 000FileNames000.csv
The csv file must contain the following two columns:
>- **Document** : 
	>--The Document column includes the file names to be renamed. 
	>--The list must include the file path from the Main Directory, as well as the file type extension
>- **NewFileName** : 
	>--The NewFileName column includes the new name.
	>--This column *does not* need a file path but *does* require a file type extension.
>-**(All other columns are optional)**

| Title | Document | NewFileName |
|--|--|--|
| IntakeDocument | ClientDocuments\00001\00001911_dkidfiasddhbm.pdf | 863918.Intake.8.17.2020.pdf |
| Letter| ClientDocuments\00010\00003851_hdm6qsnawden4.pdf | 863925.Letter.8.03.2020.pdf |
| Letter of Attendance | 00001\00002518_bwdpo5e2t25go.doc | 814523.LetterOfAttendance.8.18.2019.doc |

## Source files/directories

The source files can be directly in the **Main Directory** or nested in multiple directories as long as the file path is included in **000FileNames000.csv**.
- All file types 4 characters or less are accepted
