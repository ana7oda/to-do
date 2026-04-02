import { app, shell, BrowserWindow, ipcMain, Tray, Menu, screen, Notification, globalShortcut } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/favicon.ico?asset'
import { autoUpdater } from 'electron-updater'
import { dialog } from 'electron'

// تعريف المتغيرات هنا عشان تفضل شغالة في الخلفية وماتتمسحش من الذاكرة
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
autoUpdater.autoDownload = true
autoUpdater.autoInstallOnAppQuit = true

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 320,
    height: 500,
    show: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    autoHideMenuBar: true,
    skipTaskbar: true, // 🌟 دي بتشيل البرنامج من شريط المهام تحت
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

 mainWindow.on('ready-to-show', () => {
    // لو التطبيق اشتغل تلقائياً مع الويندوز (في الخلفية)، ماتظهروش في وش المستخدم
    if (!process.argv.includes('--hidden')) {
      mainWindow?.show()
    }
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  createWindow()

  // 🌟 1. التشغيل التلقائي مع الويندوز (بصمت)
  app.setLoginItemSettings({
    openAtLogin: true,
    args: ['--hidden'] // المعامل ده اللي بيعرفنا إنه شغال مع البوت عشان نخبيه
  })

  // 🌟 2. الاختصار السحري (Alt + Space)
  globalShortcut.register('Alt+Space', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide()
      } else {
        mainWindow.show()
        mainWindow.focus() // السطر ده مهم عشان الكيبورد يكتب جوا البرنامج فوراً
      }
    }
  })

  // 🌟 إعداد الأيقونة جنب الساعة (System Tray)
  tray = new Tray(icon)
  
  // القائمة اللي بتظهر لما تضغط كليك يمين على الأيقونة
  const contextMenu = Menu.buildFromTemplate([
    { label: 'إظهار OdexAi Tasks', click: () => mainWindow?.show() },
    { type: 'separator' },
    { label: 'إغلاق نهائي', click: () => app.quit() }
  ])
  
  tray.setToolTip('OdexAi Tasks')
  tray.setContextMenu(contextMenu)

  // لما تضغط كليك شمال على الأيقونة، البرنامج يظهر أو يختفي
  tray.on('click', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide()
    } else {
      mainWindow?.show()
    }
  })

  // 🌟 أمر الإخفاء اللي هييجي من الرياكت لما تدوس على (×)
  ipcMain.on('hide-window', () => {
    mainWindow?.hide()
  })

 // أمر تصغير/تكبير النافذة (الطي)
  ipcMain.on('toggle-collapse', (_, isCollapsed) => {
    if (mainWindow) {
      // 1. الخدعة: نسمح بتغيير الحجم مؤقتاً عشان الويندوز يقبل الأمر ومايعملش بلوك
      mainWindow.setResizable(true)
      
      // 2. نجبر الويندوز يفك أي Snap أو تثبيت في الحواف
      mainWindow.restore()
      mainWindow.unmaximize()

      // 3. نغير الحجم لـ الشريط الصغير أو القائمة الكاملة
      if (isCollapsed) {
        mainWindow.setSize(320, 60)
      } else {
        mainWindow.setSize(320, 500)
      }

      // 4. نرجع نمنع تغيير الحجم تاني فوراً
      mainWindow.setResizable(false)
    }
  })

  // 🌟 إنشاء نافذة الإشعار المخصصة والإشعار الأصلي
  ipcMain.on('show-notification', (_, taskText) => {
    
    // 1. إرسال إشعار الويندوز الأصلي (Native) عشان يتحفظ في مركز الإشعارات (Action Center)
    if (Notification.isSupported()) {
      new Notification({
        title: '🚀 OdexAi Tasks',
        body: taskText,
        icon: icon // بيستخدم اللوجو بتاع التطبيق
      }).show()
    }

    // 2. إنشاء النافذة المنبثقة الشفافة بتاعتك (Custom Popup)
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    
    const notifWindow = new BrowserWindow({
      width: 320,
      height: 100,
      x: width - 330, // أقصى اليمين
      y: height - 110, // أسفل الشاشة (فوق شريط المهام)
      frame: false,
      transparent: true,
      alwaysOnTop: true,
      skipTaskbar: true,
      resizable: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })

    // توجيه النافذة لمسار الإشعار
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      notifWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] + '#notification')
    } else {
      notifWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'notification' })
    }

    // إرسال اسم المهمة للنافذة الجديدة
    notifWindow.webContents.on('did-finish-load', () => {
      notifWindow.webContents.send('notification-data', taskText)
    })

    // إغلاق الإشعار تلقائياً بعد 6 ثواني
    setTimeout(() => {
      if (!notifWindow.isDestroyed()) notifWindow.close()
    }, 6000)
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  // 🌟 1. اسأل السيرفر: فيه تحديث؟
  autoUpdater.checkForUpdates()

  // 🌟 2. لما التحديث ينزل بالكامل في الخلفية، طلع رسالة للمستخدم
  autoUpdater.on('update-downloaded', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'تحديث جديد جاهز! 🚀',
      message: `تم تحميل الإصدار الجديد (${info.version}) من OdexAi Tasks.`,
      buttons: ['تثبيت الآن وإعادة التشغيل', 'لاحقاً'],
      defaultId: 0,
      cancelId: 1
    }).then((result) => {
      // لو المستخدم اختار "تثبيت الآن"
      if (result.response === 0) {
        autoUpdater.quitAndInstall()
      }
    })
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})