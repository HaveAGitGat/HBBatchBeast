# HBBatchBeast
A simple GUI application for Handbrake on Windows with an emphasis on batch conversion (including recursive folder scans and folder watching). The destination folder structure is kept the same as the source folder structure. Media in subfolders is also converted.

This is a standalone program that is based on HTAs (HTML Applications) while also making use of batch files and the Handbrake CLI. 

You'll need to add the HandbrakeCLI.exe to the root folder (Place it alongside "HBBatchBeast.hta".)

You can download HandbrakeCLI.exe from https://handbrake.fr/downloads2.php

Make sure to keep the main config window up and the status window up (this pops up when a scan is performed) to prevent errors.

If you're converting a large folder (say 100 files or more), you may find it useful to run the "AddIETimeOutRegKey.bat" file. This will add a key to the registry which will prevent the "This page is unresponsive" messages from appearing while the program is running. 

The registry fix mentioned above is based on the following:
https://support.microsoft.com/en-us/help/175500/error-message-a-script-on-this-page-is-causing-internet-explorer-to-ru#FixItForMeAlways


The program makes use of 6 HTA's altogther:
 -Config HTA
 -Status HTA
 -4 'Worker' HTAs
 
 The program scans the source folder for all files. It then compares the source folder files with the destination folder files to see if any of the source files exist in the destination folder already. If not, the program queues the files for conversion.
 
The 4 worker HTAs then work through the conversion queue. If periodic scanning is enabled then the program will run at the chosen interval.

Screenshot - https://imgur.com/a/rV9zJEK

Demo video - https://sendvid.com/lmzaikh0

Full ready to go zip download (including HandbrakeCLI.exe) -https://drive.google.com/file/d/13HPihCd0IMSI1rJYLcdg4B2SFwFvFW_A/view?usp=sharing

If you monitor a folder which is actively being downloaded into (and has unfinished downloads in), the program will detect that there are new files and add them to the conversion queue. However, when Handbrake goes to convert the files, it won't be able to because they haven't finished downloading so it will skip them. This will loop until the files have fully been downloaded and then they will be converted and placed in the output folder.

Also, if you use a download program which has an 'incomplete downloads' folder etc, do not put that folder inside your main source folder else you'll end up converting each file twice.
