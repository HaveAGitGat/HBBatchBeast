// // squirrel cage, part of installer

//  //handle setupevents as quickly as possible
//  const setupEvents = require('./installers/setupEvents')
//  if (setupEvents.handleSquirrelEvent()) {
//     // squirrel event handled and app will exit in 1000ms, so don't do anything else
//     return;
//  }




//require electron module
const electron = require('electron')

//core node js module
const url = require('url');

const path = require('path');

const { app, BrowserWindow, Menu, ipcMain ,Tray} = electron;


//declare main window limited to in scope to this block
let mainWindow;

//SET ENV
//process.env.NODE_ENV = "production";



//listen for app to be ready


var appIcon

app.on('ready', function () {

    //create new window

    mainWindow = new BrowserWindow({
        width: 1400,
        height: 1000,
   //    frame: false,
        title: 'HBBatchBeast'


    });

    //Load html into window

    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'mainWindow.html'),
        protocol: 'file:',
        slashes: true

    }));

    // //Quit app when closed
    // mainWindow.on('closed', function () {
    //     app.quit();

    // });


    //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert menu
    Menu.setApplicationMenu(mainMenu);


if(process.platform=='win32'){

 appIcon = new Tray(iconpath)

    var contextMenu = Menu.buildFromTemplate([
        {
            label: 'Show', click: function () {
                mainWindow.show()
            }
        },
             {

             label: 'Clear notification', click: function () {
                
                 appIcon.setImage(iconpath);
               
            }
        },
        {
            label: 'Quit', click: function () {
                app.isQuiting = true
                app.quit()
            }
        }
   
    ])

    appIcon.setContextMenu(contextMenu)

    mainWindow.on('close', function (event) {
        mainWindow = null
    })

    mainWindow.on('minimize', function (event) {
        event.preventDefault()
        mainWindow.hide()
    })

mainWindow.on('show', function () {
appIcon.setHighlightMode('always')


//appIcon.setImage(iconpath);
    })

//appIcon.setToolTip('Error!');
}

});

 

if(process.platform=='win32'){
 var platform = "win"
 var iconpath = path.join(__dirname, '.\\assets\\icons\\win\\icon.ico')
var type = "ico"
//var iconpath = "./assets/icons/win/icon.ico"
}

    if(process.platform == 'linux' ){
 var platform = "png"
 var type ="png"
 var iconpath = "./assets/icons/png/icon.png"

    }
    
    if( process.platform == 'darwin'){
 var platform = "mac"
 var type = "icns"
var iconpath = "./assets/icons/mac/icon.icns"

    }

//Catch icon updates
ipcMain.on('item:add',function(e,item){

    //  console.log(item);

var icon = path.join(__dirname, '.\\assets\\icons\\'+platform+'\\'+item+'.ico')

//var icon ="./assets/icons/"+platform+"/"+item+"."+type;
appIcon.setImage(icon);

  
  });



  


  
  
  







//Create menu template

const mainMenuTemplate = [



    {
        label: 'File',

        submenu: [


            {
                label: 'Quit',
                accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',

                click() {
                    app.quit();
                }

            }

        ]

    }
];



//If mac, add empty object to menu

if (process.platform == 'darwin') {

    //adds on empty object '{}' to beginning of array. Need this part for Macs so 'file' shows in top right of main window
    mainMenuTemplate.unshift({});

}

//Add developer tools item if not in production

if (process.env.NODE_ENV !== 'production') {
    mainMenuTemplate.push({
        label: 'Developer Tools',
        submenu: [
            {
                label: 'Toggle DevTools',
                accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: 'reload'
            }
        ]

    });


}


//Catch item:add

ipcMain.on('item:add', function (e, item) {

    //  console.log(item);

    
  







});


