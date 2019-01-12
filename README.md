# HBBatchBeast
A simple GUI application for Handbrake with an emphasis on batch conversion (including recursive folder scans and folder watching). The destination folder structure is kept the same as the source folder structure. Media in subfolders is also converted.

This is standalone program that is based on HTAs (HTML Applications) while also making use of batch files and the Handbrake CLI. 

You'll need to add the HandbrakeCLI.exe to the root folder (Place it alongside "HBBatchBeast.hta".)

You can download HandbrakeCLI.exe from https://handbrake.fr/downloads2.php

If you're converting a large folder (say 100 files or more), you may find it useful to run the "AddIETimeOutRegKey.bat" file. This will add a key to the registry which will prevent the "This page is unresponsive" messages from appearing while the program is running. 

The registry fix mentioned above is based on the following:
https://support.microsoft.com/en-us/help/175500/error-message-a-script-on-this-page-is-causing-internet-explorer-to-ru#FixItForMeAlways


The program makes use of 6 HTA's altogther:
 -Config HTA
 -Status HTA
 -4 'Worker' HTAs
 
 The program scans the source folder for all files. It then compares the source folder files with the destination folder files to see if any of the source files exist in the destination folder already.If not, the program queues the files for conversion.
 
The 4 worker HTAs then work through the conversion queue. If periodic scanning is enabled then the program will run at the chosen interval.
