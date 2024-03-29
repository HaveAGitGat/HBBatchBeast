# HBBatchBeast for HandBrake and FFmpeg/FFprobe (Windows, macOS, Linux & Docker)

[![Reddit](https://img.shields.io/badge/Reddit-HBBatchBeast-FF5700.svg?style=flat-square)](https://www.reddit.com/r/HBBatchBeast/)     [![paypal](https://img.shields.io/badge/-donate-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=L5MWTNDLLB6AC&source=url)    [![Discord](https://img.shields.io/badge/Discord-Chat-green.svg)](https://discord.gg/X4khmE96hS)    [![Docker](https://img.shields.io/badge/docker%20build-passing-green.svg)](https://hub.docker.com/r/haveagitgat/hbbatchbeast)    


<h2>
<a class="gumroad-button" href="https://github.com/HaveAGitGat/HBBatchBeast/wiki/2-Installation">Setup/Installation</a>
</h2>  


![Screenshot](https://i.imgur.com/pSNJFSj.png)

Demo video - https://youtu.be/mHMXfInoqfE


Discord: https://discord.gg/X4khmE96hS

A free GUI application for HandBrake and FFmpeg/FFprobe on Windows, macOS and Linux (+ Linux Docker image) with an emphasis on multi HandBrake/FFmpeg instance batch conversion (including recursive folder scans and folder watching). The destination folder structure is kept the same as the source folder structure. Media in subfolders is also converted. Multiple folders can be monitored and different conversion presets can be specified for each folder. Also included:

-Remote monitoring feature to monitor batch file conversions in any browser

-Basic h265 benchmarking

-Health check feature which can scan for corrupt video files using HandBrake (quick scan) or FFmpeg (thorough scan), although this is not always accurate. Attempt repair file feature included too. 

This is a standalone program on Windows but requires HandBrakeCLI to be installed on Linux and Mac. For a server application with similar functionality please see [Tdarr](https://github.com/HaveAGitGat/Tdarr). 



Settings help is available by pressing the blue ? diamond icons spread throughout the program:

![Screenshot](https://i.imgur.com/qwxlJkX.png)


The program scans the source folders for all files. It then compares the source folder files with the destination folder files to see if any of the source files exist in the destination folder already. If not, the program queues the files for conversion.
 
4 worker modules (default number) then work through the conversion queue. If periodic scanning is enabled then the program will run at the chosen interval.

After it a bit more testing it seems that weird things can happen if you monitor a folder which is being downloaded to. It seems sometimes conversions start before a file has fully downloaded. To solve this, I recommend using a temporary download folder before moving completed files into your HBBB source folder.

If you use a download program which has an 'incomplete downloads' folder etc, do not put that folder inside your main source folder else you may end up converting each file twice.

The program won't work properly if you put the destination folder in a folder inside the source folder because the program is recreating the source folder structure inside the destination folder. It will cause an infinite loop of creating more and more sub-folders each time you run the program. So it will NOT work properly if you do something like this:

Source:

D:\Videos

Destination:

D:\Videos\Converted

It will work properly if you do something like this etc:

Source:

D:\Videos

Destination:

D:\Converted
