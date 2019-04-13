This is an electron application:https://electronjs.org/


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
