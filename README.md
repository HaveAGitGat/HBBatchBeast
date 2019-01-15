# HBBatchBeast
A simple GUI application for Handbrake on Windows with an emphasis on batch conversion (including recursive folder scans and folder watching). The destination folder structure is kept the same as the source folder structure. Media in subfolders is also converted.

This is a standalone program that is based on HTAs (HTML Applications) while also making use of batch files and the Handbrake CLI. 

You'll need to add the HandbrakeCLI.exe to the root folder (Place it alongside "HBBatchBeast.hta".)

You can download HandbrakeCLI.exe from https://handbrake.fr/downloads2.php

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


After it a bit more testing it seems that weird things can happen if you monitor a folder which is being downloaded to. It seems sometimes conversions start before a file has fully downloaded. To solve this, I recommend using a temporary download folder before moving completed files into your HBBB source folder.

If you use a download program which has an 'incomplete downloads' folder etc, do not put that folder inside your main source folder else you'll end up converting each file twice.
