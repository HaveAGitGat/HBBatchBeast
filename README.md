# HBBatchBeast for HandBrake and FFmpeg/FFprobe (Windows, macOS, Linux & Docker)

[![Reddit](https://img.shields.io/badge/Reddit-HBBatchBeast-FF5700.svg?style=flat-square)](https://www.reddit.com/r/HBBatchBeast/)     [![paypal](https://img.shields.io/badge/-donate-green.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=97L64UK77NTZL&source=url)    [![Discord](https://img.shields.io/badge/Discord-Chat-green.svg)](https://discord.gg/MSsgDqJ)    [![Docker](https://img.shields.io/badge/docker%20build-passing-green.svg)](https://hub.docker.com/r/haveagitgat/hbbatchbeast)    



![Screenshot](https://i.imgur.com/pSNJFSj.png)

Demo video - https://youtu.be/mHMXfInoqfE

Contact: HBBatchBeast@gmail.com
Website: http://hbbatchbeast.io/

A free GUI application for HandBrake and FFmpeg/FFprobe on Windows, macOS and Linux (+ Linux Docker image) with an emphasis on multi HandBrake/FFmpeg instance batch conversion (including recursive folder scans and folder watching). The destination folder structure is kept the same as the source folder structure. Media in subfolders is also converted. Multiple folders can be monitored and different conversion presets can be specified for each folder. Also included:

-Remote monitoring feature to monitor batch file conversions in any browser

-Basic h265 benchmarking

-Health check feature which can scan for corrupt video files using HandBrake (quick scan) or FFmpeg (thorough scan), although this is not always accurate. Attempt repair file feature included too. 

This is a standalone program on Windows but requires HandBrakeCLI to be installed on Linux and Mac.For a server application with similar functionality please see Tdarr. 



Settings help is available by pressing the blue ? diamond icons spread throughout the program:

![Screenshot](https://i.imgur.com/qwxlJkX.png)

-------------------------------------------------------------
INSTALLATION - Windows:

Step 1:Download hbbatchbeast-Windows.7z from the release page and extract  it:

https://github.com/HaveAGitGat/HBBatchBeast/releases

Step 2:Run HBBatchBeast.exe

-----------------------------------------------------------------------------


INSTALLATION - macOS:

Step 1: Make sure you have HandBrakeCLI installed. The easiest way is using Hombrew. Do the following.

a.Copy the following line into a terminal:

**/usr/bin/ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"**

Press enter and wait for it to complete.

b.Copy the following line into a terminal:

**brew install handbrake**

Press enter and wait for it to complete.

Step 2:Download hbbatchbeast-macOS.dmg from the release page:

https://github.com/HaveAGitGat/HBBatchBeast/releases

Step 3:Install the package

Step 4:Run hbbatchbeast from Launchpad

-----------------------------------------------------------------------------

INSTALLATION - Linux:

Step 1: Make sure you have HandBrakeCLI installed - do the following:


a.Copy the following line into a terminal:

**sudo add-apt-repository ppa:stebbins/handbrake-releases**

Press enter and wait for it to complete.

b.Copy the following line into a terminal:

**sudo apt-get update**

Press enter and wait for it to complete.

c.Copy the following line into a terminal:

**sudo apt-get install handbrake-cli handbrake-gtk**

Press enter and wait for it to complete.



Step 2:Download hbbatchbeast-Linux.deb from the release page:

https://github.com/HaveAGitGat/HBBatchBeast/releases

Step 3:Install the package

Step 4:Run hbbatchbeast 

-----------------------------------------------------------------------------

INSTALLATION - Docker (Linux host required):

Step 1: Open up a terminal and pull the HBBatchBeast Docker image using the following command (may take some time):

**docker pull haveagitgat/hbbatchbeast**

Step 2: Configure and run the HBBatchBeast Docker container using the following command:

**docker run -ti --rm \
       -e DISPLAY=unix$DISPLAY \
       --privileged \
       --volume $XAUTH:/root/.Xauthority \
       --volume /tmp/.X11-unix:/tmp/.X11-unix \
       -v /home/$USER/Documents:/home/developer/Documents \
       -v /media/mount/Video:/home/developer/Documents/HBBatchBeast/Media \
        haveagitgat/hbbatchbeast**
   
Generally, the only line you need to change in the above is line 7:

-v /media/mount/Video:/home/developer/Documents/HBBatchBeast/Media \ 

Change '/media/mount/Video' to the location of your media on your host machine. You'll be able to navigate to those files by going to '/home/developer/Documents/HBBatchBeast/Media' while using the Docker container. Map more volumes if necessary.

To close HBBatchBeast, close the application window and then use Ctrl+C to end the process in the terminal.

-----------------------------------------------------------------------------


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
