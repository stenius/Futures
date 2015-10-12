var app = require('app');  // Module to control application life.
var BrowserWindow = require('browser-window');  // Module to create native browser window.
var Tray = require('tray');  // Module to create native browser window.
var Menu = require('menu');

// Report crashes to our server.
require('crash-reporter').start();

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is GCed.
var mainWindow = null;
var appIcon = null;

// Quit when all windows are closed.
app.on('window-all-closed', function() {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform != 'darwin') {
    app.quit();
  }
});

var logToBrowser = function() {
if (mainWindow && mainWindow !== null) {
var baseArgs = ['console.log']
mainWindow.webContents.send.apply(mainWindow.webContents, baseArgs.concat([].slice.call(arguments)))
}
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.on('ready', function() {
  // Create the browser window.
  //mainWindow = new BrowserWindow({width: 800, height: 900, icon: 'stats100.png'});
  mainWindow = new BrowserWindow({
    width: 800,
    // height: 650,
    height: 900,
    icon: 'stats100.png',
	center: true,
	'skip-taskbar': true,
	frame: false,
	show: false
  });
  appIcon = new Tray('stats100.png');
  appIcon.setTitle('Futures');
  //var contextMenu = new Menu();
  //contextMenu.append(new MenuItem({ label: 'MenuItem1', click: function() { console.log('item 1 clicked'); } }));

  var contextMenu = Menu.buildFromTemplate([
    { label: 'Show/Hide Venmo',
      //type: 'radio',
      click: function(){
		if (mainWindow.isVisible()) {
		  mainWindow.hide()
		} else {
		  //mainWindow.setPosition(parseInt(bounds.x + (bounds.width / 2) - 400), bounds.y + bounds.height)
		  mainWindow.show()
		}
      }
    },
  ]);
  //appIcon.setToolTip('This is my application.');
  appIcon.setContextMenu(contextMenu);

  appIcon.on('clicked', function(e, bounds) {
    logToBrowser('app icon clicked', e)
    logToBrowser('app icon clicked', bounds)
    console.log(bounds)
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow.setPosition(parseInt(bounds.x + (bounds.width / 2) - 400), bounds.y + bounds.height)
      mainWindow.show()
    }
  })





  // and load the index.html of the app.
  mainWindow.loadUrl('file://' + __dirname + '/index.html');

  // Open the devtools.
  mainWindow.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function() {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
});
