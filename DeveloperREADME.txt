This is an electron application:https://electronjs.org/


Make sure to have nodejs installed:https://nodejs.org/en/


If you haven't already, make sure to download Git:https://git-scm.com/downloads

Once Git is installed, right click on a folder you'd like to install this repository in, select "Git Bash Here"
and then use the following command to clone the repository:

git clone https://github.com/HaveAGitGat/HBBatchBeast


The repository is left in the "Production" state most of the time so, before working on the project, make sure to
change several scripts into the development state for easier editing/testing. Just comment out the following line:

  process.env.NODE_ENV = "production";
  
You'll find the above line at the top of the "mainWindow.html", "main.js" and "worker1.js" files. 

Once the above has been done, you'll need to install all the extra dependencies. Open up a Bash terminal and navigate to
the second "HBBatchBeast" folder which contains the main.js file. In the terminal, type:

npm install

Once that's finished, it's worth updating any dependencies with:

npm update



To run the program in the testing environment, use the following command:

npm start



To package up the program, make sure to re-enable the the "process.env.NODE_ENV = "production"" lines mentioned 
above and then do the following:

Windows packaging command:
npm run package-win

The above command will produce folder "HBBatchBeast\HBBatchBeast\release-builds\hbbatchbeast-win32-ia32".

You'll need to add the HandbrakeCLI.exe to "hbbatchbeast-win32-ia32" in order for everything to work. Aside from
that, everything else is ready to go so there's no need to create an installer, unlike on macOS and Linux.


Linux packaging command:
npm run package-linux

Linux installer command:
npm run create-debian-installer

The above will create an installer in "HBBatchBeast\HBBatchBeast\release-builds" on Linux.

macOS packaging command:
npm run package-mac

macOS installer command:
npm run create-installer-mac


Likewise, the above will create an installer in "HBBatchBeast\HBBatchBeast\release-builds" on macOS.


HBBB is a multithreaded process with the following core methodology:

"mainWindow.html" acts as the main window GUI and hands off the majority of commands to other processes. "main.js"
is currently only used when launching the program or when using inter-process communication (IPC) for updating the task bar
icon.

"mainWindow.html" takes user input and hands this information off to "queueBuild.js" using IPC. "mainWindow.html" is then free
to be interacted with as it waits for a response from "queueBuild.js".


Once "queueBuild.js" is finished compiling a "Health Check", "Scan" "Conversion" queue it notifies "mainWindow.html" of the 
results. "mainWindow.html" then forks several child processes (depending on how many worker threads have been specified) and, 
using IPC, manages the file queue while keeping all worker threads in sync.







