// System tray functionality (placeholder for future implementation)
// Tauri v2 tray implementation would go here

use tauri::{
    tray::{TrayIcon, TrayIconBuilder},
    menu::{Menu, MenuItem},
    AppHandle, Manager,
};

pub fn setup_tray(app: &AppHandle) -> Result<TrayIcon, Box<dyn std::error::Error>> {
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
    let show = MenuItem::with_id(app, "show", "Show Window", true, None::<&str>)?;

    let menu = Menu::with_items(app, &[&show, &quit])?;

    let tray = TrayIconBuilder::new()
        .menu(&menu)
        .tooltip("RunHub")
        .on_menu_event(|app, event| {
            match event.id.as_ref() {
                "quit" => {
                    app.exit(0);
                }
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(tray)
}
